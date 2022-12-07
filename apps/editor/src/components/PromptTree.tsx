import { Classes, Icon, Intent, Tree, TreeNodeInfo } from '@blueprintjs/core';
import { useCallback, useReducer } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import { trpc } from '../lib/trpc';

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
    };

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
      forNodeAtPath(
        newState3,
        action.payload.path,
        (node) => (node.isSelected = action.payload.isSelected)
      );
      return newState3;
    default:
      return state;
  }
}

const INITIAL_STATE: TreeNodeInfo[] = [];

export default function PromptTree() {
  const [nodes, dispatch] = useReducer(treeExampleReducer, INITIAL_STATE);
  //trpc.prompt.inProject.useQuery({projectId});

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

  return (
    <Tree
      contents={nodes}
      // onNodeClick={handleNodeClick}
      onNodeCollapse={handleNodeCollapse}
      onNodeExpand={handleNodeExpand}
      className={Classes.ELEVATION_0}
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
