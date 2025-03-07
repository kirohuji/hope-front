import { useState, useCallback } from 'react';
import { m } from 'framer-motion';
// @mui
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Dialog, { dialogClasses } from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import LoadingButton from '@mui/lab/LoadingButton';
import { useSelector } from 'src/redux/store';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useSnackbar } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { useEventListener } from 'src/hooks/use-event-listener';
// components
import { varHover } from 'src/components/animate';
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
import _ from 'lodash';
import { postService } from 'src/composables/context-provider';
import DiscoveryPostNewEditForm from 'src/sections/discovery/discovery-post-new-edit-form';
import DiscoveryCompose from 'src/sections/discovery//discovery-compose';
// ----------------------------------------------------------------------

export default function ChatPopover() {
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const scope = useSelector((state) => state.scope);

  const theme = useTheme();

  const feed = useBoolean();

  const handleClose = useCallback(() => {
    feed.onFalse();
  }, [feed]);

  const handleKeyDown = (event) => {
    if (event.key === 'k' && event.metaKey) {
      feed.onToggle();
    }
  };

  useEventListener('keydown', handleKeyDown);

  const createPost = useCallback((event) => {}, []);

  const renderButton = (
    <IconButton
      component={m.button}
      whileTap="tap"
      whileHover="hover"
      variants={varHover(1.05)}
      onClick={feed.onTrue}
      sx={{ pl: '2px' }}
    >
      <Iconify icon="lets-icons:fire-duotone-fill" width={30} />
    </IconButton>
  );
  return (
    <>
      {renderButton}
      {feed.value && <DiscoveryCompose onCloseCompose={feed.onFalse} />}
      {/* <Dialog
        fullWidth
        open={feed.value}
        onClose={handleClose}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: 0,
        }}
        PaperProps={{
          sx: {
            m: 0,
            p: 0,
            width: '100%',
            height: '100%',
            borderRadius: 0,
            maxHeight: '100%',
            overflow: 'unset',
          },
        }}
        sx={{
          [`& .${dialogClasses.container}`]: {
            alignItems: 'flex-start',
          },
        }}
      >
        <Box className="post-dialog">
          <DialogTitle sx={{ p: 1 }}>
            <Stack sx={{ p: 0, m: 0, mb: 0 }} justifyContent="space-between" flexDirection="row">
              <Box>
                <Button size="small" type="submit" variant="text" onClick={handleClose}>
                  取消
                </Button>
              </Box>
              <Box>
                <LoadingButton
                  size="small"
                  type="submit"
                  variant="soft"
                  loading={loading}
                  onClick={createPost}
                >
                  确定
                </LoadingButton>
              </Box>
            </Stack>
          </DialogTitle>
          <Scrollbar sx={{ p: 0, pb: 0, height: 'calc(100vh - 70px)' }}>
            <DiscoveryPostNewEditForm />
          </Scrollbar>
        </Box>
      </Dialog> */}
    </>
  );
}
