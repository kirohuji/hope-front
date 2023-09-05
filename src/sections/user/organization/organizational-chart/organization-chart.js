import PropTypes from 'prop-types';
import { Tree, TreeNode } from 'react-organizational-chart';
// @mui
import { useTheme } from '@mui/material/styles';
import { Button, DialogTitle, Dialog, DialogContent } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Divider from '@mui/material/Divider';
// utils
import { useState, createContext, useMemo } from 'react';
import flattenArray from 'src/utils/flatten-array';
//
import ConfirmDialog from "src/components/confirm-dialog";
import { roleService } from 'src/composables/context-provider';
import { useSnackbar } from 'src/components/snackbar';
import OrganDetailsDrawer from '../organ-details-drawer';
import { SimpleNode, StandardNode, GroupNode } from './node';
import OrganNewEditForm from '../organ-new-edit-form';
import PermissionPanel from '../../permission/permission-panel';
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
  onFlash: PropTypes.any
};
const userContext = createContext({ item: {}, setOpenForm: null, setItem: null, openForm: false });


export default function OrganizationalChart ({ maxRole, type, data, variant = 'simple', sx, onFlash, ...other }) {
  const theme = useTheme();
  const [openManager, setOpenManager] = useState(false);
  const [openPermission, setOpenPermission] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [item, setItem] = useState({});
  const [parent, setParent] = useState({});
  const { enqueueSnackbar } = useSnackbar();
  const providerValue = useMemo(() => ({ setOpenForm, setItem, setParent, setOpenManager, setOpenDeleteConfirm, setOpenPermission }), [setOpenForm, setItem, setParent, setOpenManager, setOpenDeleteConfirm, setOpenPermission]);
  const handleCloseModal = () => {
    onFlash()
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
    setOpenDeleteConfirm(false);
  }
  const handleDelete = async () => {
    await roleService
      .delete({
        _id: item._id,
      })
    enqueueSnackbar('删除成功');
    onFlash()
    handleCloseDeleteConfirm();
    setOpenManager(false);
  }
  return (
    <userContext.Provider value={providerValue}>
      <Tree
        lineWidth="1.5px"
        nodePadding="4px"
        lineBorderRadius="24px"
        lineColor={theme.palette.divider}
        label={
          (variant === 'simple' && <SimpleNode
            sx={sx}
            node={data} />) ||
          (variant === 'standard' && (
            <StandardNode
              sx={sx}
              node={data}
              onEdit={() => handleOpenModal()}
              onDelete={() => console.log('DELETE', data.name)}
            />
          )) ||
          (variant === 'group' && <GroupNode
            sx={sx}
            node={data}
            onCreate={() => {
              setItem({});
              setParent(data);
              setOpenForm(true)
            }} />)
        }
        {...other}
      >
        {data.children && data.children.map((list) => (
          <List key={list.name} depth={1} data={list} variant={variant} sx={sx} />
        ))}
      </Tree>
      {/**
          <OrganContactsDialog
        current={item}
        assignee={item.users}
        open={openContacts}
        onClose={handleCloseContacts}
      />
    */}
      <Dialog fullWidth maxWidth="md" open={openForm} onClose={handleCloseModal}>
        <DialogTitle>{item._id ? '编辑' : '新增'}</DialogTitle>
        <DialogContent dividers>
          {
            item && <OrganNewEditForm type={type} parent={parent} isEdit={!!item._id} current={item} onClose={handleCloseModal} />
          }
        </DialogContent>
      </Dialog>
      <OrganDetailsDrawer item={item} open={openManager} onClose={handleCloseManagerModal} onDelete={() => setOpenDeleteConfirm(true)} />
      {
        /**
            <Dialog fullWidth maxWidth="md" open={openManager} onClose={handleCloseManagerModal}>
              <DialogTitle>{item.label}</DialogTitle>
              <DialogContent dividers>
                <OrganDetail current={item} />
              </DialogContent>
            </Dialog>
         */
      }
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
      <Dialog fullWidth maxWidth="md" open={openPermission} onClose={handleClosePermissionModal}>
        <DialogTitle>权限配置</DialogTitle>
        <DialogContent dividers>
          <Grid container direction="row" alignItems="center" sx={{ p: 1 }}>
            <PermissionPanel maxRole={maxRole} current={item} onClose={handleClosePermissionModal} />
          </Grid>
        </DialogContent>
      </Dialog>
    </userContext.Provider>
  );
}

