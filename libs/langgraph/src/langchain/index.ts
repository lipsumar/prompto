import fetch from 'node-fetch';
import invariant from 'tiny-invariant';

type Routes = {
  'llms/OpenAI/generate': {
    params: {
      args: {
        openai_api_key: string;
        temperature?: number;
        n?: number;
        best_of?: number;
      };
      func: string[];
    };
    response: {
      generations: Array<{ text: string }>[];
    };
  };
  b: {
    params: {
      num: number;
    };
    response: {
      foo: string;
    };
  };
};

export async function langchain<K extends keyof Routes>(
  route: K,
  params: Routes[K]['params']
): Promise<Routes[K]['response']> {
  invariant(
    !!process.env.LANGCHAIN_API_BASE_URL,
    'LANGCHAIN_API_BASE_URL must be set'
  );
  const resp = await fetch(`${process.env.LANGCHAIN_API_BASE_URL}/${route}`, {
    body: JSON.stringify(params),
    method: 'post',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error('langchain API returned an error: ' + errText);
  }
  return resp.json();
}

// langchain('llms/openai/generate', {
//   args: { openai_api_key: '' },
//   func: ['kjh']
// }).then(resp => {

// })
