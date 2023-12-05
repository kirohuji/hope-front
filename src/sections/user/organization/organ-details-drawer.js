import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
// @mui
import {
  Box,
  Chip,
  List,
  Stack,
  Drawer,
  Button,
  Divider,
  TextField,
  Typography,
  IconButton,
  Autocomplete,
} from '@mui/material';
// utils
import { fData } from 'src/utils/format-number';
import { fDateTime } from 'src/utils/format-time';
import { useSelector } from 'src/redux/store';

import { roleService } from 'src/composables/context-provider';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { fileFormat } from 'src/components/file-thumbnail';
//
import OrganContactsDialog from './organ-contacts-dialog';
import JoinedUserItem from './joined-user-item';

// ----------------------------------------------------------------------

OrganDetailsDrawer.propTypes = {
  open: PropTypes.bool,
  item: PropTypes.object,
  onClose: PropTypes.func,
  onDelete: PropTypes.func,
  onChangeLeader: PropTypes.func,
};

export default function OrganDetailsDrawer ({
  item,
  open,
  onClose,
  onDelete,
  onChangeLeader,
  ...other
}) {
  const { name, size, type, dateModified, leader } = item;

  const { active } = useSelector((state) => state.scope);

  const [users, setUsers] = useState([]);

  const hasUsers = users && !!users.length;

  const [openContacts, setOpenContacts] = useState(false);

  const [toggleTags, setToggleTags] = useState(true);

  const [tags, setTags] = useState(item.tags ? item.tags.slice(0, 3) : []);

  const [toggleProperties, setToggleProperties] = useState(true);

  const getUsers = useCallback(async () => {
    const response = await roleService.getUsersInRoleOnly({
      options: {
        scope: active._id,
      },
      roles: item._id,
    });
    setUsers(response.data)
  }, [active, item, setUsers]);
  useEffect(() => {
    if(open){
      getUsers();
    }
  }, [open, getUsers]);

  const handleToggleTags = () => {
    setToggleTags(!toggleTags);
  };

  const handleToggleProperties = () => {
    setToggleProperties(!toggleProperties);
  };

  const handleOpenContacts = () => {
    setOpenContacts(true);
  };

  const handleCloseContacts = () => {
    getUsers();
    setOpenContacts(false);
  };
  const onSelectMain = async (person) => {
    await roleService.changeLeader({
      _id: item._id,
      leader_id: person._id
    })
    getUsers();
    onChangeLeader(person)
  }

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        BackdropProps={{
          invisible: true,
        }}
        PaperProps={{
          sx: { width: 320 },
        }}
        {...other}
      >
        <Scrollbar sx={{ height: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5 }}>
            <Typography variant="h6"> 信息 </Typography>

            {
              /**
                  <Checkbox
                  color="warning"
                  icon={<Iconify icon="eva:star-outline" />}
                  checkedIcon={<Iconify icon="eva:star-fill" />}
                  sx={{ p: 0.75 }}
                />
               */
            }
          </Stack>

          <Stack
            spacing={2.5}
            justifyContent="center"
            sx={{ p: 2.5, bgcolor: 'background.neutral' }}
          >
            {
              /**
           <FileThumbnail
                    imageView
                    file={type === 'folder' ? type : url}
                    sx={{ width: 64, height: 64 }}
                    imgSx={{ borderRadius: 1 }}
                  />
      
               */
            }
            <Typography variant="h6" sx={{ wordBreak: 'break-all' }}>
              {name}
            </Typography>

            <Divider sx={{ borderStyle: 'dashed' }} />

            <Stack spacing={1}>
              <Panel label="标签" toggle={toggleTags} onToggle={handleToggleTags} />

              {toggleTags && (
                <Autocomplete
                  multiple
                  freeSolo
                  limitTags={2}
                  options={tags.map((option) => option)}
                  value={tags}
                  onChange={(event, newValue) => {
                    setTags([...tags, ...newValue.filter((option) => tags.indexOf(option) === -1)]);
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        size="small"
                        variant="soft"
                        label={option}
                        key={option}
                      />
                    ))
                  }
                  renderInput={(params) => <TextField {...params} placeholder="#添加一个标签" />}
                />
              )}
            </Stack>

            <Stack spacing={1.5}>
              <Panel
                label="基本属性"
                toggle={toggleProperties}
                onToggle={handleToggleProperties}
              />

              {toggleProperties && (
                <Stack spacing={1.5}>
                  {false && <Row label="负责人" value={fData(size)} />}

                  {item.type === "org" && <Row label="负责人" value={leader?.username} />}

                  {false && <Row label="代码" value={fDateTime(dateModified)} />}

                  {false && <Row label="类型" value={fileFormat(type)} />}
                </Stack>
              )}
            </Stack>
          </Stack>

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5 }}>
            <Typography variant="subtitle2"> 成员 </Typography>

            <IconButton
              size="small"
              color="success"
              onClick={handleOpenContacts}
              sx={{
                p: 0,
                width: 24,
                height: 24,
                color: 'common.white',
                bgcolor: 'success.main',
                '&:hover': {
                  bgcolor: 'success.main',
                },
              }}
            >
              <Iconify icon="eva:plus-fill" />
            </IconButton>
          </Stack>

          {hasUsers && (
            <List disablePadding sx={{ pl: 2.5, pr: 1 }}>
              {users.map((person) => (
                <JoinedUserItem node={item} key={person._id} leader={leader} person={person} onSelectMain={() => onSelectMain(person)} />
              ))}
            </List>
          )}
        </Scrollbar>

        <Box sx={{ p: 2.5 }}>
          <Button
            fullWidth
            variant="soft"
            color="error"
            size="large"
            startIcon={<Iconify icon="eva:trash-2-outline" />}
            onClick={onDelete}
          >
            删除
          </Button>
        </Box>
      </Drawer>

      <OrganContactsDialog
        current={item}
        open={openContacts}
        onClose={handleCloseContacts}
      />
      {/**
          <FileShareDialog
        open={openShare}
        shared={shared}
        inviteEmail={inviteEmail}
        onChangeInvite={handleChangeInvite}
        onCopyLink={onCopyLink}
        onClose={() => {
          handleCloseShare();
          setInviteEmail('');
        }}
      />
    */}
    </>
  );
}

// ----------------------------------------------------------------------

Panel.propTypes = {
  toggle: PropTypes.bool,
  label: PropTypes.string,
  onToggle: PropTypes.func,
};

function Panel ({ label, toggle, onToggle, ...other }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" {...other}>
      <Typography variant="subtitle2"> {label} </Typography>

      <IconButton size="small" onClick={onToggle}>
        <Iconify icon={toggle ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} />
      </IconButton>
    </Stack>
  );
}

// ----------------------------------------------------------------------

Row.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
};

function Row ({ label, value = '' }) {
  return (
    <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
      <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
        {label}
      </Box>

      {value}
    </Stack>
  );
}
