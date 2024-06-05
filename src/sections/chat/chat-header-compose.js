import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
// components
import Iconify from 'src/components/iconify';
import SearchNotFound from 'src/components/search-not-found';

// ----------------------------------------------------------------------

export default function ChatHeaderCompose({ contacts, onAddRecipients, selectedContacts }) {
  const [searchRecipients, setSearchRecipients] = useState('');

  const handleAddRecipients = useCallback(
    (selected) => {
      setSearchRecipients('');
      onAddRecipients(selected);
    },
    [onAddRecipients]
  );

  return (
    <>
      <Typography variant="subtitle2" sx={{ color: 'text.primary', mr: 2 }}>
        和:
      </Typography>

      <Autocomplete
        sx={{ minWidth: 290, p: 1 }}
        multiple
        limitTags={3}
        disabled
        value={selectedContacts}
        popupIcon={null}
        // disabled
        disableCloseOnSelect
        noOptionsText={<SearchNotFound query={searchRecipients} />}
        onChange={(event, newValue) => handleAddRecipients(newValue)}
        onInputChange={(event, newValue) => setSearchRecipients(newValue)}
        options={contacts}
        getOptionLabel={(recipient) => recipient.username}
        isOptionEqualToValue={(option, value) => option._id === value._id}
        renderInput={(params) => <TextField {...params} placeholder="+ 联系人" />}
        renderOption={(props, recipient, { selected }) => (
          <li {...props} key={recipient._id}>
            <Box
              key={recipient._id}
              sx={{
                mr: 1,
                width: 32,
                height: 32,
                overflow: 'hidden',
                borderRadius: '50%',
                position: 'relative',
              }}
            >
              <Avatar
                alt={recipient.username}
                src={recipient.photoURL}
                sx={{ width: 1, height: 1 }}
              />
              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{
                  top: 0,
                  left: 0,
                  width: 1,
                  height: 1,
                  opacity: 0,
                  position: 'absolute',
                  bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
                  transition: (theme) =>
                    theme.transitions.create(['opacity'], {
                      easing: theme.transitions.easing.easeInOut,
                      duration: theme.transitions.duration.shorter,
                    }),
                  ...(selected && {
                    opacity: 1,
                    color: 'primary.main',
                  }),
                }}
              >
                <Iconify icon="eva:checkmark-fill" />
              </Stack>
            </Box>

            {/* {recipient.username} */}
            {`${recipient?.displayName || ''}(${recipient?.realName})`}
          </li>
        )}
        renderTags={(selected, getTagProps) =>
          selected.map((recipient, index) => (
            <Chip
              {...getTagProps({ index })}
              key={recipient._id}
              label={`${recipient?.displayName || ''}(${recipient?.realName})`}
              avatar={<Avatar alt={recipient.username} src={recipient.photoURL} />}
              size="small"
              variant="soft"
            />
          ))
        }
      />
    </>
  );
}

ChatHeaderCompose.propTypes = {
  selectedContacts: PropTypes.array,
  contacts: PropTypes.array,
  onAddRecipients: PropTypes.func,
};
