import { TranslateService } from '../translate-service';
import { LLMService, ChatMessage } from '../llm-service';

export class LLMTranslateService implements TranslateService {
    private llmService: LLMService;

    constructor(llmService: LLMService) {
        this.llmService = llmService;
    }

    async translate(text: string, language: string): Promise<string> {
        const messages: ChatMessage[] = [
            {
                role: 'system',
                content: `You are a professional translator. Please translate the following text into ${language}. Only return the translated text without any explanation.`
            },
            {
                role: 'user',
                content: text
            }
        ];

        return await this.llmService.chatSync(messages);
    }
}
