import PropTypes from 'prop-types';
import _ from 'lodash';
import { Tree, TreeNode } from 'react-organizational-chart';
// @mui
import { useTheme } from '@mui/material/styles';
import { Button, DialogTitle, Dialog, DialogContent } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
// utils
import { useState, createContext, useMemo } from 'react';
// compoennts
import ConfirmDialog from 'src/components/confirm-dialog';
import { roleService } from 'src/composables/context-provider';
import { useSnackbar } from 'src/components/snackbar';
import OrganDetailsDrawer from '../organ-details-drawer';
import OrganNewEditForm from '../organ-new-edit-form';
import PermissionPanel from '../../permission/permission-panel';
import { StandardNode } from './node';

// ----------------------------------------------------------------------

OrganizationalChart.propTypes = {
  sx: PropTypes.object,
  variant: PropTypes.string,
  type: PropTypes.any,
  data: PropTypes.shape({
    name: PropTypes.string,
    children: PropTypes.array,
  }),
  permissions: PropTypes.array,
  onFlash: PropTypes.any,
};

const userContext = createContext({ item: {}, setOpenForm: null, setItem: null, openForm: false });

export default function OrganizationalChart({
  permissions,
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
  // 当前项
  const [item, setItem] = useState({});
  // 父项
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
    setOpenDeleteConfirm(false);
  };

  // 关闭时执行 新增 or 修改
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
            parent.children[i] = {
              ...parent.children[i],
              ...getData.data,
            };
            break;
          }
        }
      }
    }
    setOpenForm(false);
  };

  // 删除
  const handleDelete = async () => {
    await roleService.delete({
      _id: item._id,
    });
    enqueueSnackbar('删除成功');
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

  // 修改负责人
  const handleChangeLeader = async (person) => {
    for (let i = 0; i < parent.children.length; i += 1) {
      if (parent?.children[i] && parent.children[i]._id === item._id) {
        parent.children[i].leader = {
          _id: person._id,
          username: person.username,
          displayName: person.displayName,
          realName: person.realName,
          photoURL: person.avatarUrl,
        };
        break;
      }
    }
  };

  // 新增
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
        label={variant === 'standard' && <StandardNode sx={sx} node={data} onCreate={onCreate} />}
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
          setOpenDeleteConfirm(true);
        }}
      />

      <Dialog fullWidth maxWidth="md" open={openPermission} onClose={handleClosePermissionModal}>
        <DialogTitle>权限配置</DialogTitle>
        <DialogContent dividers>
          <Grid container direction="row" alignItems="center" sx={{ p: 1 }}>
            {openPermission && (
              <PermissionPanel
                permissions={permissions}
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
  const [isOpen, setIsOpen] = useState(false);

  const hasChild = data.children && !!data.children && _.compact(data.children).length > 0;

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  
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
          children={
            hasChild && isOpen ? (
              <SubList data={data} depth={depth} variant={variant} sx={sx} />
            ) : null
          }
          label={
            variant === 'standard' && (
              <StandardNode
                sx={sx}
                hasChild={hasChild}
                node={data}
                depth={depth}
                onEdit={() => {
                  setItem(data);
                  setParent(parentNode);
                  setOpenForm(true);
                }}
                onToggle={() => {
                  handleToggle();
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
                  setParent(parentNode);
                  setOpenDeleteConfirm(true);
                  setOpenManager(false);
                }}
              />
            )
          }
        />
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
