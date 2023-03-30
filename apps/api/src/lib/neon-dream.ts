import fetch from 'node-fetch';

export async function neonDreamGenerate(
  prompt: string,
  token: string
): Promise<{ id: string }[]> {
  const resp = await fetch(`https://neon-dream.lipsumar.io/jobs`, {
    method: 'post',
    body: JSON.stringify({
      prompt,
      token,
    }),
    headers: {
      'content-type': 'application/json',
    },
  });
  if (resp.ok) {
    return resp.json();
  }
  throw new Error(
    `neon-dream responded with ${resp.status} ${resp.statusText}`
  );
}

export async function neonDreamCheckJob(
  jobId: string
): Promise<{ completedAt: null | string; url: null | string; status: string }> {
  const resp = await fetch(`https://neon-dream.lipsumar.io/jobs/${jobId}`);
  if (resp.ok) {
    return resp.json();
  }
  throw new Error('error fetching job');
}
