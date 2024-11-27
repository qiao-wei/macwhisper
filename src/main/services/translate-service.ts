export interface TranslateService {
    translate(text: string, language: string): Promise<string>;
}