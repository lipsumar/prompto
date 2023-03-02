import LangGraph from '../src/core/LangGraph';
import LangNode from '../src/core/LangNode';
import createImageNode from '../src/nodes/image';
import createImageGeneratorNode from '../src/nodes/image-generator';
import createTextNode from '../src/nodes/text';

describe('graph', () => {
  test('text -> image-generator -> image', async () => {
    const graph = new LangGraph();
    graph.addNode(
      createTextNode('t', { config: { text: 'some image prompt' } })
    );
    graph.addNode(createImageGeneratorNode('dalle', { config: {} }));
    graph.createEdge({
      id: 'lkj',
      fromId: 't',
      toId: 'dalle',
    });

    graph.addNode(createImageNode('img', { config: { image: '' } }));
    graph.createEdge({ id: 'dalle-img', fromId: 'dalle', toId: 'img' });

    const res = await graph.executeNode('img', {
      apiInput: {},
      openaiApiKey: 'kj',
    });
    expect(res).toEqual({
      default: { value: expect.any(String), type: 'image' },
    });
    expect(res.default.value).toMatch(/^https/);
  });
});
