export abstract class AbstractAiProvider {
  abstract generateText(prompt: string): Promise<string>;
}
