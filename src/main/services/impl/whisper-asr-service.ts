import { is } from "@electron-toolkit/utils";
import { spawn } from "child_process";
import path from "path";
import { ASRRequest, ASRService } from "../asr-service";

export class WhisperASRService implements ASRService {
  private modelSize : string = "tiny";
  private process;

  constructor(modelSize:string){
    this.modelSize = modelSize;
  }
  // 语音识别函数，接收请求并返回识别结果或错误
  // async transcribe(request: ASRRequest): Promise<ASRResult | ASRError> {
  transcribe(
    request: ASRRequest, 
    onData: (result: string) => void,
    onError: (error: string) => void,
    onClose: (code: number) => void,
  ) : void {
    if(this.process){
      onError("进程在处理中，请等待结束")
      return
    }
    // modelSize = "tiny";
    const executablePath = is.dev
      ? path.join(__dirname, '../../resources/tools/main')
      : path.join(process.resourcesPath, 'tools/main');

    const args = [
      '-m', path.join(__dirname, `../../../models/ggml-${this.modelSize}.bin`),
      '-l', request.language || '',
      '-f', request.audioFile || ''
    ];
    this.process = spawn(executablePath, args);

    this.process.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      // onData(output)
    });

    this.process.stderr.on('data', (data) => {
      console.error(data.toString());
      // onError(data.toString())
    });

    this.process.on('close', (code) => {
      this.process = undefined;
      console.log(`Process closed with code ${code}`);
      // onClose(code)
    });

    this.process.on('exit', (code) => {
      console.log(`Process exit with code ${code}`);
    });
  }

  // 可选：停止正在进行的语音识别任务
  stopTranscription(): void {
    // 方法体可在此处实现
    if(this.process){
      this.process.kill();
    }
  }

  // 可选：设置音频输入的参数（如采样率等）
  setAudioParameters(sampleRate: number): void {
    // 方法体可在此处实现
    console.log(sampleRate);
  }
}
