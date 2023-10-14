import PropTypes from 'prop-types';
// @mui
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
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

// ----------------------------------------------------------------------

export default function FileManagerShareDialog({
  shared,
  inviteEmail,
  onCopyLink,
  onChangeInvite,
  //
  open,
  onClose,
  ...other
}) {
  const hasShared = shared && !!shared.length;

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
      <DialogTitle> 邀请 </DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        {onChangeInvite && (
          <TextField
            fullWidth
            value={inviteEmail}
            placeholder="Email"
            onChange={onChangeInvite}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Button
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

        {hasShared && (
          <Scrollbar sx={{ maxHeight: 60 * 6 }}>
            <List disablePadding>
              {shared.map((person) => (
                <FileManagerInvitedItem key={person.id} person={person} />
              ))}
            </List>
          </Scrollbar>
        )}
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
  onClose: PropTypes.func,
  onCopyLink: PropTypes.func,
  open: PropTypes.bool,
  shared: PropTypes.array,
};
