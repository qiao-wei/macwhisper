import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { WhisperASRService } from './services/impl/whisper-asr-service'
import { ASRService } from './services/asr-service'
import { LikeOpenAIService } from './services/impl/like-openai-llm-service'
import { LLMService } from './services/llm-service'
import { LLMTranslateService } from './services/impl/llm-translate-service'
import { TranslateService } from './services/translate-service'
import ffmpeg from 'fluent-ffmpeg'
import { spawn } from 'child_process'

// let transcriptionProcess: any = null
let asrService: ASRService | undefined = undefined

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    if (asrService) {
      console.log('Window closed, terminating transcription process...');
      asrService.stopTranscription();
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const ffmpegPath = is.dev
    ? path.join(__dirname, '../../resources/tools/ffmpeg')
    : path.join(process.resourcesPath, 'tools/ffmpeg');

  ffmpeg.setFfmpegPath(ffmpegPath)

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  const apiKey = "sk-vR7AcspkZvxTNh01IurmwykxcdVdQgwGmTiFS3UZ3N1VbuHi";
  const model = "gpt-4o-2024-08-06";
  const llmService: LLMService = new LikeOpenAIService("https://api.302.ai/v1", apiKey, model);

  ipcMain.on('translate-text', async (event, { texts, language, concurrency }: { texts: any[], language: string, concurrency: number }) => {
    const translateService: TranslateService = new LLMTranslateService(llmService);

    const win = BrowserWindow.fromWebContents(event.sender);

    // const pLimit = require('p-limit');
    const pLimit = await import('p-limit').then(module => module.default);
    const limit = pLimit(concurrency)

    const promises = texts.map(text =>
      limit(async () => {
        // const result = await llmService.chatSync([{ role: "user", content: text.content }]);
        const result = await translateService.translate(text.content, language)
        console.log('index:', text.index, 'result:', result);
        text.translated_content = result;
        if (!win?.isDestroyed()) {
          win?.webContents.send('on-translated', text);
        }
      })
    );

    await Promise.all(promises);
    console.log("translatet finished")
  });

  // 监听 whisper 事件，接收数据
  ipcMain.on('transcribe-audio', (event, { modelSize, audioFile, language, isUseGPU }) => {
    // console.log('Received message:', audioFile);
    // console.log('Received details:', language);
    // console.log('Received details:', isUseGPU);
    console.log('开始分离音视频:', audioFile);
    ffmpeg(audioFile)
      .noVideo()  // 移除视频流，提取音频
      .audioCodec('pcm_s16le')  // 设置音频编码为 16 位 PCM
      .audioFrequency(16000)  // 设置音频采样率为 16k
      .save('/tmp/output_audio.wav')  // 输出音频文件

    audioFile = '/tmp/output_audio.wav'
    console.log('开始提取字幕:', audioFile);
    const win = BrowserWindow.fromWebContents(event.sender);
    if (asrService) {
      return;
    }

    asrService = new WhisperASRService(modelSize, isUseGPU);

    // // Listen for a 'stop-transcription' event to terminate the process
    ipcMain.once('stop-transcription', () => {
      console.log('Received stop command, terminating process...');
      if (asrService) {
        console.log('stopTranscription');
        asrService.stopTranscription();
        asrService = undefined;
      }
    });
    const onData = (result: string) => {
      console.log('result:', result);
      if (!win?.isDestroyed()) {
        win?.webContents.send('on-transcribing', result);
      }
    }
    const onError = (error: string) => {
      console.error(error);
    }
    const onClose = (code: number) => {
      console.log(`Process exited with code ${code}`);
      ipcMain.removeAllListeners('stop-transcription');
      if (!win?.isDestroyed()) {
        win?.webContents.send('on-transcribing', "end");
      }
      asrService = undefined;
    }
    asrService.transcribe(
      { audioFile, language },
      onData,
      onError,
      onClose,
    );
  });

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Forcefully terminate the transcription process when the app quits
app.on('will-quit', () => {
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
