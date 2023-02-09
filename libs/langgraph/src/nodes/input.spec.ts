import createInputNode from './input';

test('createInputNode', async () => {
  const node = createInputNode('a', { inputKey: 'foo' });
  expect(node.id).toBe('a');
  const out = await node.execute(
    {},
    { apiInput: { foo: { type: 'string', value: 'foo value' } } }
  );
  expect(out).toEqual({ default: { type: 'string', value: 'foo value' } });
});
