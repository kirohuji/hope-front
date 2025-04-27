import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// components
import { useSettingsContext } from 'src/components/settings';

// capacitor
// import { Capacitor } from '@capacitor/core';
// import { Device } from '@capacitor/device';
import CryptoJS from 'crypto-js';
//
import { paths } from 'src/routes/paths';
import { useDispatch, useSelector } from 'src/redux/store';
import { getScopes, setScope } from 'src/redux/slices/scope';
import { useMeteorContext } from 'src/meteor/hooks';
import { useEffect } from 'react';
import { useSnackbar } from 'src/components/snackbar';
import { useRouter, usePathname } from 'src/routes/hook';
import { useAuthContext } from 'src/auth/hooks';
import { messagingService } from 'src/composables/context-provider';
import {
  conversationsCollectionChange,
  conversationsPublish,
} from 'src/meteor/context/meteor-provider';
import { HEADER, NAV } from '../config-layout';

const secretKey = 'future';
// ----------------------------------------------------------------------

const SPACING = 8;
const CustomSnackbar = ({ message, name, avatarUrl, onGoto }) => (
  <Box
    display="flex"
    alignItems="center"
    onClick={onGoto}
    sx={{ cursor: 'pointer', margin: '4px 0px' }}
  >
    <Avatar alt={name} src={avatarUrl} />
    <Box ml={2}>
      <Typography variant="subtitle2">{name}</Typography>
      <Typography
        variant="body2"
        sx={{
          whiteSpace: 'nowrap' /* 不换行 */,
          overflow: 'hidden' /* 超出部分隐藏 */,
          textOverflow: 'ellipsis' /* 超出部分显示... */,
          width: '235px',
        }}
      >
        {message}
      </Typography>
    </Box>
  </Box>
);
// async function updateDeviceStatus() {
//   if (Capacitor.isNativePlatform()) {
//     console.log('updateDeviceStatus');
//     const deviceId = await Device.getId();
//     messagingService.updateDeviceStatus({
//       deviceId,
//       status: 'active',
//     });
//   }
// }
export default function Main({ children, sx, ...other }) {
  const { isConnected, subConversations } = useMeteorContext();
  const settings = useSettingsContext();
  const lgUp = useResponsive('up', 'lg');
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const isNavHorizontal = settings.themeLayout === 'horizontal';
  const router = useRouter();
  const dispatch = useDispatch();
  const scope = useSelector((state) => state.scope);
  const isNavMini = settings.themeLayout === 'mini';
  const pathname = usePathname();
  const { user } = useAuthContext();

  function handleMessage(message) {
    switch (message.contentType) {
      case 'text':
        return CryptoJS.AES.decrypt(message.body, secretKey).toString(CryptoJS.enc.Utf8);
      case 'image':
        return '对方发送了一张图片给你';
      default:
        return CryptoJS.AES.decrypt(message.body, secretKey).toString(CryptoJS.enc.Utf8);
    }
  }
  useEffect(() => {
    // updateDeviceStatus();
    if (!scope.active?._id) {
      dispatch(getScopes());
      dispatch(setScope(user));
    }
    if (isConnected) {
      subConversations(async (conversation) => {
        if (pathname !== '/dashboard/chat' && pathname !== '/chat') {
          const message = await messagingService.getLastMessage({
            _id: conversation.id,
          });
          console.log('conversation',conversation)
          console.log('message',message)
          const key = enqueueSnackbar(
            <CustomSnackbar
              name={message.user.displayName}
              avatarUrl={message.user.photoURL}
              message={handleMessage(message)}
              conversationId={conversation.id}
              onGoto={() => {
                closeSnackbar(key);
                router.push(`${paths.chat}?id=${conversation.id}`);
              }}
            />,
            {
              variant: 'message',
              autoHideDuration: 3000,
              // persist: true,
            }
          );
        }
      });
      return () => {
        if (conversationsPublish) {
          conversationsCollectionChange.stop();
          conversationsPublish.stop();
        }
      };
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  if (isNavHorizontal) {
    return (
      <Box
        component="main"
        sx={{
          minHeight: 1,
          display: 'flex',
          flexDirection: 'column',
          pt: `${HEADER.H_MOBILE + 24}px`,
          pb: 10,
          ...(lgUp && {
            pt: `${HEADER.H_MOBILE * 2 + 40}px`,
            pb: 15,
          }),
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minHeight: 1,
        display: 'flex',
        flexDirection: 'column',
        py: `${HEADER.H_MOBILE + SPACING}px`,
        ...(lgUp && {
          px: 2,
          py: `${HEADER.H_DESKTOP + SPACING}px`,
          width: `calc(100% - ${NAV.W_VERTICAL}px)`,
          ...(isNavMini && {
            width: `calc(100% - ${NAV.W_MINI}px)`,
          }),
        }),
        ...sx,
      }}
      {...other}
    >
      {children}
    </Box>
  );
}

Main.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object,
};

CustomSnackbar.propTypes = {
  message: PropTypes.any,
  name: PropTypes.any,
  avatarUrl: PropTypes.any,
  onGoto: PropTypes.any,
};
