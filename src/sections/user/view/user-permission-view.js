import PropTypes from 'prop-types';
import { useState, useCallback, useEffect, useMemo, createContext } from 'react';
// @mui
import { Container, DialogTitle, Dialog, DialogContent, Button } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
// import Card from '@mui/material/Card';
import TreeItem, { treeItemClasses } from '@mui/lab/TreeItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TreeView from '@mui/lab/TreeView';
import { alpha, styled } from '@mui/material/styles';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import ConfirmDialog from "src/components/confirm-dialog";
import { paths } from 'src/routes/paths';
import { useSnackbar } from 'src/components/snackbar';
// import { useSelector } from 'src/redux/store';
import { roleService } from 'src/composables/context-provider';
import _ from 'lodash';
import PermissionNewEditForm from '../permission/permission-new-edit-form';
// routes

// ----------------------------------------------------------------------


export function getTree (data) {
  let root = data
  // .filter((item) => item.root)
  // .map((item) => ({
  //   ...item,
  // }));
  const tree = [];
  function serverArray (list, parent) {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < list.length; i++) {
      const item = _.find(data, ['_id', list[i]._id]);
      if (item && item.children) {
        if (item.children.length) {
          serverArray(item.children, item);
        } else {
          delete item.children;
        }
      }
      if (parent && parent.children) {
        if (item) {
          parent.children[i] = {
            ...item,
          };
          root = root.filter((r) => r._id !== item._id)
        } else {
          delete parent.children[i];
        }
      }
    }
    return tree;
  }
  serverArray(root, null);
  return root;
}

const StyledTreeView = styled(TreeView)({
  height: 500,
  flexGrow: 1,
  maxWidth: 800,
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


StyledTreeItemRoot.propTypes = {
  theme: PropTypes.object,
};

function StyledTreeItem (props) {
  const {
    label,
    onEdit,
    onDelete,
    isRoot,
    onAddChildren,
    ...other
  } = props;
  return (
    <StyledTreeItemRoot
      label={
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
            {label}
          </Typography>
          {
            !isRoot ? <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1, mr: 1.5 }} onClick={(e) => {
                e.stopPropagation();
                onEdit()
              }}>
                编辑
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1, mr: 1.5 }} onClick={(e) => {
                e.stopPropagation();
                onAddChildren();
              }}>
                添加子节点
              </Typography>
              <Typography variant="caption" color="inherit" onClick={(e) => {
                e.stopPropagation();
                onDelete()
              }}>
                删除
              </Typography>
            </Box>
              : <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1, mr: 1.5 }} onClick={(e) => {
                  e.stopPropagation();
                  onAddChildren();
                }}>
                  添加子节点
                </Typography>
              </Box>}
        </Box>
      }
      {...other}
    />
  );
}
StyledTreeItem.propTypes = {
  isRoot: PropTypes.bool,
  label: PropTypes.string,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onAddChildren: PropTypes.func,
}

List.propTypes = {
  data: PropTypes.object
}

export function List ({ data }) {
  const hasChild = data.children && !!data.children && data.children.length;
  return (
    <userContext.Consumer>
      {({ setOpenForm, setItem, setParent, setOpenManager, setOpenDeleteConfirm, handleEdit, handleDelete }) =>
        <StyledTreeItem nodeId={data._id} label={data.label}
          onEdit={() => {
            setParent(null);
            setItem(data)
            setOpenForm(true)
          }}
          onDelete={() => {
            setItem(data);
            setOpenDeleteConfirm(true)
          }}
          onAddChildren={() => {
            setParent(data);
            setItem({})
            setOpenForm(true)
          }}
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
const userContext = createContext({ item: {}, setOpenForm: null, setItem: null, openForm: false });

export default function UserPermissionView () {
  // const { active } = useSelector((state) => state.scope);
  const [permissions, setPermissions] = useState([]);
  const { themeStretch } = useSettingsContext();
  const [openForm, setOpenForm] = useState(false);
  const [item, setItem] = useState({});
  const [parent, setParent] = useState({});
  const { enqueueSnackbar } = useSnackbar();
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const providerValue = useMemo(() => ({ setOpenForm, setItem, setParent, setOpenDeleteConfirm }), [setOpenForm, setItem, setParent, setOpenDeleteConfirm]);
  const handleCloseModal = () => {
    setOpenForm(false);
    getData();
  };
  const handleOpenModal = () => {
    setOpenForm(true);
  };
  const handleDelete = async () => {
    await roleService
      .delete({
        _id: item._id,
      })
    enqueueSnackbar('删除成功');
    getData()
    handleCloseDeleteConfirm();
  }
  const handleAddChildren = () => {
    setOpenForm(true);
  }
  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
  }
  const getData = useCallback(async () => {
    const response = await roleService.getRoleWith({
      selector: {
        // scope: active._id,
        type: 'permission',
      },
    });
    setPermissions(response)
  }, [setPermissions]);


  useEffect(() => {
    getData();
  }, [getData]);
  return (
    <>
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="权限配置"
          links={[
            // { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: '权限配置', href: paths.dashboard.user.organization },
          ]}
        />
        <userContext.Provider value={providerValue}>
          <StyledTreeView
            defaultExpanded={['0']}
            sx={{ px: 2.5, pt: 2.5 }}>
            <StyledTreeItem nodeId="0" label="根节点" isRoot onAddChildren={() => handleAddChildren()}>
              {
                getTree(permissions).map((perm) => <List data={perm} key={perm._id} />)
              }
            </StyledTreeItem>
          </StyledTreeView>
        </userContext.Provider>
      </Container>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={!permissions.length}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Dialog fullWidth maxWidth="md" open={openForm} onClose={handleCloseModal}>
        <DialogTitle>{item._id ? '编辑' : '新增'}</DialogTitle>
        <DialogContent dividers>
          {
            item && <PermissionNewEditForm parent={parent} type="permission" isEdit={!!item._id} current={item} onClose={handleCloseModal} />
          }
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
    </>
  )
}
