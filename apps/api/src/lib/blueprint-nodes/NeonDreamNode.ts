import { BlueprintNode, type ExecutionContext } from '@lipsumar/blueprintjs';
import schema from './NeonDreamNode.json';
import autoWireSchema from './autoWireSchema';
import { NodeSchema } from './types';
import { neonDreamCheckJob, neonDreamGenerate } from '../neon-dream';

export class NeonDreamNode extends BlueprintNode {
  constructor() {
    super();
    autoWireSchema(schema as NodeSchema, this, { exec: this.execute });
  }

  async execute(ctx: ExecutionContext): Promise<void> {
    const prompt = ctx.input<string>('prompt');
    const resp = await neonDreamGenerate(prompt, ctx.env('neonDreamApiToken'));
    let job;
    while (true) {
      job = await neonDreamCheckJob(resp[0].id);
      console.log(job);
      if (job.status === 'complete') {
        break;
      }
      if (job.status === 'error') {
        throw new Error('job error');
      }
      await pause(4000);
    }
    ctx.output('image', job.url);
    ctx.triggerPulse('done');
    ctx.done();
  }
}

function pause(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
