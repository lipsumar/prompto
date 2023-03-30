import { BlueprintNode, type ExecutionContext } from '@lipsumar/blueprintjs';
import schema from './AddToFolderNode.json';
import autoWireSchema from './autoWireSchema';
import { NodeSchema } from './types';
import { prisma } from '../prisma';

export class AddToFolderNode extends BlueprintNode {
  constructor() {
    super();
    autoWireSchema(schema as NodeSchema, this, { exec: this.execute });
  }

  async execute(ctx: ExecutionContext): Promise<void> {
    const dataObject = ctx.inputs().value;
    await prisma.dataObjects.create({
      data: {
        type: dataObject.type,
        value: JSON.stringify(dataObject.value),
        userFolderId: ctx.input<string>('userFolderId'),
      },
    });
    ctx.triggerPulse('done');
    ctx.done();
  }
}
