import PropTypes from 'prop-types';
import { useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import { ConfirmDialog } from 'src/components/custom-dialog';
import ListItemButton from '@mui/material/ListItemButton';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useAuthContext } from 'src/auth/hooks';
import { useResponsive } from 'src/hooks/use-responsive';
//
import { messagingService } from 'src/composables/context-provider';
import { useGetNavItem } from './hooks';

// ----------------------------------------------------------------------

export default function ChatNavItem({
  deleteConversation,
  selected,
  collapse,
  conversation,
  onCloseMobile,
}) {
  const confirm = useBoolean();
  const popover = usePopover();

  const { user } = useAuthContext();

  const mdUp = useResponsive('up', 'md');

  const router = useRouter();

  const { displayName, type } = useGetNavItem({
    conversation,
    currentUserId: user?._id,
  });

  const handleClickConversation = useCallback(async () => {
    try {
      if (user?._id !== conversation._id) {
        if (!mdUp) {
          // eslint-disable-next-line no-unused-expressions
          onCloseMobile && onCloseMobile();
        }
        if (type === 'contact') {
          console.log('conversation', conversation);
          const newConversation = await messagingService.room({
            sessionId: conversation.sessionId,
            isSession: true,
          });
          router.push(`${paths.dashboard.openai}?id=${newConversation._id}`);
        } else {
          router.push(`${paths.dashboard.openai}?id=${conversation._id}`);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, [type, conversation, user?._id, mdUp, onCloseMobile, router]);

  const renderlistItemButton = (
    <ListItem
      disableGutters
      secondaryAction={
        <IconButton
          color={popover.open ? 'inherit' : 'default'}
          onClick={(e) => {
            e.preventDefault();
            popover.onOpen(e);
          }}
        >
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      }
      sx={{
        width: '100%',
        height: '50px',
        p: 0,
        boxSizing: 'border-box',
        backgroundColor: '#fff',
        cursor: 'pointer',
        ...(selected && {
          bgcolor: 'action.selected',
        }),
        '&:hover': {
          backgroundColor: '#f0f0f0', // Light gray background on hover
        },
      }}
    >
      {!collapse && (
        <Stack
          onClick={handleClickConversation}
          direction="row"
          alignItems="center"
          sx={{ width: '100%', overflow: 'hidden', pr: '40px', pt: '8px',pb: '8px' }}
        >
          <ListItemText
            sx={{ ml: 2 }}
            primary={`${displayName}`}
            primaryTypographyProps={{
              noWrap: true,
              variant: 'subtitle2',
            }}
            secondaryTypographyProps={{
              noWrap: true,
              component: 'span',
              variant: conversation.unreadCount ? 'subtitle2' : 'body2',
              color: conversation.unreadCount ? 'text.primary' : 'text.secondary',
            }}
          />
        </Stack>
      )}
    </ListItem>
  );
  return (
    <>
      {renderlistItemButton}
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            confirm.onTrue();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          删除
        </MenuItem>
        <MenuItem
          onClick={() => {
            popover.onClose();
            confirm.onTrue();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          修改名称
        </MenuItem>
      </CustomPopover>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="删除"
        content="确认要删除吗?"
        action={
          <Button variant="contained" color="error" onClick={()=>{
            deleteConversation(()=> {
              confirm.onFalse();
            })
          }}>
            删除
          </Button>
        }
      />
    </>
  );
}

ChatNavItem.propTypes = {
  collapse: PropTypes.bool,
  conversation: PropTypes.object,
  onCloseMobile: PropTypes.func,
  selected: PropTypes.bool,
  deleteConversation: PropTypes.func,
};
