import LangNode from '../core/LangNode';

export type FolderNodeOptions = {
  folderId: string;
};

export default function createFolderNode(
  id: string,
  {
    config,
  }: {
    config: FolderNodeOptions;
  }
) {
  return new LangNode({
    id,
    async execute(inputs, ctx) {
      await ctx.folderStorage.insert(config.folderId, inputs.default);
      return {};
    },
    outputs: {},
    inputs: { default: 'string' },
  });
}
