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
  Stack,
  Link
} from '@mui/material';
import _ from 'lodash';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import SearchNotFound from 'src/components/search-not-found';
import { useDispatch, useSelector } from 'src/redux/store';
import { getOrganizations } from 'src/redux/slices/chat';

import { roleService, userService, broadcastService } from 'src/composables/context-provider';
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
const styles = {
  typography: 'body2',
  alignItems: 'center',
  color: 'text.primary',
  display: 'inline-flex',
};

export default function BroadCastContactsDialog ({ open, onClose, current }) {
  const dispatch = useDispatch();
  const { active } = useSelector((state) => state.scope);
  const { organizations } = useSelector((state) => state.chat);
  const [currentOrganization, setCurrentOrganization] = useState([]);
  const [levels, setLevels] = useState([]);
  const [searchContacts, setSearchContacts] = useState('');
  const [openConfirm, setOpenConfirm] = useState(false);
  const [users, setUsers] = useState([]);
  const [assignee, setAssignee] = useState([]);
  const [user, setUser] = useState([]);
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
  const onChildren = (organization) => {
    console.log('gx')
    if (organization.children) {
      const level = {
        name: organization.label,
        to: organization._id,
      }
      levels.push(level);
      setCurrentOrganization([...organization.children, ...organization.users.map(item => ({
        name: item.account.username,
        photoURL: item.profile.photoURL,
        email: item.profile.email,
        _id: item.profile._id
      }))])
      setLevels(levels)
    }
  }
  const onGoTo = async (level) => {
    let index = 0;
    const length = _.findIndex(levels, ["to", level.to])
    let isChildren = false;
    let currentOrganizations = organizations
    const levels2 = []
    while (index < length) {
      isChildren = true;
      const currentLevel = levels[index];
      currentOrganizations = _.find(currentOrganizations, ["_id", currentLevel.to]);
      index += 1;
      levels2.push(currentLevel)
    }
    if (isChildren) {
      await setCurrentOrganization([...currentOrganizations.children, ...currentOrganizations.users.map(item => ({
        _id: item.account._id,
        name: item.account.username,
        photoURL: item.profile.photoURL
      }))]);
    } else {
      await setCurrentOrganization(currentOrganizations);
    }
    setLevels(levels2);
  }

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
    // if (contact.type === "org") {
    //   await broadcastService.addUsers({
    //     users_id: contact.users.map(item => item.account._id),
    //     broadcast_id: current._id
    //   })
    // } else {
      await broadcastService.addUser({
        user_id: contact._id,
        broadcast_id: current._id
      })
    // }
    enqueueSnackbar('添加成功');
    getData();
  }
  useEffect(() => {
    if (open) {
      getData();
      dispatch(getOrganizations(active._id));
    }
  }, [getData, active._id, dispatch, open]);
  // const dataFiltered = applyFilter({
  //   inputData: _contacts,
  //   query: searchContacts,
  // });
  const onSubmit = async (data) => {
    console.log(data)
  };
  const isNotFound = !!searchContacts;

  console.log('organizations', organizations);
  const renderOrganizationsItem = (contact, id, checked) =>
    <Box key={id} onClick={() => onChildren(contact)}>
      <ListItem
        disableGutters
        secondaryAction={
          contact.type !== "org" && <div>
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
          <Avatar src={contact.type === "org" ? contact?.avatarUrl?.preview : contact?.photoURL} />
        </ListItemAvatar>

        <ListItemText
          primaryTypographyProps={{ typography: 'subtitle2', sx: { mb: 0.25 } }}
          secondaryTypographyProps={{ typography: 'caption' }}
          primary={contact.type === "org" ? contact.name : contact.name}
          secondary={contact.type === "org" ? "" : contact.email}
        />
      </ListItem>
    </Box>
  const renderOrganizations = (
    <Scrollbar
      sx={{
        px: 2.5,
        height: ITEM_HEIGHT * 6,
      }}
    >
      {
        levels && levels.length > 0 && <Stack
          direction="row"
          alignItems="center"
          justifyContent="flex-start"
          sx={{ m: 1 }}
        >
          {
            levels.map((level, index) => (<Box key={index} sx={{ display: 'flex' }}>
              <Link onClick={() => onGoTo(level)} sx={styles}>{`${level.name}`} </Link>
              <div style={{ margin: '0 4px' }}> /</div>
            </Box>))
          }
        </Stack>
      }
      {currentOrganization && currentOrganization.length > 0 ?
        currentOrganization.map((contact, id) => {
          const checked = assignee.filter((person) => person._id === contact._id).length > 0;
          return renderOrganizationsItem(contact, id, checked)
        }) : organizations.map((contact, id) => {
          const checked = assignee.filter((person) => person._id === contact._id).length > 0;
          return renderOrganizationsItem(contact, id, checked)
        })}
    </Scrollbar>

  )
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
          ) : renderOrganizations}
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
