import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { TextField } from '@mui/material';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'src/redux/store';
import { messagingService } from 'src/composables/context-provider';
import { getConversation } from 'src/redux/slices/chat';
// ----------------------------------------------------------------------

export default function ChatRoomSettings({ conversation, participants }) {
  const collapse = useBoolean(true);

  const { enqueueSnackbar } = useSnackbar();

  const [conversationName, setConversationName] = useState(conversation.label);

  const dispatch = useDispatch();

  const handleChangeName = useCallback(async () => {
    await messagingService.updateConversationById({
      _id: conversation._id || conversation.id,
      label: conversationName,
    });
    enqueueSnackbar('更新成功');
    await dispatch(getConversation(conversation._id || conversation.id));
  }, [conversation._id, conversation.id, conversationName, enqueueSnackbar, dispatch]);

  const renderBtn = (
    <ListItem
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
        设置
        <IconButton
          size="small"
          color="primary"
          onClick={(e) => {
            handleChangeName();
            e.preventDefault();
            e.stopPropagation();
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
          <Iconify icon="dashicons:saved" />
        </IconButton>
      </Box>
      <Iconify
        width={16}
        icon={collapse.value ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
      />
    </ListItem>
  );

  const renderContent = (
    <>
      <Typography
        variant="caption"
        sx={{
          p: 2,
          m: 1,
          color: 'text.secondary',
          fontWeight: 'fontWeightMedium',
        }}
      >
        群聊名称
      </Typography>
      <Stack spacing={2} sx={{ p: 2, pt: 0 }}>
        <TextField
          size="small"
          value={conversationName}
          onChange={(event) => {
            setConversationName(event.target.value);
          }}
        />
      </Stack>
    </>
  );

  return (
    <>
      {renderBtn}

      <div>
        <Collapse in={collapse.value}>{renderContent}</Collapse>
      </div>
    </>
  );
}

ChatRoomSettings.propTypes = {
  participants: PropTypes.array,
  conversation: PropTypes.object,
};
