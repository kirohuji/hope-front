import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Stack, Avatar, Tooltip, Divider, IconButton } from '@mui/material';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
import OrganContactsDialog from './organ-contacts-dialog';

// ----------------------------------------------------------------------

const StyledLabel = styled('span')(({ theme }) => ({
  ...theme.typography.caption,
  width: 120,
  flexShrink: 0,
  color: theme.palette.text.secondary,
}));

// ----------------------------------------------------------------------

OrganDetail.propTypes = {
  current: PropTypes.object,
};

export default function OrganDetail({ current }) {
  const [openContacts, setOpenContacts] = useState(false);

  const handleOpenContacts = () => {
    setOpenContacts(true);
  };

  const handleCloseContacts = () => {
    setOpenContacts(false);
  };
  return (
    <Scrollbar>
      <Divider />
      <Stack direction="row" spacing={3} sx={{ pt: 3, pb: 5 }}>
        <StyledLabel sx={{ height: 40, lineHeight: '40px', my: 0.5 }}>已有成员</StyledLabel>

        <Stack direction="row" flexWrap="wrap" alignItems="center">
          {current.users.map((user) => (
            <Avatar
              key={user.account._id}
              alt={user.displayName}
              src={user.avatar}
              sx={{ m: 0.5 }}
            />
          ))}

          <Tooltip title="添加成员">
            <IconButton
              onClick={handleOpenContacts}
              sx={{
                p: 1,
                ml: 0.5,
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                border: (theme) => `dashed 1px ${theme.palette.divider}`,
              }}
            >
              <Iconify icon="eva:plus-fill" />
            </IconButton>
          </Tooltip>

          <OrganContactsDialog
            current={current}
            open={openContacts}
            onClose={handleCloseContacts}
          />
        </Stack>
      </Stack>
    </Scrollbar>
  );
}
