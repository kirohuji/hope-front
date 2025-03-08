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
  Link,
  CircularProgress,
} from '@mui/material';
import _ from 'lodash';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import LoadingButton from '@mui/lab/LoadingButton';
import SearchNotFound from 'src/components/search-not-found';
import { useDispatch, useSelector } from 'src/redux/store';
import { getOrganizations } from 'src/redux/slices/chat';

import { notificationService } from 'src/composables/context-provider';
import { useSnackbar } from 'src/components/snackbar';
import ConfirmDialog from 'src/components/confirm-dialog';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
// ----------------------------------------------------------------------

const ITEM_HEIGHT = 64;

BroadCastContactsDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onUpdateRefresh: PropTypes.func,
  current: PropTypes.object,
};
const styles = {
  typography: 'body2',
  alignItems: 'center',
  color: 'text.primary',
  display: 'inline-flex',
};

function traverse(node, assignee) {
  if (node.users) {
    const checked =
      _.intersectionBy(node.users || [], assignee, '_id').length === (node.users || []).length;
    node.checked = checked;
  }
  if (node.children) {
    // eslint-disable-next-line no-restricted-syntax
    for (const child of node.children) {
      traverse(child, assignee);
    }
  }
}

function traverseUser(node, data) {
  if (node.users) {
    data.users = _.union(
      data.users,
      node.users.map((user) => user._id)
    );
  }
  if (node.children) {
    // eslint-disable-next-line no-restricted-syntax
    for (const child of node.children) {
      traverse(child, data);
    }
  }
}

