import { Configuration, OpenAIApi } from 'openai';
import type { CreateCompletionResponse, CreateCompletionRequest } from 'openai';

function getFirstChoiceText(data: CreateCompletionResponse): string | null {
  if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
    return data.choices[0].text || null;
  }
  return null;
}

export async function gpt3Complete(
  prompt: string,
  apiKey: string,
  request: Partial<CreateCompletionRequest>
): Promise<string | null> {
  const configuration = new Configuration({ apiKey });
  const openai = new OpenAIApi(configuration);
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
    temperature: 0.7,
    max_tokens: 256,
    ...request,
  });
  const maybeText = getFirstChoiceText(response.data);
  return maybeText ? maybeText.trim() : null;
}
