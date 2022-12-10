import { Classes, NonIdealState, Tree, TreeNodeInfo } from '@blueprintjs/core';
import { useCallback, useEffect, useReducer } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import { useEditor } from '../../hooks/useEditor';
import { trpc } from '../../lib/trpc';
import Spinner from '../Spinner';
import { inferRouterOutputs } from '@trpc/server';
import { AppRouter } from 'api';

type RouterOutput = inferRouterOutputs<AppRouter>;
type PromptsInProject = Exclude<RouterOutput['prompt']['inProject'], null>;
type Prompt = PromptsInProject[0];

type NodePath = number[];
type TreeAction =
  | {
      type: 'SET_IS_EXPANDED';
      payload: { path: NodePath; isExpanded: boolean };
    }
  | { type: 'DESELECT_ALL' }
  | {
      type: 'SET_IS_SELECTED';
      payload: { path: NodePath; isSelected: boolean };
    }
  | { type: 'SET_ALL'; payload: TreeNodeInfo[] };

function forEachNode(
  nodes: TreeNodeInfo[] | undefined,
  callback: (node: TreeNodeInfo) => void
) {
  if (nodes === undefined) {
    return;
  }

  for (const node of nodes) {
    callback(node);
    forEachNode(node.childNodes, callback);
  }
}

function forNodeAtPath(
  nodes: TreeNodeInfo[],
  path: NodePath,
  callback: (node: TreeNodeInfo) => void
) {
  callback(Tree.nodeFromPath(path, nodes));
}

function treeExampleReducer(state: TreeNodeInfo[], action: TreeAction) {
  switch (action.type) {
    case 'DESELECT_ALL':
      const newState1 = cloneDeep(state);
      forEachNode(newState1, (node) => (node.isSelected = false));
      return newState1;
    case 'SET_IS_EXPANDED':
      const newState2 = cloneDeep(state);
      forNodeAtPath(
        newState2,
        action.payload.path,
        (node) => (node.isExpanded = action.payload.isExpanded)
      );
      return newState2;
    case 'SET_IS_SELECTED':
      const newState3 = cloneDeep(state);
      forEachNode(newState3, (node) => (node.isSelected = false));
      forNodeAtPath(
        newState3,
        action.payload.path,
        (node) => (node.isSelected = action.payload.isSelected)
      );
      return newState3;
    case 'SET_ALL':
      return cloneDeep(action.payload);
    default:
      return state;
  }
}

function promptToTreeNodeInfo(
  prompt: Prompt,
  currentPromptId: string | undefined
): TreeNodeInfo {
  const label = prompt.name ||
    prompt.promptVersions[0]?.content
      .substring(0, 100)
      .trim()
      .replaceAll('\n', '↩') || (
      <span className={Classes.TEXT_MUTED}>&lt;Empty&gt;</span>
    );
  return {
    id: prompt.id,
    label,
    isSelected: prompt.id === currentPromptId,
  };
}

function getNodePath(
  nodeId: string,
  tree: TreeNodeInfo[],
  prevPath: NodePath = []
): NodePath | null {
  for (const [i, node] of tree.entries()) {
    if (node.id === nodeId) {
      prevPath.push(i);
      return prevPath;
    }
    if (node.childNodes) {
      prevPath.push(i);
      return getNodePath(nodeId, node.childNodes, prevPath);
    }
  }
  return null;
}

const INITIAL_STATE: TreeNodeInfo[] = [];

export default function PromptTree() {
  const { project, setCurrentPromptId, currentPromptId } = useEditor();
  const [nodes, dispatch] = useReducer(treeExampleReducer, INITIAL_STATE);
  const {
    data: prompts,
    isLoading,
    isError,
  } = trpc.prompt.inProject.useQuery(
    { projectId: project.id },
    {
      onSuccess: (data) => {
        dispatch({
          type: 'SET_ALL',
          payload: data.map((node) =>
            promptToTreeNodeInfo(node, currentPromptId)
          ),
        });
      },
    }
  );
  useEffect(() => {
    if (typeof currentPromptId === 'undefined') return;
    const path = getNodePath(currentPromptId, nodes);
    if (!path) return;
    dispatch({
      payload: {
        path,
        isSelected: true,
      },
      type: 'SET_IS_SELECTED',
    });
  }, [currentPromptId]);

  const handleNodeCollapse = useCallback(
    (_node: TreeNodeInfo, nodePath: NodePath) => {
      dispatch({
        payload: { path: nodePath, isExpanded: false },
        type: 'SET_IS_EXPANDED',
      });
    },
    []
  );

  const handleNodeExpand = useCallback(
    (_node: TreeNodeInfo, nodePath: NodePath) => {
      dispatch({
        payload: { path: nodePath, isExpanded: true },
        type: 'SET_IS_EXPANDED',
      });
    },
    []
  );

  const handleNodeClick = useCallback(
    (node: TreeNodeInfo, nodePath: NodePath) => {
      setCurrentPromptId(node.id as string);
    },
    []
  );

  if (isLoading) {
    return <Spinner />;
  }
  if (isError) {
    return (
      <NonIdealState
        title="Error"
        description="Something went wrong"
        icon="error"
      />
    );
  }
  if (prompts && prompts.length === 0) {
    return (
      <NonIdealState
        title="Prompts"
        description="Create a prompt to start"
        icon="document-open"
      />
    );
  }

  return (
    <Tree
      contents={nodes}
      onNodeClick={handleNodeClick}
      onNodeCollapse={handleNodeCollapse}
      onNodeExpand={handleNodeExpand}
      className={`${Classes.ELEVATION_0} height-100`}
    />
  );
}

/*
const INITIAL_STATE: TreeNodeInfo[] = [
  {
    id: 0,
    hasCaret: true,

    label: <span>Folder 0</span>,
  },
  {
    id: 1,

    isExpanded: true,
    label: <span>Folder 1</span>,
    childNodes: [
      {
        id: 2,
        icon: 'document',
        label: (
          <div className="multiline-ellipsis">
            Organic meditation gluten-free, sriracha VHS drinking vinegar beard
            man. Oh hey look this text continues like pretty long and shit
          </div>
        ),
      },
      {
        id: 2,
        icon: 'document',
        label: <div className="multiline-ellipsis">pretty short</div>,
      },
      {
        id: 3,
        hasCaret: true,
        icon: <Icon icon="document" className={Classes.TREE_NODE_ICON} />,
        label: (
          <div className="multiline-ellipsis">
            Organic meditation gluten-free, sriracha VHS drinking vinegar beard
            man. Oh hey look this text continues like pretty long and shit
          </div>
        ),
      },
    ],
  },
];
*/
