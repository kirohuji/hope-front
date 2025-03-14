import PropTypes from 'prop-types';
import { useState, useCallback, useEffect, useMemo, createContext } from 'react';
// @mui
import { LoadingButton } from '@mui/lab';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import TreeItem, { treeItemClasses } from '@mui/lab/TreeItem';
import { Stack } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import TreeView from '@mui/lab/TreeView';
import { alpha, styled } from '@mui/material/styles';
import { roleService } from 'src/composables/context-provider';
import { useSnackbar } from 'src/components/snackbar';
import _ from 'lodash';

const userContext = createContext({ selectedNodes: [], item: {}, setItem: null });

const bfsSearch = (graph, targetId) => {
  const queue = [...graph];

  while (queue.length > 0) {
    const currNode = queue.shift();
    if (currNode._id === targetId) {
      return currNode;
    }
    if (currNode.children) {
      queue.push(...currNode.children);
    }
  }
  return []; 
};

function getAllIds(node, idList = []) {
  idList.push(node._id);
  if (node.children) {
    node.children.forEach((child) => getAllIds(child, idList));
  }
  return idList;
}

const getAllChild = (permissions, _id) => getAllIds(bfsSearch(permissions, _id));

const getAllFathers = (permissions, _id, list = []) => {
  const node = bfsSearch(permissions, _id);
  if (node.parent) {
    list.push(node.parent);

    return getAllFathers(permissions, node.parent, list);
  }

  return list;
};

function isAllChildrenChecked(permissions, selectedNodes, selectedNodesNotChild, node, list) {
  const allChild = getAllChild(permissions, node._id);
  const nodeIdIndex = allChild.indexOf(node._id);
  allChild.splice(nodeIdIndex, 1);

  return allChild.every(
    (nodeId) =>
      selectedNodes.concat(list).includes(nodeId) ||
      selectedNodesNotChild.concat(list).includes(nodeId)
  );
}

const StyledTreeView = styled(TreeView)({
  height: 500,
  flexGrow: 1,
  width: '100%',
});

const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  [`& .${treeItemClasses.iconContainer}`]: {
    '& .close': {
      opacity: 0.3,
    },
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));

function StyledTreeItem(props) {
  const { selectedNodes, selectedNodesNotChild, label, node, isRoot, handleNodeSelect, ...other } =
    props;
  const isSelectedNodes = selectedNodes && selectedNodes.indexOf(node._id) !== -1;
  const isSelectedNodesNotChild =
    selectedNodesNotChild && selectedNodesNotChild.indexOf(node._id) !== -1;
  let isIndeterminate = false;
  if (!(isSelectedNodes || isSelectedNodesNotChild)) {
    isIndeterminate =
      _.intersection(
        (node?.children || []).map((c) => c._id),
        selectedNodes
      ).length > 0;
  }

  return (
    <StyledTreeItemRoot
      label={
        <>
          {!isRoot && (
            <Checkbox
              checked={isSelectedNodes || isSelectedNodesNotChild}
              tabIndex={-1}
              indeterminate={isIndeterminate}
              color={
                // eslint-disable-next-line no-nested-ternary
                isSelectedNodes ? 'primary' : isSelectedNodesNotChild ? 'warning' : 'primary'
              }
              disableRipple
              sx={{ textTransform: 'capitalize' }}
              onClick={(event) => handleNodeSelect && handleNodeSelect(event, node._id)}
            />
          )}
          {label}
        </>
      }
      {...other}
    />
  );
}

StyledTreeItem.propTypes = {
  selectedNodes: PropTypes.array,
  selectedNodesNotChild: PropTypes.array,
  label: PropTypes.string,
  node: PropTypes.object,
  isRoot: PropTypes.bool,
  handleNodeSelect: PropTypes.func,
};

List.propTypes = {
  data: PropTypes.object,
};

