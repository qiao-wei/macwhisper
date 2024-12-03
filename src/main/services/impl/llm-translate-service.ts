import { TranslateService } from '../translate-service';
import { LLMService, ChatMessage } from '../llm-service';

export class LLMTranslateService implements TranslateService {
    private llmService: LLMService;
    private sysPrompt: string = 'You are a professional translator. Please translate the following text into ${language}. Only return the translated text without any explanation.';
    private userPrompt: string = '${text}';

    constructor(llmService: LLMService, sysPrompt?: string, userPrompt?: string) {
        if(sysPrompt){
            this.sysPrompt = sysPrompt;
        }
        if(userPrompt){
            this.userPrompt = userPrompt;
        }
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
