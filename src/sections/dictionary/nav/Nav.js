import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import { List, Drawer, Button, Divider, Stack, DialogTitle, Dialog, } from '@mui/material';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// config
import { NAV } from 'src/config-global';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { SkeletonMailNavItem } from 'src/components/skeleton';
import { dictionaryService } from 'src/composables/context-provider';
import ConfirmDialog from 'src/components/confirm-dialog';
import { useSnackbar } from 'src/components/snackbar';
import DictionaryForm from '../DictionaryForm';
//
import NavItem from './NavItem';

// ----------------------------------------------------------------------

Nav.propTypes = {
  items: PropTypes.array,
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
  onSelect: PropTypes.func,
  onRefresh: PropTypes.func,
};

export default function Nav ({ items, openNav, onCloseNav, onSelect, onRefresh }) {
  const [row, setRow] = useState({});
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openForm, setOpenForm] = useState(false);;
  const isDesktop = useResponsive('up', 'md');
  const { enqueueSnackbar } = useSnackbar();
  // const isLoading = !items.length;
  const isLoading = false;
  const [active, setActive] = useState(-1);
  const handleCloseFormModal = () => {
    setOpenForm(false)
  }
  const handleOpenFormModal = () => {
    setOpenForm(true)
  }
  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
  }, [onCloseNav,openNav]);

  const onDelete = async () => {
    await dictionaryService.delete({
      _id: row._id
    })

    enqueueSnackbar('删除成功');
    onRefresh()
    handleCloseConfirm()
  }
  const onSave = async (form) => {
    if (row && row._id) {
      await dictionaryService.patch({
        _id: row._id,
        ...form,
      })
    } else {
      await dictionaryService.post({
        ...form
      })
    }
    enqueueSnackbar(row && row._id ? '更新成功!' : ' 创建成功!');
    onRefresh()
    handleCloseFormModal()
  }
  const handleOpen = () => {
    setRow(null);
    handleOpenFormModal()
  };

  const renderContent = (
    <>
      <Stack justifyContent="center" flexShrink={0} sx={{ px: 2.5, height: 80 }}>
        <Button
          fullWidth
          color="inherit"
          variant="contained"
          startIcon={<Iconify icon="eva:edit-fill" />}
          onClick={handleOpen}
          sx={{
            bgcolor: 'text.primary',
            color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
            '&:hover': {
              bgcolor: 'text.primary',
              color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
            },
          }}
        >
          新增
        </Button>
      </Stack>

      <Divider />

      <Scrollbar>
        <List disablePadding>
          {(isLoading ? [...Array(8)] : items).map((item, index) =>
            item ? (
              <NavItem key={item._id} item={item} active={active === index}
                onSelect={() => {
                  onSelect(item);
                  setActive(index)
                }}
                onEdit={() => {
                  setRow(item);
                  handleOpenFormModal()
                }}
                onDelete={() => {
                  setRow(item);
                  setOpenConfirm(true)
                }} />
            ) : (
              <SkeletonMailNavItem key={index} />
            )
          )}
        </List>
      </Scrollbar>
      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="删除"
        content="你确定删除吗?"
        action={
          <Button variant="contained" color="error" onClick={onDelete}>
            删除
          </Button>
        }
      />
      <Dialog fullWidth maxWidth="xs" open={openForm} onClose={handleCloseFormModal}>
        <DialogTitle>{row && row._id ? "编辑" : "新增"}</DialogTitle>
        <DictionaryForm item={row} onSubmitData={onSave} onCancel={handleCloseFormModal} />
      </Dialog>

    </>
  );

  return isDesktop ? (
    <Drawer
      variant="permanent"
      PaperProps={{
        sx: {
          width: NAV.W_BASE,
          position: 'relative',
        },
      }}
    >
      {renderContent}
    </Drawer>
  ) : (
    <Drawer
      open={openNav}
      onClose={onCloseNav}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: {
          width: NAV.W_BASE,
        },
      }}
    >
      {renderContent}
    </Drawer>
  );
}