export function List({ data }) {
  const hasChild = data.children && !!data.children && data.children.length;
  return (
    <userContext.Consumer>
      {({ selectedNodes, selectedNodesNotChild, handleNodeSelect }) => (
        <StyledTreeItem
          nodeId={data._id}
          label={data.label}
          node={data}
          selectedNodesNotChild={selectedNodesNotChild}
          handleNodeSelect={handleNodeSelect}
          selectedNodes={selectedNodes}
        >
          {hasChild && <SubList data={data.children} />}
        </StyledTreeItem>
      )}
    </userContext.Consumer>
  );
}
SubList.propTypes = {
  data: PropTypes.array,
};

export function SubList({ data }) {
  return (
    <>
      {data.map((item) => (
        <List key={item._id} data={item} />
      ))}
    </>
  );
}

PermissionPanel.propTypes = {
  current: PropTypes.object,
  onClose: PropTypes.func,
  permissions: PropTypes.array,
};

export default function PermissionPanel({ permissions, current, onClose }) {
  const { enqueueSnackbar } = useSnackbar();
  
  const [loading, setLoading] = useState(true);

  const [selectedNodes, setSelectedNodes] = useState([]);

  const [selectedNodesNotChild, setSelectedNodesChild] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const getData = useCallback(async () => {
    setLoading(true);
    const children = await roleService.getChildrenRoleNames({
      _id: current._id,
    });
    const notChildren = await roleService.getInheritedRoleNamesOnly({
      _id: current._id,
    });
    setSelectedNodes(children.map((child) => child._id));
    setSelectedNodesChild(notChildren.map((child) => child._id));
    setSelectedNodesChild([]);
    setLoading(false);
  }, [current._id]);

  useEffect(() => {
    getData();
  }, [getData]);

  const handleNodeSelect = useCallback(
    async (event, nodeId) => {
      event?.stopPropagation();
      const allChild = getAllChild(permissions, nodeId);
      const fathers = getAllFathers(permissions, nodeId);

      if (selectedNodes.includes(nodeId)) {
        setSelectedNodes((prevSelectedNodes) =>
          prevSelectedNodes.filter((id) => !allChild.concat(fathers).includes(id))
        );
      } else {
        const ToBeChecked = allChild;
        for (let i = 0; i < fathers.length; i += 1) {
          if (
            isAllChildrenChecked(
              permissions,
              selectedNodes,
              selectedNodesNotChild,
              bfsSearch(permissions, fathers[i]),
              ToBeChecked
            )
          ) {
            ToBeChecked.push(fathers[i]);
          }
        }
        setSelectedNodes((prevSelectedNodes) => [...prevSelectedNodes].concat(ToBeChecked));
      }
    },
    [permissions, selectedNodes, selectedNodesNotChild]
  );
  const submit = async () => {
    setIsSubmitting(true);
    await roleService.updateRolesToParent({
      rolesNames: selectedNodes,
      parentName: current._id,
    });
    setIsSubmitting(false);
    onClose();
    enqueueSnackbar('更新成功!');
  };
  const providerValue = useMemo(
    () => ({
      selectedNodes,
      selectedNodesNotChild,
      handleNodeSelect,
    }),
    [
      selectedNodes,
      selectedNodesNotChild,
      handleNodeSelect,
    ]
  );
  return (
    <userContext.Provider value={providerValue}>
      <Card sx={{ width: '100%' }}>
        {loading ? (
          <Box
            sx={{
              zIndex: 10,
              backgroundColor: '#ffffffc4',
              width: '100%',
              height: '300px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <StyledTreeView
              selected={selectedNodes}
              defaultExpanded={['0']}
              sx={{ px: 2.5, pt: 2.5 }}
            >
              <StyledTreeItem nodeId="0" isRoot label="根节点">
                {permissions.map((perm) => (
                  <List data={perm} key={perm._id} />
                ))}
              </StyledTreeItem>
            </StyledTreeView>
            <Stack alignItems="flex-end" sx={{ m: 3 }}>
              <LoadingButton
                size="small"
                variant="contained"
                loading={isSubmitting}
                onClick={() => {
                  submit();
                }}
              >
                保存
              </LoadingButton>
            </Stack>
          </>
        )}
      </Card>
    </userContext.Provider>
  );
}
