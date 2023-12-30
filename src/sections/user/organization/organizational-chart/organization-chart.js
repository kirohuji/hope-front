import PropTypes from 'prop-types';
import { Tree, TreeNode } from 'react-organizational-chart';
// @mui
import { useTheme } from '@mui/material/styles';
import { Button, DialogTitle, Dialog, DialogContent } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
// utils
import { useState, createContext, useMemo } from 'react';
import flattenArray from 'src/utils/flatten-array';
// compoennts
import ConfirmDialog from 'src/components/confirm-dialog';
import { roleService } from 'src/composables/context-provider';
import { useSnackbar } from 'src/components/snackbar';
import _ from 'lodash';
import OrganDetailsDrawer from '../organ-details-drawer';
import OrganNewEditForm from '../organ-new-edit-form';
import PermissionPanel from '../../permission/permission-panel';
import { SimpleNode, StandardNode, GroupNode } from './node';

// ----------------------------------------------------------------------

OrganizationalChart.propTypes = {
  sx: PropTypes.object,
  maxRole: PropTypes.object,
  variant: PropTypes.string,
  type: PropTypes.any,
  data: PropTypes.shape({
    name: PropTypes.string,
    children: PropTypes.array,
  }),
  onFlash: PropTypes.any,
};

const userContext = createContext({ item: {}, setOpenForm: null, setItem: null, openForm: false });

export default function OrganizationalChart({
  maxRole,
  type,
  data,
  variant = 'simple',
  sx,
  onFlash,
  ...other
}) {
  const theme = useTheme();
  const [openManager, setOpenManager] = useState(false);
  const [openPermission, setOpenPermission] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [item, setItem] = useState({});
  const [parent, setParent] = useState({});
  const { enqueueSnackbar } = useSnackbar();
  const providerValue = useMemo(
    () => ({
      setOpenForm,
      setItem,
      setParent,
      setOpenManager,
      setOpenDeleteConfirm,
      setOpenPermission,
    }),
    [setOpenForm, setItem, setParent, setOpenManager, setOpenDeleteConfirm, setOpenPermission]
  );
  const handleCloseModal = (getData) => {
    if (getData && getData.data) {
      if (getData.type === 'new') {
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(getData.data);
        }
      } else if (parent.children) {
        for (let i = 0; i < parent.children.length; i += 1) {
          if (parent.children[i]._id === getData.data._id) {
            parent.children[i] = getData.data;
            break;
          }
        }
      }
    }
    console.log('data', data);
    setOpenForm(false);
  };
  const handleClosePermissionModal = () => {
    setOpenPermission(false);
  };
  const handleCloseManagerModal = () => {
    setOpenManager(false);
  };
  const handleOpenModal = () => {
    setOpenForm(true);
  };
  const handleCloseDeleteConfirm = () => {
    console.log('打开');
    setOpenDeleteConfirm(false);
  };
  const handleDelete = async () => {
    await roleService.delete({
      _id: item._id,
    });
    enqueueSnackbar('删除成功');
    // onFlash()
    if (parent && parent.children) {
      for (let i = 0; i < parent.children.length; i += 1) {
        if (parent.children[i] && parent.children[i]._id === item._id) {
          parent.children[i] = null;
          break;
        }
      }
      if (_.compact(parent.children).length === 0) {
        parent.children = null;
      }
    }
    handleCloseDeleteConfirm();
    setOpenManager(false);
  };
  const handleChangeLeader = async (person) => {
    for (let i = 0; i < parent.children.length; i += 1) {
      if (parent?.children[i] && parent.children[i]._id === item._id) {
        parent.children[i].leader = {
          _id: person._id,
          username: person.username,
        };
        break;
      }
    }
  };
  const onCreate = () => {
    setItem({});
    setParent(data);
    handleOpenModal();
  };
  return (
    <userContext.Provider value={providerValue}>
      <Tree
        lineWidth="1.5px"
        nodePadding="4px"
        lineBorderRadius="24px"
        lineColor={theme.palette.divider}
        label={variant === 'group' && <GroupNode sx={sx} node={data} onCreate={onCreate} />}
        {...other}
      >
        {data.children &&
          data.children.map(
            (list) =>
              list && (
                <List
                  parentNode={data}
                  key={list._id}
                  depth={1}
                  data={list}
                  variant={variant}
                  sx={sx}
                />
              )
          )}
      </Tree>

      <Dialog fullWidth maxWidth="md" open={openForm} onClose={handleCloseModal}>
        <DialogTitle>{item._id ? '编辑' : '新增'}</DialogTitle>
        <DialogContent dividers>
          {item && (
            <OrganNewEditForm
              type={type}
              parent={parent}
              isEdit={!!item._id}
              current={item}
              onClose={handleCloseModal}
            />
          )}
        </DialogContent>
      </Dialog>

      <OrganDetailsDrawer
        onChangeLeader={handleChangeLeader}
        item={item}
        open={openManager}
        onClose={handleCloseManagerModal}
        onDelete={() => {
          console.log('删除');
          setOpenDeleteConfirm(true);
        }}
      />

      <Dialog fullWidth maxWidth="md" open={openPermission} onClose={handleClosePermissionModal}>
        <DialogTitle>权限配置</DialogTitle>
        <DialogContent dividers>
          <Grid container direction="row" alignItems="center" sx={{ p: 1 }}>
            {openPermission && (
              <PermissionPanel
                maxRole={maxRole}
                current={item}
                onClose={handleClosePermissionModal}
              />
            )}
          </Grid>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={openDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
        title="删除"
        content="你确定删除吗?"
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            删除
          </Button>
        }
      />
    </userContext.Provider>
  );
}

