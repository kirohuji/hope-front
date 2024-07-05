import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';
// @mui
import List from '@mui/material/List';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
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

// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
//
import { userService } from 'src/composables/context-provider';
import _ from 'lodash';
import FileManagerInvitedItem from './file-manager-invited-item';
import FileManagerSearchResults from './file-manager-search-results';
// ----------------------------------------------------------------------

export default function FileManagerShareDialog({
  shared,
  inviteEmail,
  onInviteEmail,
  onInviteEmails,
  onCopyLink,
  onChangeInvite,
  //
  open,
  onClose,
  ...other
}) {
  const [loading, setLoading] = useState(true);
  const hasShared = true;
  // const hasShared = shared && !!shared.length;

  const [searchText, setSearchText] = useState('');

  const debouncedSearchText = useDebounce(searchText);

  const [searchContacts, setSearchContacts] = useState([]);

  const [sendSearchContacts, setSendSearchContacts] = useState({
    query: '',
    results: [],
  });

  const handleClickAwaySearch = useCallback(() => {
    setSearchText('');
    setSearchContacts([]);
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

  const renderListResults = loading ? (
    <Box
      sx={{
        zIndex: 10,
        backgroundColor: '#ffffffc4',
        paddingTop: '92px',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <CircularProgress />
    </Box>
  ) : (
    <FileManagerSearchResults
      query={searchText}
      results={searchContacts}
      onClickResult={handleClickResult}
    />
  );

  const handleFetchSearchContacts = useCallback(
    async (inputValue) => {
      setLoading(true);
      const response = await userService.pagination(
        {
          username: inputValue,
        },
        {}
      );
      setSearchContacts(_.differenceBy(response.data, shared, '_id'));
      setLoading(false);
    },
    [shared]
  );

  useEffect(() => {
    if (open) {
      handleFetchSearchContacts(debouncedSearchText);
    }
  }, [debouncedSearchText, handleFetchSearchContacts, open]);
  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      onClose={() => {
        setSendSearchContacts({
          results: [],
        });
        onClose();
      }}
      {...other}
    >
      <DialogTitle> 邀请 </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        {onChangeInvite && (
          <TextField
            fullWidth
            value={searchText}
            placeholder="用户名"
            onChange={(event) => {
              onChangeInvite(event);
              setSearchText(event.target.value);
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
        {searchText && renderListResults}
        {!searchText && (
          <>
            <Divider sx={{ mb: 1 }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h6" sx={{ pt: 1 }}>
                待邀请列表
              </Typography>
              <Button
                onClick={() => {
                  onInviteEmails(sendSearchContacts);
                }}
                color="inherit"
                variant="contained"
                disabled={!inviteEmail}
                sx={{ mr: -0.75, mb: 1 }}
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
            <Typography variant="h6" sx={{ mb: 1 }}>
              已邀请列表
            </Typography>
            {hasShared && (
              <Scrollbar sx={{ maxHeight: 60 * 6 }}>
                <List disablePadding>
                  {shared &&
                    shared.map((person) => (
                      <FileManagerInvitedItem key={person._id} person={person} />
                    ))}
                </List>
              </Scrollbar>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between' }}>
        {onCopyLink && (
          <Button startIcon={<Iconify icon="eva:link-2-fill" />} onClick={onCopyLink}>
            拷贝链接
          </Button>
        )}

        {onClose && (
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              setSendSearchContacts({
                results: [],
              });
              onClose();
            }}
          >
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
  onInviteEmails: PropTypes.func,
  onClose: PropTypes.func,
  onCopyLink: PropTypes.func,
  open: PropTypes.bool,
  shared: PropTypes.array,
};
