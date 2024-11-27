// TTS请求参数接口
interface TTSRequest {
  text: string;                    // 要转换的文本内容
  language?: string;               // 语音语言，例如 "en-US", "zh-CN"
  voice?: string;                  // 语音名称或风格（如果支持多个）
  format?: "mp3" | "wav" | "ogg";  // 音频格式
  rate?: number;                   // 语速，1.0表示正常速度
  pitch?: number;                  // 音高，1.0表示正常音高
}

// TTS响应接口
interface TTSResponse {
  success: boolean;                // 请求是否成功
  audioData?: Buffer;              // TTS生成的音频数据，以Buffer形式返回
  errorMessage?: string;           // 错误信息（如果请求失败）
}

// TTS服务接口
interface TTSService {
  synthesize(request: TTSRequest): Promise<TTSResponse>;
}
