import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import {
  Avatar,
  Button,
  Divider,
  Tooltip,
  ListItem,
  MenuItem,
  ListItemText,
  ListItemAvatar,
} from '@mui/material';
// components
import Iconify from 'src/components/iconify';
import MenuPopover from 'src/components/menu-popover';

// ----------------------------------------------------------------------

JoinedUserItem.propTypes = {
  person: PropTypes.shape({
    displayName: PropTypes.string,
    emails: PropTypes.array,
    avatarUrl: PropTypes.string,
    permission: PropTypes.string,
  }),
};

export default function JoinedUserItem({ person }) {
  const [permission] = useState(person.permission);

  const [openPopover, setOpenPopover] = useState(null);

  const handleOpenPopover = (event) => {
    setOpenPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  // const handleChangePermission = (newPermission) => {
  //   setPermission(newPermission);
  // };

  return (
    <>
      <ListItem disableGutters>
        <ListItemAvatar>
          <Avatar alt={person.displayName} src={person.avatarUrl} />
        </ListItemAvatar>

        <ListItemText
          primary={person.displayName}
          secondary={
            <Tooltip title={person.displayName}>
              <span>{person.emails[0].address}</span>
            </Tooltip>
          }
          primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
          secondaryTypographyProps={{ noWrap: true }}
          sx={{ flexGrow: 1, pr: 1 }}
        />

        <Button
          size="small"
          color="inherit"
          endIcon={<Iconify icon={openPopover ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} />}
          onClick={handleOpenPopover}
          sx={{
            flexShrink: 0,
            textTransform: 'unset',
            fontWeight: 'fontWeightMedium',
            '& .MuiButton-endIcon': {
              ml: 0,
            },
            ...(openPopover && {
              bgcolor: 'action.selected',
            }),
          }}
        >
          编辑 {permission}
        </Button>
      </ListItem>

      <MenuPopover open={openPopover} onClose={handleClosePopover} sx={{ width: 160 }}>
        <>
{
  /**
        <MenuItem
            onClick={() => {
              handleClosePopover();
              handleChangePermission('view');
            }}
            sx={{
              ...(permission === 'view' && {
                bgcolor: 'action.selected',
              }),
            }}
          >
            <Iconify icon="eva:eye-fill" />
            Can view
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleClosePopover();
              handleChangePermission('edit');
            }}
            sx={{
              ...(permission === 'edit' && {
                bgcolor: 'action.selected',
              }),
            }}
          >
            <Iconify icon="eva:edit-fill" />
            Can edit
          </MenuItem>
   */
}

          <Divider sx={{ borderStyle: 'dashed' }} />

          <MenuItem
            onClick={() => {
              handleClosePopover();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="eva:trash-2-outline" />
            删除
          </MenuItem>
        </>
      </MenuPopover>
    </>
  );
}