// ----------------------------------------------------------------------

List.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    children: PropTypes.array,
    users: PropTypes.array,
    isUser: PropTypes.bool,
  }),
  parentNode: PropTypes.object,
  sx: PropTypes.object,
  depth: PropTypes.number,
  variant: PropTypes.string,
};

export function List({ data, parentNode, depth, variant, sx }) {
  const hasChild = data.children && !!data.children && _.compact(data.children).length > 0;
  return (
    <userContext.Consumer>
      {({
        setOpenForm,
        setItem,
        setParent,
        setOpenManager,
        setOpenDeleteConfirm,
        setOpenPermission,
      }) => (
        <TreeNode
          label={
            variant === 'group' && (
              <GroupNode
                sx={sx}
                node={data}
                depth={depth}
                onEdit={() => {
                  setItem(data);
                  setParent(parentNode);
                  setOpenForm(true);
                }}
                onClick={() => {
                  setItem(data);
                  setParent(parentNode);
                  setOpenManager(true);
                }}
                onCreate={() => {
                  setItem({});
                  setParent(data);
                  setOpenForm(true);
                }}
                onManager={() => {
                  setItem(data);
                  setParent(parentNode);
                  setOpenManager(true);
                }}
                onPermission={() => {
                  setItem(data);
                  setParent(null);
                  setOpenPermission(true);
                }}
                onDelete={() => {
                  setItem(data);
                  setParent(null);
                  setOpenDeleteConfirm(true);
                  setOpenManager(false);
                }}
                length={
                  _.compact(data.children)
                    ? flattenArray(_.compact(data.children), 'children')?.length
                    : 0
                }
              />
            )
          }
        >
          {hasChild && <SubList data={data} depth={depth} variant={variant} sx={sx} />}
        </TreeNode>
      )}
    </userContext.Consumer>
  );
}

// ----------------------------------------------------------------------

SubList.propTypes = {
  sx: PropTypes.object,
  data: PropTypes.object,
  depth: PropTypes.number,
  variant: PropTypes.string,
};

function SubList({ data, depth, variant, sx }) {
  return (
    <>
      {data.children.map(
        (list) =>
          list &&
          list._id && (
            <List
              parentNode={data}
              key={list._id}
              data={list}
              depth={depth + 1}
              variant={variant}
              sx={sx}
            />
          )
      )}
    </>
  );
}
