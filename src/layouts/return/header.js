import PropTypes from 'prop-types';
// @mui
import { useTheme, styled } from '@mui/material/styles';
import { AppBar, Toolbar, Box } from '@mui/material';
// config
import { HEADER } from 'src/config-global';
// utils
import { bgBlur } from 'src/theme/css';
// routes
import { IconButtonAnimate } from 'src/components/animate';
import { useRouter, usePathname } from 'src/routes/hook';
import { useSelector } from 'src/redux/store';
import { useResponsive } from 'src/hooks/use-responsive';
import { useAuthContext } from 'src/auth/hooks';
// components
import Iconify from '../../components/iconify';
// ----------------------------------------------------------------------

Header.propTypes = {
  isOffset: PropTypes.bool,
};

const CircleText = styled('div')(({ theme }) => ({
  backgroundColor: '#ccc',
  width: '22px',
  height: '22px',
  borderRadius: '50%',
  marginTop: '2px',
  marginLeft: '-8px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '12px',
  color: '#333',
}));
export default function Header({ isOffset }) {
  const { user } = useAuthContext();
  const theme = useTheme();
  const router = useRouter();
  const mdUp = useResponsive('up', 'md');
  const chat = useSelector((state) => state.chat);
  const pathname = usePathname();

  const renderConversationTitle = () => {
    const { activeConversation } = chat;
    if (activeConversation && activeConversation?.participants?.length > 0) {
      const group = activeConversation.participants.length > 2;
      if (group) {
        if (activeConversation.label) {
          return `${activeConversation.label}(${activeConversation.participants.length})`;
        }
        return `${activeConversation.participants
          .map((participant) => participant.realName)
          .join(', ')}(群聊)`;
      }
      const otherParticipant = activeConversation.participants.find(
        (participant) => participant._id !== user._id
      );
      return otherParticipant?.realName || '';
    }
    return '';
  };
  return (
    <AppBar color="transparent" sx={{ boxShadow: 0 }} position={mdUp ? 'static' : 'absolute'}>
      <Toolbar
        sx={{
          height: {
            xs: HEADER.H_MOBILE,
            md: HEADER.H_MAIN_DESKTOP,
          },
          transition: theme.transitions.create(['height', 'background-color'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shorter,
          }),
          ...(isOffset && {
            ...bgBlur({ color: theme.palette.background.default }),
            height: {
              md: HEADER.H_MAIN_DESKTOP - 16,
            },
          }),
          // position: 'relative',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <div>{pathname === '/chat' && renderConversationTitle()}</div>
        {pathname === '/system' && <div>系统设置</div>}
        {pathname === '/account' && <div>账户设置</div>}
        {pathname === '/training/search' && <div>全部分类</div>}
        {pathname.includes('/reading/') && <div>今日阅读</div>}
        {pathname === '/privacy/personal' && <div>个人信息保护政策</div>}
        {pathname === '/privacy/children' && <div>儿童信息保护政策</div>}
        {pathname === '/privacy/third-party' && <div>第三方数据共享说明</div>}
        {pathname === '/legal/terms' && <div>佳麦服务使用条款</div>}
        {pathname === '/legal/permissions' && <div>应用权限说明</div>}
        {pathname === '/legal/icp' && <div>ICP备案信息</div>}
        <div
          style={{
            position: 'absolute',
            top: '11px',
            left: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <IconButtonAnimate
            sx={{ mr: 0, color: 'text.primary' }}
            onClick={() => {
              router.back();
            }}
          >
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButtonAnimate>
          {pathname === '/chat' && chat.conversations.unreadCount > 0 && (
            <CircleText>{chat.conversations.unreadCount}</CircleText>
          )}
        </div>
      </Toolbar>

      {isOffset && <Shadow />}
    </AppBar>
  );
}

// ----------------------------------------------------------------------

Shadow.propTypes = {
  sx: PropTypes.object,
};

function Shadow({ sx, ...other }) {
  return (
    <Box
      sx={{
        left: 0,
        right: 0,
        bottom: 0,
        height: 24,
        zIndex: -1,
        m: 'auto',
        borderRadius: '50%',
        position: 'absolute',
        width: `calc(100% - 48px)`,
        boxShadow: (theme) => theme.customShadows.z8,
        ...sx,
      }}
      {...other}
    />
  );
}
