import axios from "axios";
import { ChatMessage, LLMService } from "../llm-service";
// import fetch from 'node-fetch';

// OpenAI 的实现
export class LikeOpenAIService extends LLMService {
    // https://api.openai.com/v1
    private baseUrl: string;
    private apiKey: string;
    private model: string;

    constructor(baseUrl: string, apiKey: string, model: string) {
        super();
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.model = model;
    }

    // 阻塞调用
    async chatSync(messages: ChatMessage[]): Promise<string> {
        const response = await axios.post(this.baseUrl + '/chat/completions', {
            model: this.model,
            messages: messages
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            }
        });
        return response.data.choices[0].message.content;
    }

    // 流式调用
    // async chatStream(messages: ChatMessage[], onData: (data: string) => void): Promise<void> {
    async *chatStream(messages: ChatMessage[]): AsyncGenerator<string> {
        const response = await axios.post(this.baseUrl + '/chat/completions', {
            model: this.model,
            messages: messages,
            stream: true
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            responseType: 'stream'
        });

        // 处理流式数据
        const reader = response.data;
        
        for await (const chunk of reader) {
            const text = chunk.toString();
            yield text;
        }
    }
}