export default function BroadCastContactsDialog({ open, onClose, current, onUpdateRefresh }) {
  const dispatch = useDispatch();

  const { active } = useSelector((state) => state.scope);

  const { details } = useSelector((state) => state.membership);

  const [currentOrganization, setCurrentOrganization] = useState([]);

  const [currentFirstOrganization, setCurrentFirstOrganization] = useState([]);

  const [levels, setLevels] = useState([]);

  const [searchContacts, setSearchContacts] = useState('');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const [buttonLoading, setButtonLoading] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(-1);

  const [user, setUser] = useState([]);

  const { enqueueSnackbar } = useSnackbar();

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

  const defaultValues = useMemo(() => ({}), []);

  const onChildren = (organization) => {
    if (organization.children || organization.users) {
      const level = {
        name: organization.label,
        to: organization._id,
      };
      levels.push(level);
      setCurrentOrganization([
        ...(organization.children || []),
        ...(organization.users || []).map((item) => ({
          _id: item._id,
          name: item.username,
          photoURL: item.photoURL,
          email: item.email,
          displayName: item.displayName,
          realName: item.realName,
        })),
      ]);
      setLevels(levels);
    }
  };

  const onGoTo = async (level) => {
    let index = 0;
    const length = _.findIndex(levels, ['to', level.to]);
    let isChildren = false;
    let currentOrganizations = currentFirstOrganization;
    const levels2 = [];
    while (index < length) {
      isChildren = true;
      const currentLevel = levels[index];
      currentOrganizations = _.find(currentOrganizations, ['_id', currentLevel.to]);
      index += 1;
      levels2.push(currentLevel);
    }
    if (isChildren) {
      await setCurrentOrganization([
        ...currentOrganizations.children,
        ...currentOrganizations.users.map((item) => ({
          _id: item._id,
          name: item.username,
          photoURL: item.photoURL,
          email: item.email,
          displayName: item.displayName,
          realName: item.realName,
        })),
      ]);
    } else {
      await setCurrentOrganization(currentOrganizations);
    }
    setLevels(levels2);
  };

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const { control, handleSubmit } = methods;

  const handleSearchContacts = (event) => {
    setSearchContacts(event.target.value);
  };

  const handleDelete = async () => {
    try {
      setButtonLoading(true);
      await notificationService.deleteUser({
        _id: user._id,
      });
      enqueueSnackbar('删除成功');
      setButtonLoading(false);
      handleCloseConfirm();
      onUpdateRefresh({
        type: 'delete',
        data: {
          user_id: user._id,
        },
      });
    } catch (e) {
      enqueueSnackbar('删除失败');
      setButtonLoading(false);
    }
  };
  const handleAdd = async (contact) => {
    // setIsUpdate(false)
    enqueueSnackbar('正在添加,请耐心稍等');
    setCurrentIndex(contact._id);
    setButtonLoading(true);
    try {
      let datas = [];
      let addUsers = {
        users: [],
      };
      if (contact.type === 'org') {
        traverseUser(contact, addUsers);
      } else {
        addUsers = {
          users: [contact._id],
        };
      }
      datas = await notificationService.addUsers({
        users_id: addUsers.users,
        notification_id: current._id,
      });
      contact.checked = true;
      enqueueSnackbar('添加成功');
      onUpdateRefresh({
        type: 'add',
        datas,
      });
      setCurrentIndex(-1);
      setButtonLoading(false);
    } catch (e) {
      setCurrentIndex(-1);
      setButtonLoading(false);
      enqueueSnackbar('添加失败,请联系管理员!');
    }
    // getData();
  };

  const onRefresh = useCallback(async () => {
    if (currentFirstOrganization.length <= 0) {
      setLoading(true);
      const data = await dispatch(getOrganizations(active._id));
      const currentData = _.cloneDeep(data);
      // const assignee = details.participantsBy[current._id].map(item => ({ ...item, _id: item.user_id }))
      // for (let i = 0; i < currentData.length; i += 1) {
      //   traverse(currentData[i], assignee)
      // }
      setCurrentFirstOrganization(currentData);
      setCurrentOrganization(currentData);
      setLoading(false);
    }
  }, [active._id, currentFirstOrganization.length, dispatch]);

  useEffect(() => {
    if (open) {
      // setIsUpdate(true);
      onRefresh();
    } else {
      setLevels([]);
      setCurrentOrganization([]);
      setCurrentFirstOrganization([]);
    }
    // return () => {
    //   setLevels([])
    //   setCurrentOrganization([])
    // }
  }, [onRefresh, open]);

  const isNotFound = !!searchContacts;

  const renderOrganizationsItem = (contact, id, checked) => (
    <Box key={id}>
      <ListItem
        disableGutters
        secondaryAction={
          <div>
            <LoadingButton
              size="small"
              loading={buttonLoading && contact._id === currentIndex}
              color={checked ? 'primary' : 'inherit'}
              onClick={() => !checked && handleAdd(contact)}
              startIcon={<Iconify icon={checked ? 'eva:checkmark-fill' : 'eva:plus-fill'} />}
            >
              {checked ? '已添加' : '添加'}
            </LoadingButton>
            {checked && false && (
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
          <Avatar src={contact.type === 'org' ? contact?.avatarUrl?.preview : contact?.photoURL} />
        </ListItemAvatar>

        <ListItemText
          // key={contact._id}
          onClick={() => onChildren(contact)}
          sx={{ cursor: 'pointer' }}
          primaryTypographyProps={{ typography: 'subtitle2', sx: { mb: 0.25 } }}
          secondaryTypographyProps={{ typography: 'caption' }}
          primary={
            contact.type === 'org' ? contact.name : `${contact.displayName}(${contact.realName})`
          }
          secondary={contact.type === 'org' ? '' : contact.email}
        />
      </ListItem>
    </Box>
  );
  const renderOrganizations = (
    <Scrollbar
      sx={{
        px: 2.5,
        height: ITEM_HEIGHT * 6,
      }}
    >
      {levels && levels.length > 0 && (
        <Stack direction="row" alignItems="center" justifyContent="flex-start" sx={{ m: 1 }}>
          {levels.map((level, index) => (
            <Box key={index} sx={{ display: 'flex' }}>
              <Link onClick={() => onGoTo(level)} sx={styles}>
                {`${level.name}`}{' '}
              </Link>
              <div style={{ margin: '0 4px' }}> /</div>
            </Box>
          ))}
        </Stack>
      )}
      {currentOrganization
        .filter((contact) => !!contact)
        .map((contact, id) => {
          let isChecked = false;
          if (contact.type === 'org') {
            isChecked =
              _.intersectionBy(
                contact.users || [],
                (details?.participantsBy[current?._id] || []).map((item) => ({
                  ...item,
                  _id: item.user_id,
                })),
                '_id'
              ).length === (contact.users || []).length;
          } else {
            isChecked =
              (details?.participantsBy[current?._id] || []).filter(
                (person) => person.user_id === contact._id
              ).length > 0;
          }
          return renderOrganizationsItem(contact, id, isChecked);
        })}
      {/* {levels && levels.length > 0 ?
        currentOrganization.filter(contact => !!contact).map((contact, id) => {
          let checked = false;
          if(contact.type === 'org'){
            console.log('contact.users',id)
            // checked = _.intersectionBy((contact.users || []),assignee.map(item=> ({ ...item,  _id: item._id})), "_id").length === (contact.users || []).length
          } else {
            checked = assignee.filter((person) => person.user_id === contact._id).length > 0;
          }
          return renderOrganizationsItem(contact, id, checked)
        }) : organizations.map((contact, id) => {
          let checked = false;
          if(contact.type === 'org'){
            console.log('contact.users2',id)
            // checked = _.intersectionBy((contact.users || []),assignee.map(item=> ({ ...item, _id: item.user_id})), "_id").length === (contact.users || []).length
          } else {
            checked = assignee.filter((person) => person.user_id === contact._id).length > 0;
          }
          return renderOrganizationsItem(contact, id, checked)
        })} */}
    </Scrollbar>
  );
  return (
    <>
      <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose}>
        <DialogTitle sx={{ pb: 1 }}>
          用户列表
          {/** <Typography component="span">({_contacts.length})</Typography> */}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {/**
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
                  label={
                    <Typography variant="subtitle2" >
                      显示已添加用户
                    </Typography>
                  }
                  sx={{ mx: 0.5, mb: 0, width: 1, justifyContent: 'space-between' }}
                />
              </FormProvider>
            </Box>
             */}
          <Divider />
          {!loading ? (
            <div>
              {isNotFound ? (
                <SearchNotFound query={searchContacts} sx={{ mt: 3, mb: 10 }} />
              ) : (
                renderOrganizations
              )}
            </div>
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
          <Button variant="contained" color="error" onClick={handleDelete} loading={buttonLoading}>
            删除
          </Button>
        }
      />
    </>
  );
}
