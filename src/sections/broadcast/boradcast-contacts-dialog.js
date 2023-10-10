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
  Divider
} from '@mui/material';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import SearchNotFound from 'src/components/search-not-found';
import { roleService, userService, broadcastService } from 'src/composables/context-provider';
import { useSelector } from 'src/redux/store';
import { useSnackbar } from 'src/components/snackbar';
import ConfirmDialog from 'src/components/confirm-dialog';
import FormProvider, {
  RHFTextField,
} from 'src/components/hook-form';
// ----------------------------------------------------------------------

const ITEM_HEIGHT = 64;

BroadCastContactsDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  // assignee: PropTypes.array,
  current: PropTypes.object,
};

export default function BroadCastContactsDialog ({ open, onClose, current }) {
  const [searchContacts, setSearchContacts] = useState('');
  const [openConfirm, setOpenConfirm] = useState(false);
  const [users, setUsers] = useState([]);
  const [assignee, setAssignee] = useState([]);
  const [user, setUser] = useState([]);
  const { active } = useSelector((state) => state.scope);
  const { enqueueSnackbar } = useSnackbar();
  const handleOpenConfirm = (contact) => {
    setUser(contact)
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };
  const NewUserSchema = Yup.object().shape({
    searchContacts: Yup.string(),
    isShowJoinedUser: Yup.boolean()
  });
  const defaultValues = useMemo(
    () => ({

    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });
  const {
    control,
    handleSubmit,
    // formState,
  } = methods;


  const getData = useCallback(async () => {
    const response = await roleService.getUsersInNotRoleOnly({
      queryOptions: {
        username: searchContacts,
        isShowJoinedUser: "on"
      },
      options: {
        scope: active._id,
      },
      roles: current._id,
    });
    setUsers(response.data)
    const response2 = await broadcastService.getUsers({
      _id: current._id
    });
    setAssignee(response2)
  }, [searchContacts, active, current, setUsers]);
  const handleSearchContacts = (event) => {
    setSearchContacts(event.target.value);
  };
  // const handleIsShowJoinedUser = (event) => {
  //   setIsShowJoinedUser(event.target.value);
  // }; 
  const handleDelete = async () => {
    await broadcastService.deleteUser({
      _id: user._id,
    })
    enqueueSnackbar('删除成功');
    handleCloseConfirm();
    getData();
  }
  const handleAdd = async (contact) => {
    await broadcastService.addUser({
      user_id: contact._id,
      broadcast_id: current._id
    })
    enqueueSnackbar('添加成功');
    getData();
  }
  useEffect(() => {
    if(open){
      getData();
    }
  }, [getData,open]);
  // const dataFiltered = applyFilter({
  //   inputData: _contacts,
  //   query: searchContacts,
  // });
  const onSubmit = async (data) => {
    console.log(data)
  };
  const isNotFound = !!searchContacts;

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
                          // handleIsShowJoinedUser(event.target.checked === "on")
                        }}
                      />
                    )}
                  />
                }
                label={
                  <Typography variant="subtitle2" >
                    显示已添加用户
                  </Typography>
                }
                sx={{ mx: 0.5, mb: 0, width: 1, justifyContent: 'space-between' }}
              />
            </FormProvider>
          </Box>
          <Divider />
          {isNotFound ? (
            <SearchNotFound query={searchContacts} sx={{ mt: 3, mb: 10 }} />
          ) : (
            <Scrollbar
              sx={{
                px: 2.5,
                height: ITEM_HEIGHT * 6,
              }}
            >
              {users.map((contact) => {
                const checked = assignee.map((person) => person.username).includes(contact.username);

                return (
                  <ListItem
                    key={contact._id}
                    disableGutters
                    secondaryAction={
                      <div>
                        <Button
                          size="small"
                          color={checked ? 'primary' : 'inherit'}
                          onClick={() => !checked && handleAdd(contact)}
                          startIcon={
                            <Iconify icon={checked ? 'eva:checkmark-fill' : 'eva:plus-fill'} />
                          }
                        >
                          {checked ? '已添加' : '添加'}
                        </Button>
                        {checked && false && <Button
                          size="small"
                          disabled={!checked}
                          onClick={() => handleOpenConfirm(contact)}
                          color={!checked ? 'primary' : 'inherit'}
                          startIcon={
                            <Iconify icon="eva:close-fill" />
                          }
                        >
                          移出
                        </Button>}
                      </div>
                    }
                    sx={{ height: ITEM_HEIGHT }}
                  >
                    <ListItemAvatar>
                      <Avatar src={contact.avatarUrl} />
                    </ListItemAvatar>

                    <ListItemText
                      primaryTypographyProps={{ typography: 'subtitle2', sx: { mb: 0.25 } }}
                      secondaryTypographyProps={{ typography: 'caption' }}
                      primary={contact.displayName || contact.username}
                      secondary={contact.emails[0].address}
                    />
                  </ListItem>
                );
              })}
            </Scrollbar>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="删除"
        content="你确定删除吗?"
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            删除
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

// function applyFilter ({ inputData, query }) {
//   if (query) {
//     inputData = inputData.filter(
//       (contact) =>
//         contact.name.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
//         contact.email.toLowerCase().indexOf(query.toLowerCase()) !== -1
//     );
//   }

//   return inputData;
// }
