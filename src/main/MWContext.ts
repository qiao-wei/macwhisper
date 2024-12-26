import { ASRService } from "./services/asr-service";
import { WhisperASRService } from "./services/impl/whisper-asr-service";

export class MWContext {
    public static asrService(): ASRService {
        return new WhisperASRService("tiny", false);
    }
}