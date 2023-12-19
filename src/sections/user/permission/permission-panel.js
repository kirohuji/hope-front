import PropTypes from 'prop-types';
import { useState, useCallback, useEffect, useMemo, createContext } from 'react';
// @mui
import { LoadingButton } from '@mui/lab';
import Card from '@mui/material/Card';
import TreeItem, { treeItemClasses } from '@mui/lab/TreeItem';
import { Stack } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import TreeView from '@mui/lab/TreeView';
import { alpha, styled } from '@mui/material/styles';
import Iconify from 'src/components/iconify';
import { roleService } from 'src/composables/context-provider';
import { useSnackbar } from 'src/components/snackbar';
import _ from 'lodash';
// redux
import { useSelector } from 'src/redux/store';

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
  return []; // Target node not found
};

function getAllIds (node, idList = []) {
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

function isAllChildrenChecked (permissions, selectedNodes, selectedNodesNotChild, node, list) {
  const allChild = getAllChild(permissions, node._id);
  const nodeIdIndex = allChild.indexOf(node._id);
  allChild.splice(nodeIdIndex, 1);

  return allChild.every((nodeId) =>
    selectedNodes.concat(list).includes(nodeId) || selectedNodesNotChild.concat(list).includes(nodeId)
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


function StyledTreeItem (props) {
  const {
    selectedNodes,
    selectedNodesNotChild,
    label,
    node,
    maxRole,
    isRoot,
    handleNodeSelect,
    ...other
  } = props;
  return (
    <StyledTreeItemRoot
      label={
        <>{
          !isRoot && <Checkbox
            checked={selectedNodes && selectedNodes.indexOf(node._id) !== -1 || selectedNodesNotChild && selectedNodesNotChild.indexOf(node._id) !== -1}
            tabIndex={-1}
            // disabled={maxRole._id !== node._id}
            color={
              // eslint-disable-next-line no-nested-ternary
              (selectedNodes && selectedNodes.indexOf(node._id) !== -1) ? 'primary' :
                (selectedNodesNotChild && selectedNodesNotChild.indexOf(node._id) !== -1) ? 'warning' : 'primary'}
            disableRipple
            sx={{ textTransform: 'capitalize' }}
            onClick={(event) => handleNodeSelect && handleNodeSelect(event, node._id)}
          />
        }
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
  maxRole: PropTypes.object,
  isRoot: PropTypes.bool,
  handleNodeSelect: PropTypes.func
}


List.propTypes = {
  data: PropTypes.object
}

export function List ({ data }) {
  const hasChild = data.children && !!data.children && data.children.length;
  return (
    <userContext.Consumer>
      {({ maxRole,selectedNodes, selectedNodesNotChild, handleNodeSelect }) =>
        <StyledTreeItem
          nodeId={data._id}
          label={data.label}
          node={data}
          maxRole={maxRole}
          selectedNodesNotChild={selectedNodesNotChild}
          handleNodeSelect={handleNodeSelect}
          selectedNodes={selectedNodes}
        >
          {hasChild && <SubList data={data.children} />}
        </StyledTreeItem>
      }
    </userContext.Consumer>
  )
}
SubList.propTypes = {
  data: PropTypes.array
}

export function SubList ({ data }) {
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
  maxRole: PropTypes.object,
  onClose: PropTypes.func,
};

export default function PermissionPanel ({ maxRole,current, onClose }) {
  const { active } = useSelector((state) => state.scope);
  const { enqueueSnackbar } = useSnackbar();
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedNodesNotChild, setSelectedNodesChild] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [item, setItem] = useState({});
  const [parent, setParent] = useState({});
  const getData = useCallback(async () => {
    const response = await roleService.permissions({
      selector: {
        type: "permission"
      }
    });
    const children = await roleService.getChildrenRoleNames({
      _id: current._id,
    })
    const notChildren = await roleService.getInheritedRoleNamesOnly({
      _id: current._id,
    })
    setPermissions(response)
    setSelectedNodes(children.map(child => child._id))
    setSelectedNodesChild(notChildren.map(child => child._id))
  }, [setPermissions, setSelectedNodes, setSelectedNodesChild, current]);


  useEffect(() => {
    getData();
  }, [getData]);


  const handleNodeSelect = useCallback(async (event, nodeId) => {
    event.stopPropagation();
    const allChild = getAllChild(permissions, nodeId);
    const fathers = getAllFathers(permissions, nodeId);

    if (selectedNodes.includes(nodeId)) {
      setSelectedNodes((prevSelectedNodes) =>
        prevSelectedNodes.filter((id) => !allChild.concat(fathers).includes(id))
      );
    } else {
      const ToBeChecked = allChild;
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < fathers.length; i++) {
        if (isAllChildrenChecked(permissions, selectedNodes, selectedNodesNotChild, bfsSearch(permissions, fathers[i]), ToBeChecked)) {
          ToBeChecked.push(fathers[i]);
        }
      }
      setSelectedNodes((prevSelectedNodes) =>
        [...prevSelectedNodes].concat(ToBeChecked)
      );
    }
  }, [selectedNodes, selectedNodesNotChild,permissions]);
  const submit = async () => {
    setIsSubmitting(true)
    await roleService.updateRolesToParent({
      rolesNames: selectedNodes,
      parentName: current._id,
    })
    setIsSubmitting(false)
    onClose()
    enqueueSnackbar('更新成功!');
  }
  const providerValue = useMemo(() => ({ maxRole,selectedNodes, selectedNodesNotChild, handleNodeSelect, setOpenForm, setItem, setParent, setOpenDeleteConfirm }), [maxRole,selectedNodes, selectedNodesNotChild, handleNodeSelect, setOpenForm, setItem, setParent, setOpenDeleteConfirm]);
  return (
    <userContext.Provider value={providerValue}>
      <Card sx={{ width: '100%' }}>
        <StyledTreeView
          selected={selectedNodes}
          defaultExpanded={['0']}
          sx={{ px: 2.5, pt: 2.5 }}>
          <StyledTreeItem nodeId="0" isRoot label="根节点">
            {
              permissions.map((perm) => <List data={perm} key={perm._id} />)
            }
          </StyledTreeItem>
        </StyledTreeView>
        <Stack alignItems="flex-end" sx={{ m: 3 }}>
          <LoadingButton
            size="small"
            variant="contained"
            loading={isSubmitting}
            onClick={() => {
              submit()
            }}
          >
            保存
          </LoadingButton>
        </Stack>
      </Card>
    </userContext.Provider>
  )
}
