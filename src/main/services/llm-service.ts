export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
  
export abstract class LLMService {
    // 阻塞调用
    abstract chatSync(messages: ChatMessage[]): Promise<string>;

    // 流式调用
    abstract chatStream(messages: ChatMessage[]): AsyncGenerator<string>;

}