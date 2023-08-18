import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
// @mui
import { Container, DialogTitle, Dialog, DialogContent } from '@mui/material';
// import Card from '@mui/material/Card';
import TreeItem, { treeItemClasses } from '@mui/lab/TreeItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TreeView from '@mui/lab/TreeView';
import { alpha, styled } from '@mui/material/styles';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';

import { paths } from 'src/routes/paths';

import PermissionNewEditForm from '../permission/permission-new-edit-form';

// routes

// ----------------------------------------------------------------------

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
            !isRoot && <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1, mr: 1.5 }} onClick={() => onEdit()}>
                编辑
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1, mr: 1.5 }} onClick={onAddChildren}>
                添加子节点
              </Typography>
              <Typography variant="caption" color="inherit" onClick={onDelete}>
                删除
              </Typography>
            </Box>
          }
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

export default function UserPermissionView () {
  const { themeStretch } = useSettingsContext();
  const [openForm, setOpenForm] = useState(false);
  const [item, setItem] = useState({});
  const handleCloseModal = () => {
    setOpenForm(false);
  };
  const handleOpenModal = () => {
    setOpenForm(true);
  };
  const handleEdit = () => {
    setOpenForm(true);
  }
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
        <StyledTreeView defaultExpanded={['1']} sx={{ px: 2.5, pt: 2.5 }}
        >
          <StyledTreeItem nodeId="1" label="根节点" isRoot>
            <StyledTreeItem nodeId="2" label="Hello"
              onEdit={() => handleEdit()}
              onDelete={() => handleOpenModal()}
              onAddChildren={() => handleOpenModal()}
            />
          </StyledTreeItem>
        </StyledTreeView>
      </Container>
      <Dialog fullWidth maxWidth="md" open={openForm} onClose={handleCloseModal}>
        <DialogTitle>{item._id ? '编辑' : '新增'}</DialogTitle>
        <DialogContent dividers>
          {
            item && <PermissionNewEditForm isEdit={!!item._id} current={item} onClose={handleCloseModal} />
          }
        </DialogContent>
      </Dialog>
    </>
  )
}