// ----------------------------------------------------------------------

List.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    children: PropTypes.array,
    users: PropTypes.array,
    isUser: PropTypes.bool
  }),
  sx: PropTypes.object,
  depth: PropTypes.number,
  variant: PropTypes.string,
};

export function List ({ data, depth, variant, sx }) {
  const hasChild = data.children && !!data.children && data.children.length;
  return (
    <userContext.Consumer>
      {({ setOpenForm, setItem, setParent, setOpenManager, setOpenDeleteConfirm, setOpenPermission }) => <TreeNode
        label={
          (variant === 'simple' && <SimpleNode sx={sx} node={data} />) ||
          (variant === 'standard' && (
            <StandardNode
              sx={sx}
              node={data}
              onEdit={() => console.log('EDIT', data.name)}
              onDelete={() => console.log('DELETE', data.name)}
            />
          )) ||
          (variant === 'group' && (
            <GroupNode
              sx={sx}
              node={data}
              depth={depth}
              onEdit={() => {
                setItem(data);
                setParent(null);
                setOpenForm(true)
              }}
              onClick={() => {
                setItem(data);
                setParent(null);
                setOpenManager(true)
              }}
              onCreate={() => {
                setItem({});
                setParent(data);
                setOpenForm(true)
              }}
              onManager={() => {
                setItem(data);
                setParent(null);
                setOpenManager(true)
              }}
              onPermission={() => {
                setItem(data);
                setParent(null);
                setOpenPermission(true)
              }}
              onDelete={() => {
                setItem(data);
                setParent(null);
                setOpenDeleteConfirm(true)
                setOpenManager(false);
              }}
              length={flattenArray(data.children, 'children')?.length}
            />
          ))
        }
      >
        {hasChild && <SubList data={data.children} depth={depth} variant={variant} sx={sx} />}
        {/**
              <Fade in={checked}>
          <div style={{ display: "flex", justifyContent: "center"}}>
            {hasUsers && data.users.map((user) => {
              const profile = {
                ...user.profile,
                name: user.profile.displayName,
                group: user.profile.state,
                role: user.profile.state,
                isUser: true,
              }
              return <UserNode key={profile.name || profile._id} data={profile} depth={depth + 1} variant={variant} sx={sx} />
            }
            )}
          </div>
        </Fade>
      
      */}
      </TreeNode>}
    </userContext.Consumer>
  );
}

// ----------------------------------------------------------------------

SubList.propTypes = {
  sx: PropTypes.object,
  data: PropTypes.array,
  depth: PropTypes.number,
  variant: PropTypes.string,
};

function SubList ({ data, depth, variant, sx }) {
  return (
    <>
      {data.map((list) => list.name && (
        <List key={list.name || list._id} data={list} depth={depth + 1} variant={variant} sx={sx} />
      ))}
    </>
  );
}


UserNode.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string,
    children: PropTypes.array,
    users: PropTypes.array,
    isUser: PropTypes.bool
  }),
  sx: PropTypes.object,
  depth: PropTypes.number,
  variant: PropTypes.string,
};

export function UserNode ({ data, depth, variant, sx }) {

  return (
    <userContext.Consumer>
      {({ setOpenForm, setItem, setParent, setOpenManager }) => <TreeNode
        label={
          (variant === 'simple' && <SimpleNode sx={sx} node={data} />) ||
          (variant === 'standard' && (
            <StandardNode
              sx={sx}
              node={data}
              onEdit={() => console.log('EDIT', data.name)}
              onDelete={() => console.log('DELETE', data.name)}
            />
          )) ||
          (variant === 'group' && (
            <GroupNode
              sx={sx}
              node={data}
              depth={depth}
              onCreate={() => {
                setItem({});

                setParent(data);
                setOpenForm(true)
              }}
              onDelete={() => console.log('DELETE', data.name)}
              length={flattenArray(data.children, 'children')?.length}
            />
          ))
        }
      />}
    </userContext.Consumer>
  );
}
