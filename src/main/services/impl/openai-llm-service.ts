import { LikeOpenAIService } from "./like-openai-llm-service";

// OpenAI 的实现
export class OpenAIService extends LikeOpenAIService {
    constructor(apiKey: string, model: string) {
        super("https://api.openai.com/v1", apiKey, model);
    }
}
