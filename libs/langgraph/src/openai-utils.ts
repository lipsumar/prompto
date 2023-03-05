import {
  Configuration,
  CreateCompletionRequest,
  CreateImageRequest,
  OpenAIApi,
} from 'openai';

function getOpenAi(apiKey: string) {
  const configuration = new Configuration({
    apiKey,
  });
  return new OpenAIApi(configuration);
}

export async function dalle(opts: CreateImageRequest, apiKey: string) {
  const openai = getOpenAi(apiKey);
  const resp = await openai.createImage(opts);
  return resp.data;
}

export async function completion(
  opts: CreateCompletionRequest,
  apiKey: string
) {
  const openai = getOpenAi(apiKey);
  const resp = await openai.createCompletion(opts);
  return resp.data;
}
