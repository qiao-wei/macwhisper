class ElevenLabsTTSService implements TTSService {
  async synthesize(request: TTSRequest): Promise<TTSResponse> {
    try {
      // 调用TTS引擎的API或库来合成语音
      console.log(request)
      const audioData = Buffer.from("hello world")
      return { success: true, audioData };
    } catch (error) {
      let errorMessage = ""
      if (error instanceof Error) {
        console.error("An error occurred:", error.message); // 使用`error.message`
        errorMessage = error.message
      } else {
        console.error("An unknown error occurred");
        errorMessage = "An unknown error occurred"
      }
      return { success: false, errorMessage: errorMessage };
    }
  }
}
