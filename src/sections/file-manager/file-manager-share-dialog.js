import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';
// @mui
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
//
import FileManagerInvitedItem from './file-manager-invited-item';
import FileManagerSearchResults from './file-manager-search-results';

// ----------------------------------------------------------------------

export default function FileManagerShareDialog ({
  shared,
  inviteEmail,
  onInviteEmail,
  onCopyLink,
  onChangeInvite,
  //
  open,
  onClose,
  ...other
}) {
  const hasShared = shared && !!shared.length;

  const [searchContacts, setSearchContacts] = useState({
    query: '',
    results: [],
  });
  const handleClickAwaySearch = useCallback(() => {
    setSearchContacts({
      query: '',
      results: [],
    });
  }, []);
  const handleClickResult = useCallback(
    (result) => {
      handleClickAwaySearch();
    },
    [handleClickAwaySearch]
  );
  
  const renderListResults = (
    <FileManagerSearchResults
      query={searchContacts.query}
      results={searchContacts.results}
      onClickResult={handleClickResult}
    />
  );

    const handleSearchContacts = useCallback(
    (inputValue) => {
      setSearchContacts((prevState) => ({
        ...prevState,
        query: inputValue,
      }));

      if (inputValue) {
        const results = [].filter((contact) =>
          contact.username.toLowerCase().includes(inputValue)
        );

        setSearchContacts((prevState) => ({
          ...prevState,
          results,
        }));
      }
    },
    []
  );

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
      <DialogTitle> 邀请 </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        {onChangeInvite && (
          <TextField
            fullWidth
            value={searchContacts.query}
            placeholder="Email"
            onChange={(event)=>{
              onChangeInvite(event)
              handleSearchContacts(event.target.value)
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    onClick={onInviteEmail}
                    color="inherit"
                    variant="contained"
                    disabled={!inviteEmail}
                    sx={{ mr: -0.75 }}
                  >
                    发生邀请
                  </Button>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        )}
        {
          searchContacts.query && renderListResults
        }
        {
          !searchContacts.query &&
          <>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>已邀请列表</Typography>
            {hasShared && (
              <Scrollbar sx={{ maxHeight: 60 * 6 }}>
                <List disablePadding>
                  {shared.map((person) => (
                    <FileManagerInvitedItem key={person._id} person={person} />
                  ))}
                </List>
              </Scrollbar>
            )}
          </>
        }
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between' }}>
        {onCopyLink && (
          <Button startIcon={<Iconify icon="eva:link-2-fill" />} onClick={onCopyLink}>
            拷贝链接
          </Button>
        )}

        {onClose && (
          <Button variant="outlined" color="inherit" onClick={onClose}>
            关闭
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

FileManagerShareDialog.propTypes = {
  inviteEmail: PropTypes.string,
  onChangeInvite: PropTypes.func,
  onInviteEmail: PropTypes.func,
  onClose: PropTypes.func,
  onCopyLink: PropTypes.func,
  open: PropTypes.bool,
  shared: PropTypes.array,
};
