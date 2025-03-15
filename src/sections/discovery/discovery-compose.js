import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
// @mui
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Portal from '@mui/material/Portal';
import Backdrop from '@mui/material/Backdrop';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// redux
import { useSelector } from 'src/redux/store';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
import { Capacitor } from '@capacitor/core';
import { useSnackbar } from 'src/components/snackbar';
import { Keyboard } from '@capacitor/keyboard';
// components
import Iconify from 'src/components/iconify';
import Editor from 'src/components/editor';
import { postService } from 'src/composables/context-provider';
//
import moment from 'moment';

// ----------------------------------------------------------------------

const ZINDEX = 1998;

const POSITION = 24;

export default function DiscoveryCompose({ onCloseCompose }) {
  const { enqueueSnackbar } = useSnackbar();

  const smUp = useResponsive('up', 'sm');

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const scope = useSelector((state) => state.scope);

  const [message, setMessage] = useState('');

  const fullScreen = useBoolean();

  const handleChangeMessage = useCallback((value) => {
    setMessage(value);
  }, []);

  const setResizeMode = useCallback(async (mode) => {
    if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
      Keyboard.setResizeMode({
        mode,
      });
    }
  }, []);

  const onSend = useCallback (async ()=>{
    try{
      await postService.post({
        body: message,
        scope: scope.active._id,
        modifiedDate: moment(new Date()).format('YYYY/MM/DD'),
      });
      onCloseCompose();
      enqueueSnackbar('创建成功!');
    } catch(e){
      enqueueSnackbar('创建失败!');
      console.error(e);
    }
  },[enqueueSnackbar, message, onCloseCompose, scope.active._id])
  useEffect(() => {
    console.log('setResizeMode为 none');
    setResizeMode('none');
    if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
      Keyboard.addListener('keyboardWillShow', () => {
        console.log('setIsKeyboardVisible', true);
        setIsKeyboardVisible(true);
      });

      Keyboard.addListener('keyboardWillHide', () => {
        console.log('setIsKeyboardVisible', false);
        setIsKeyboardVisible(false);
      });
    }
    return () => {
      console.log('setResizeMode为 native');
      if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
        Keyboard.removeAllListeners();
        setResizeMode('native');
      }
    };
  }, [setResizeMode]);

  return (
    <Portal>
      {(fullScreen.value || !smUp) && <Backdrop open sx={{ zIndex: ZINDEX }} />}

      <Paper
        sx={{
          right: 0,
          bottom: isKeyboardVisible ? '366px' : 0,
          borderRadius: 2,
          display: 'flex',
          position: 'fixed',
          zIndex: ZINDEX + 1,
          m: `${POSITION}px`,
          overflow: 'hidden',
          flexDirection: 'column',
          boxShadow: (theme) => theme.customShadows.dropdown,
          ...(fullScreen.value && {
            m: 0,
            right: POSITION / 2,
            bottom: POSITION / 2,
            width: `calc(100% - ${POSITION}px)`,
            height: `calc(100% - ${POSITION}px)`,
          }),
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            bgcolor: 'background.neutral',
            p: (theme) => theme.spacing(1.5, 1, 1.5, 2),
          }}
        >
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            新想法
          </Typography>

          <IconButton onClick={fullScreen.onToggle}>
            <Iconify icon={fullScreen ? 'eva:collapse-fill' : 'eva:expand-fill'} />
          </IconButton>

          <IconButton onClick={onCloseCompose}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>

        {/* <InputBase
          placeholder="To"
          endAdornment={
            <Stack direction="row" spacing={0.5} sx={{ typography: 'subtitle2' }}>
              <Box sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Cc</Box>
              <Box sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Bcc</Box>
            </Stack>
          }
          sx={{
            px: 2,
            height: 48,
            borderBottom: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
        />

        <InputBase
          placeholder="Subject"
          sx={{
            px: 2,
            height: 48,
            borderBottom: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.08)}`,
          }}
        /> */}

        <Stack spacing={2} flexGrow={1} sx={{ p: 2 }}>
          <Editor
            simple
            isPost
            id="compose-mail"
            value={message}
            onChange={handleChangeMessage}
            placeholder="Type a message"
            sx={{
              '& .ql-editor': {},
              ...(fullScreen.value && {
                height: 1,
                '& .quill': {
                  height: 1,
                },
                '& .ql-editor': {
                  maxHeight: 'unset',
                },
              }),
            }}
          />

          <Stack direction="row" alignItems="center">
            <Stack direction="row" alignItems="center" flexGrow={1}>
              <IconButton>
                <Iconify icon="solar:gallery-add-bold" />
              </IconButton>

              <IconButton>
                <Iconify icon="eva:attach-2-fill" />
              </IconButton>
            </Stack>

            <Button
              variant="contained"
              color="primary"
              onClick={()=> onSend()}
              endIcon={<Iconify icon="iconamoon:send-fill" />}
            >
              发送
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Portal>
  );
}

DiscoveryCompose.propTypes = {
  onCloseCompose: PropTypes.func,
};
