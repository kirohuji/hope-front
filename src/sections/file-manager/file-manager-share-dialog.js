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
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
//
import { userService } from 'src/composables/context-provider';
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

  const [sendSearchContacts, setSendSearchContacts] = useState({
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
      setSendSearchContacts({
        results: [...sendSearchContacts.results, result],
      });
      handleClickAwaySearch();
    },
    [handleClickAwaySearch, sendSearchContacts]
  );

  const renderListResults = (
    <FileManagerSearchResults
      query={searchContacts.query}
      results={searchContacts.results}
      onClickResult={handleClickResult}
    />
  );

  const handleSearchContacts = useCallback(
    async (inputValue) => {
      setSearchContacts((prevState) => ({
        ...prevState,
        query: inputValue,
      }));

      if (inputValue) {
        // const results = [].filter((contact) =>
        //   contact.username.toLowerCase().includes(inputValue)
        // );
        const response = await userService.pagination(
          {
            username: inputValue
          },
          {}
        )

        setSearchContacts((prevState) => ({
          ...prevState,
          results: response.data,
        }));
      }
    },
    []
  );

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={()=>{
      setSendSearchContacts({
        results: []
      })
      onClose()
    }} {...other}>
      <DialogTitle> 邀请 </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        {onChangeInvite && (
          <TextField
            fullWidth
            value={searchContacts.query}
            placeholder="用户名"
            onChange={(event) => {
              onChangeInvite(event)
              handleSearchContacts(event.target.value)
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
            // InputProps={{
            //   endAdornment: (
            //     <InputAdornment position="end">
            //       <Button
            //         onClick={onInviteEmail}
            //         color="inherit"
            //         variant="contained"
            //         disabled={!inviteEmail}
            //         sx={{ mr: -0.75 }}
            //       >
            //         发送邀请
            //       </Button>
            //     </InputAdornment>
            //   ),
            // }}
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
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h6" sx={{ mb: 1 }}>待邀请列表</Typography>
              <Button
                onClick={onInviteEmail}
                color="inherit"
                variant="contained"
                disabled={!inviteEmail}
                sx={{ mr: -0.75 }}
              >
                发送邀请
              </Button>
            </Stack>
            {hasShared && (
              <Scrollbar sx={{ maxHeight: 60 * 6 }}>
                <List disablePadding>
                  {sendSearchContacts.results.map((person) => (
                    <FileManagerInvitedItem key={person._id} person={person} />
                  ))}
                </List>
              </Scrollbar>
            )}
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
          <Button variant="outlined" color="inherit" onClick={()=>{
            setSendSearchContacts({
              results: []
            })
            onClose()
          }}>
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
