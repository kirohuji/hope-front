import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useSnackbar } from 'src/components/snackbar';
// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import { messagingService } from 'src/composables/context-provider';
import ChatRoomParticipantDialog from './chat-room-participant-dialog';
import ChatOrganizationDialog from './chat-organization-dialog';
// ----------------------------------------------------------------------

export default function ChatRoomGroup({ conversation, participants }) {
  const { enqueueSnackbar } = useSnackbar();

  const confirm = useBoolean();

  const dialog = useBoolean();

  const popover = usePopover();

  const [selected, setSelected] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);

  const collapse = useBoolean(true);

  const handleOpen = useCallback((participant) => {
    setSelected(participant);
  }, []);

  const handleCloseWithParticipantDialog = () => {
    setSelected(null);
  };

  const totalParticipants = participants.length;

  const renderBtn = (
    <ListItemButton
      onClick={collapse.onToggle}
      sx={{
        pl: 2.5,
        pr: 1.5,
        height: 40,
        flexShrink: 0,
        flexGrow: 'unset',
        typography: 'overline',
        color: 'text.secondary',
        bgcolor: 'background.neutral',
      }}
    >
      <Box component="span" sx={{ flexGrow: 1 }}>
        参与列表 ({totalParticipants})
        <IconButton
          size="small"
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            dialog.onTrue();
          }}
          sx={{
            ml: 1,
            width: 18,
            height: 18,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          <Iconify icon="mingcute:add-line" />
        </IconButton>
      </Box>
      <Iconify
        width={16}
        icon={collapse.value ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
      />
    </ListItemButton>
  );

  const renderContent = (
    <Scrollbar sx={{ height: 56 * 8 }}>
      {participants.map((participant) => (
        <ListItemButton key={participant._id} onClick={() => handleOpen(participant)}>
          <Badge
            variant={participant.status}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Avatar alt={participant.username} src={participant.photoURL} />
          </Badge>

          <ListItemText
            sx={{ ml: 2 }}
            primary={`${participant.displayName}(${participant.realName})`}
            secondary={participant.role}
            primaryTypographyProps={{
              noWrap: true,
              typography: 'subtitle2',
            }}
            secondaryTypographyProps={{
              noWrap: true,
              component: 'span',
              typography: 'caption',
            }}
          />
          <IconButton
            color={popover.open ? 'inherit' : 'default'}
            onClick={(e) => {
              setSelectedItem(participant);
              e.stopPropagation();
              popover.onOpen(e);
            }}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </ListItemButton>
      ))}
    </Scrollbar>
  );

  const handleDelete = useCallback(async () => {
    try {
      await messagingService.removeParticipant({
        _id: conversation._id,
        participant: selectedItem,
      });
      enqueueSnackbar('删除成功');
      confirm.onFalse();
    } catch (e) {
      enqueueSnackbar('删除失败');
    }
  }, [confirm, conversation._id, enqueueSnackbar, selectedItem]);

  return (
    <>
      {renderBtn}

      <div>
        <Collapse in={collapse.value}>{renderContent}</Collapse>
      </div>

      {selected && (
        <ChatRoomParticipantDialog
          participant={selected}
          open={!!selected}
          onClose={handleCloseWithParticipantDialog}
        />
      )}
      <ChatOrganizationDialog
        open={dialog.value}
        onClose={dialog.onFalse}
        conversation={conversation}
        participants={participants}
      />
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          删除
        </MenuItem>
      </CustomPopover>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="删除"
        content="确认要删除吗?"
        action={
          <Button variant="contained" color="error" onClick={handleDelete}>
            删除
          </Button>
        }
      />
    </>
  );
}

ChatRoomGroup.propTypes = {
  participants: PropTypes.array,
  conversation: PropTypes.object,
};
