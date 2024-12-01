// 定义 ASR 请求的接口
export interface ASRRequest {
  audioFile: string; // 输入音频文件
  language?: string; // 可选：指定音频的语言，默认为自动检测
  // sampleRate?: number; // 可选：音频采样率，默认为 16000
}

// 定义 ASR 功能接口
export interface ASRService {
  // 语音识别函数，接收请求并返回识别结果或错误
  // transcribe(request: ASRRequest): Promise<ASRResult | ASRError>;
  transcribe(request: ASRRequest, onData: (result: string) => void, onError: (error: string) => void, onClose: (code: number) => void): void;

  // 可选：停止正在进行的语音识别任务
  stopTranscription(): void;

  // 可选：设置音频输入的参数（如采样率等）
  // setAudioParameters(sampleRate: number): void;
}
