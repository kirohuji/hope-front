import PropTypes from 'prop-types';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
// @mui
import {
  Box,
  Avatar,
  Dialog,
  Button,
  ListItem,
  Typography,
  ListItemText,
  ListItemAvatar,
  InputAdornment,
  DialogTitle,
  DialogContent,
  FormControlLabel,
  Switch,
  Divider,
  CircularProgress,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
// hooks
import { useDebounce } from 'src/hooks/use-debounce';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import SearchNotFound from '../../../components/search-not-found';
import { roleService } from '../../../composables/context-provider';
import { useSelector } from '../../../redux/store';
import { useSnackbar } from '../../../components/snackbar';
import ConfirmDialog from '../../../components/confirm-dialog';
import FormProvider, { RHFTextField } from '../../../components/hook-form';
// ----------------------------------------------------------------------

const ITEM_HEIGHT = 64;

OrganContactsDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  // assignee: PropTypes.array,
  current: PropTypes.object,
};

export default function OrganContactsDialog({ open, onClose, current }) {
  const [searchContacts, setSearchContacts] = useState('');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [users, setUsers] = useState([]);

  const [assignee, setAssignee] = useState([]);

  const [user, setUser] = useState([]);

  const scope = useSelector((state) => state.scope);

  const [loading, setLoading] = useState(false);

  const [buttonLoading, setButtonLoading] = useState(false);

  const [buttonLoadingId, setButtonLoadingId] = useState(-1);

  const { enqueueSnackbar } = useSnackbar();

  const debouncedSearchContacts = useDebounce(searchContacts, 1000);

  const handleOpenConfirm = (contact) => {
    setUser(contact);
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const NewUserSchema = Yup.object().shape({
    searchContacts: Yup.string(),
    isShowJoinedUser: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({}),
    []
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });
  const {
    control,
    handleSubmit,
  } = methods;

  const getData = useCallback(async () => {
    setLoading(true);
    const response = await roleService.getUsersInNotRoleOnly({
      queryOptions: {
        realName: {
          $regex: debouncedSearchContacts,
          $options: 'i',
        },
        isShowJoinedUser: 'on',
      },
      options: {
        scope: scope.active._id,
      },
      roles: current._id,
    });
    setLoading(false);
    setUsers(response.data);
  }, [debouncedSearchContacts, scope, current, setUsers]);

  const getUsersInRoleOnly = useCallback(async () => {
    const response2 = await roleService.getUsersInRoleOnly({
      queryOptions: {
        isShowJoinedUser: 'on',
      },
      options: {
        scope: scope.active._id,
      },
      roles: current._id,
    });
    setAssignee(response2.data);
  }, [scope.active, current._id]);

  const handleSearchContacts = (event) => {
    setSearchContacts(event.target.value);
  };

  const handleDelete = async () => {
    setButtonLoading(true);
    try {
      await roleService.removeUsersFromRolesAndInheritedRole({
        users: user,
        roles: current._id,
        options: {
          scope: scope.active._id,
        },
      });
      enqueueSnackbar('删除成功');
      handleCloseConfirm();
      getUsersInRoleOnly();
    } catch (e) {
      enqueueSnackbar('删除失败');
    }
    setButtonLoading(false);
  };

  const handleAdd = async (contact) => {
    setButtonLoading(true);
    setButtonLoadingId(contact._id);
    try {
      await roleService.addUsersToRolesAndRoleParents({
        users: contact,
        roles: current._id,
        options: {
          scope: scope.active._id,
        },
      });
      enqueueSnackbar('添加成功');
      getUsersInRoleOnly();
    } catch (e) {
      enqueueSnackbar('添加失败');
    }
    setButtonLoading(false);
    setButtonLoadingId(-1);
  };
  useEffect(() => {
    if (open) {
      getData();
      getUsersInRoleOnly();
    }
  }, [getData, open, getUsersInRoleOnly]);
  const onSubmit = async (data) => {
    console.log(data);
  };
  const isNotFound = !users.length;

  return (
    <>
      <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
        <DialogTitle sx={{ pb: 1 }}>
          用户列表
          {/** <Typography component="span">({_contacts.length})</Typography> */}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 0.5 }}>
            <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
              <RHFTextField
                fullWidth
                name="searchContacts"
                onChange={handleSearchContacts}
                placeholder="搜索..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControlLabel
                labelPlacement="start"
                control={
                  <Controller
                    name="isShowJoinedUser"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        {...field}
                        checked={field.value !== 'on'}
                        onChange={(event) => {
                          field.onChange(event.target.checked ? 'on' : 'off');
                        }}
                      />
                    )}
                  />
                }
                label={<Typography variant="subtitle2">显示已添加用户</Typography>}
                sx={{ mx: 0.5, mb: 0, width: 1, justifyContent: 'space-between' }}
              />
            </FormProvider>
          </Box>
          <Divider />
          {!loading ? (
            <Scrollbar
              sx={{
                px: 2.5,
                height: ITEM_HEIGHT * 6,
              }}
            >
              {!isNotFound ? (
                users.map((contact) => {
                  const checked = assignee
                    .map((person) => person.username)
                    .includes(contact.username);

                  return (
                    <ListItem
                      key={contact._id || contact.id}
                      disableGutters
                      secondaryAction={
                        <div>
                          <LoadingButton
                            size="small"
                            loading={contact._id === buttonLoadingId && buttonLoading}
                            color={checked ? 'primary' : 'inherit'}
                            onClick={() => !checked && handleAdd(contact)}
                            startIcon={
                              <Iconify icon={checked ? 'eva:checkmark-fill' : 'eva:plus-fill'} />
                            }
                          >
                            {checked ? '已添加' : '添加'}
                          </LoadingButton>
                          {checked && (
                            <Button
                              size="small"
                              disabled={!checked}
                              onClick={() => handleOpenConfirm(contact)}
                              color={!checked ? 'primary' : 'inherit'}
                              startIcon={<Iconify icon="eva:close-fill" />}
                            >
                              移出
                            </Button>
                          )}
                        </div>
                      }
                      sx={{ height: ITEM_HEIGHT }}
                    >
                      <ListItemAvatar>
                        <Avatar src={contact.photoURL} />
                      </ListItemAvatar>

                      <ListItemText
                        primaryTypographyProps={{ typography: 'subtitle2', sx: { mb: 0.25 } }}
                        secondaryTypographyProps={{ typography: 'caption' }}
                        primary={`${contact?.displayName}(${contact?.realName})`}
                        secondary={contact.email}
                      />
                    </ListItem>
                  );
                })
              ) : (
                <SearchNotFound query={searchContacts} sx={{ mt: 3, mb: 10 }} />
              )}
            </Scrollbar>
          ) : (
            <Box
              sx={{
                zIndex: 10,
                backgroundColor: '#ffffffc4',
                width: '100%',
                height: '100%',
                display: 'flex',
                padding: '16px',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="删除"
        content="你确定删除吗?"
        action={
          <LoadingButton
            variant="contained"
            color="error"
            onClick={handleDelete}
            loading={buttonLoading}
          >
            删除
          </LoadingButton>
        }
      />
    </>
  );
}