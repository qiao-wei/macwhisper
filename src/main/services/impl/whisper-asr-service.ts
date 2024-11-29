import { is } from "@electron-toolkit/utils";
import { spawn } from "child_process";
import path from "path";
import { ASRRequest, ASRService } from "../asr-service";

export class WhisperASRService implements ASRService {
  private modelSize : string = "tiny";
  private subProcess;

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
    if(this.subProcess){
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
    this.subProcess = spawn(executablePath, args);

    this.subProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('out:' + output);
      // onData(output)
    });

    this.subProcess.stderr.on('data', (data) => {
      console.error(data.toString());
      // onError(data.toString())
    });

    this.subProcess.on('close', (code) => {
      this.subProcess = undefined;
      console.log(`Process closed with code ${code}`);
      // onClose(code)
    });

    this.subProcess.on('exit', (code) => {
      console.log(`Process exit with code ${code}`);
    });
  }

  // 可选：停止正在进行的语音识别任务
  stopTranscription(): void {
    // 方法体可在此处实现
    if(this.subProcess){
      this.subProcess.kill();
    }
  }

  // 可选：设置音频输入的参数（如采样率等）
  setAudioParameters(sampleRate: number): void {
    // 方法体可在此处实现
    console.log(sampleRate);
  }
}
