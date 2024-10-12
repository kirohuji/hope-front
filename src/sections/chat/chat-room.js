import PropTypes from 'prop-types';
import uniq from 'lodash/uniq';
import flatten from 'lodash/flatten';
import { useState, useEffect, useCallback } from 'react';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { StaticDatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import {
  TextField,
} from '@mui/material';
// @mui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
// hooks
import { useResponsive } from 'src/hooks/use-responsive';
// components
import Iconify from 'src/components/iconify';
import { IconButtonAnimate } from 'src/components/animate';
//
import { messagingService } from 'src/composables/context-provider';
import { useBoolean } from 'src/hooks/use-boolean';
import { useCollapseNav } from './hooks';
import ChatRoomGroup from './chat-room-group';
import ChatRoomSingle from './chat-room-single';
import ChatRoomAttachments from './chat-room-attachments';
import ChatRoomSettings from './chat-room-settings';
import useCollapseHistory from './hooks/use-collapse-history';
import useCollapseSettings from './hooks/use-collapse-settings';
import ChatMessageList from './chat-message-list';
// ----------------------------------------------------------------------

const NAV_WIDTH = 240;

export default function ChatRoom({ participants, conversation, messages }) {
  const historyMessagesLoading = useBoolean(true);
  const [date, setDate] = useState(new Date());
  const [historyMessages, setHistoryMessages] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const theme = useTheme();

  const lgUp = useResponsive('up', 'lg');

  const {
    collapseDesktop,
    onCloseDesktop,
    onCollapseDesktop,
    //
    openMobile,
    onOpenMobile,
    onCloseMobile,
  } = useCollapseNav();

  const { openHistoryMobile, onOpenHistoryMobile, onCloseHistoryMobile } = useCollapseHistory();

  const { openSettingsMobile, onOpenSettingsMobile, onCloseSettingsMobile } = useCollapseSettings();

  const fetchAttachments = useCallback(async () => {
    const response = await messagingService.getConversationMessagesAttachmentsById({
      _id: conversation._id,
    });
    setAttachments(uniq(flatten(response)));
  }, [conversation._id]);

  useEffect(() => {
    if (!lgUp) {
      onCloseDesktop();
    }
    fetchAttachments();
  }, [onCloseDesktop, lgUp, fetchAttachments]);

  useEffect(() => {
    if (openMobile) {
      fetchAttachments();
    }
  }, [openMobile, fetchAttachments]);

  const getHistoryMessage = useCallback(
    async (currentDate) => {
      historyMessagesLoading.onTrue();
      const data = await messagingService.getConversationMessagesByIdWithDate({
        _id: conversation._id,
        date: currentDate,
        options: {
          sort: { createdAt: 1 },
        },
      });
      historyMessagesLoading.onFalse();
      setHistoryMessages(data);
    },
    [conversation._id, historyMessagesLoading]
  );

  const handleToggleNav = useCallback(() => {
    if (lgUp) {
      onCollapseDesktop();
    } else {
      onOpenMobile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lgUp]);

  const group = participants.length > 1;

  const renderContent = (
    <>
      {group && <ChatRoomSettings participants={participants} conversation={conversation}/> }
      {group ? (
        <ChatRoomGroup participants={participants} conversation={conversation} />
      ) : (
        <ChatRoomSingle participant={participants[0]} />
      )}

      <ChatRoomAttachments attachments={attachments} />
    </>
  );

  const handleToggleHistory = useCallback(() => {
    setDate(new Date());
    getHistoryMessage(new Date());
    onOpenHistoryMobile();
  }, [getHistoryMessage, onOpenHistoryMobile]);

  const handleToggleSettings = useCallback(() => {
    onOpenSettingsMobile();
  }, [onOpenSettingsMobile]);

  const renderHistoryContent = (
    <>
      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="zh-cn">
        <StaticDatePicker
          orientation="portrait"
          className="whiteBg"
          openTo="day"
          value={date}
          view="day"
          width="100%"
          displayStaticWrapperAs="desktop"
          onChange={(newValue) => {
            setDate(newValue);
            getHistoryMessage(newValue);
          }}
          showToolbar={false}
          renderInput={() => null}
        />
      </LocalizationProvider>
      <Divider sx={{ borderStyle: 'dashed' }} />
      <Stack
        sx={{
          width: 1,
          height: 1,
          mt: 1,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {historyMessagesLoading.value && (
          <Box
            sx={{
              position: 'absolute',
              zIndex: 10,
              backgroundColor: '#ffffffc4',
              width: '100%',
              height: '100%',
              top: '0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CircularProgress size={20} />
          </Box>
        )}
        <ChatMessageList
          conversationId={conversation._id}
          messages={historyMessages}
          sendingMessages={[]}
          participants={participants}
          onRefresh={() => {}}
        />
      </Stack>
    </>
  );

  const renderHistoryBtn = (
    <IconButton
      onClick={handleToggleHistory}
      sx={{
        top: 48,
        right: 0,
        zIndex: 9,
        width: 32,
        height: 32,
        borderRight: 0,
        position: 'absolute',
        borderRadius: `12px 0 0 12px`,
        boxShadow: theme.customShadows.z8,
        bgcolor: theme.palette.background.paper,
        border: `solid 1px ${theme.palette.divider}`,
        '&:hover': {
          bgcolor: theme.palette.background.neutral,
        },
        ...(lgUp && {
          ...(!collapseDesktop && {
            right: NAV_WIDTH,
          }),
        }),
      }}
    >
      {lgUp ? (
        <Iconify
          width={16}
          icon={
            collapseDesktop ? 'icon-park-outline:history-query' : 'icon-park-outline:history-query'
          }
        />
      ) : (
        <Iconify width={16} icon="icon-park-outline:history-query" />
      )}
    </IconButton>
  );

  const renderSettingBtn = (
    <IconButton
      onClick={handleToggleSettings}
      sx={{
        top: 84,
        right: 0,
        zIndex: 9,
        width: 32,
        height: 32,
        borderRight: 0,
        position: 'absolute',
        borderRadius: `12px 0 0 12px`,
        boxShadow: theme.customShadows.z8,
        bgcolor: theme.palette.background.paper,
        border: `solid 1px ${theme.palette.divider}`,
        '&:hover': {
          bgcolor: theme.palette.background.neutral,
        },
        ...(lgUp && {
          ...(!collapseDesktop && {
            right: NAV_WIDTH,
          }),
        }),
      }}
    >
      {lgUp ? (
        <Iconify
          width={16}
          icon={collapseDesktop ? 'solar:settings-outline' : 'solar:settings-outline'}
        />
      ) : (
        <Iconify width={16} icon="solar:settings-outline" />
      )}
    </IconButton>
  );

  const renderToggleBtn = (
    <IconButton
      onClick={handleToggleNav}
      sx={{
        top: 12,
        right: 0,
        zIndex: 9,
        width: 32,
        height: 32,
        borderRight: 0,
        position: 'absolute',
        borderRadius: `12px 0 0 12px`,
        boxShadow: theme.customShadows.z8,
        bgcolor: theme.palette.background.paper,
        border: `solid 1px ${theme.palette.divider}`,
        '&:hover': {
          bgcolor: theme.palette.background.neutral,
        },
        ...(lgUp && {
          ...(!collapseDesktop && {
            right: NAV_WIDTH,
          }),
        }),
      }}
    >
      {lgUp ? (
        <Iconify
          width={16}
          icon={collapseDesktop ? 'eva:arrow-ios-back-fill' : 'eva:arrow-ios-forward-fill'}
        />
      ) : (
        <Iconify width={16} icon="eva:arrow-ios-back-fill" />
      )}
    </IconButton>
  );
  const labelStyles = {
    mb: 1.5,
    pl: 1,
    color: 'text.disabled',
    fontWeight: 'fontWeightSemiBold',
  };


  const renderMode = (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Typography variant="caption" component="div" sx={{ ...labelStyles }}>
        Notifications Mode
      </Typography>

    </Stack>
  );

  return (
    <Box sx={{ position: 'relative' }}>
      {participants && participants.length > 0 && renderToggleBtn}
      {!lgUp && renderHistoryBtn}
      {/* {!lgUp && renderSettingBtn} */}

      {lgUp ? (
        <Stack
          sx={{
            height: 1,
            flexShrink: 0,
            width: NAV_WIDTH,
            borderLeft: `solid 1px ${theme.palette.divider}`,
            transition: theme.transitions.create(['width'], {
              duration: theme.transitions.duration.shorter,
            }),
            ...(collapseDesktop && {
              width: 0,
            }),
          }}
        >
          {!collapseDesktop && renderContent}
        </Stack>
      ) : (
        <Drawer
          anchor="right"
          open={openMobile}
          onClose={onCloseMobile}
          slotProps={{
            backdrop: { invisible: true },
          }}
          PaperProps={{
            sx: { width: NAV_WIDTH },
          }}
        >
          <div className="chat-room-group-drawer">{renderContent}</div>
        </Drawer>
      )}
      <Drawer
        anchor="right"
        open={openHistoryMobile}
        onClose={onCloseHistoryMobile}
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: '100%' },
        }}
      >
        <div className="history-content-drawer">
          <div style={{ mt: '14px', background: 'white' }}>
            <IconButtonAnimate sx={{ mr: 1, color: 'text.primary' }} onClick={onCloseHistoryMobile}>
              <Iconify icon="eva:arrow-ios-back-fill" />
            </IconButtonAnimate>
          </div>
          {renderHistoryContent}
        </div>
      </Drawer>
      <Drawer
        anchor="right"
        open={openSettingsMobile}
        onClose={onCloseSettingsMobile}
        slotProps={{
          backdrop: { invisible: true },
        }}
        PaperProps={{
          sx: { width: 320 },
        }}
      >
        <Box className="history-content-drawer">
          <Stack
            style={{ mt: '14px', background: 'white' }}
            justifyContent="space-between"
            flexDirection="row"
            alignItems="center"
            sx={{ pl: 2, pr: 1, py: 2 }}
          >
            {/* <Box sx={{ flex: 1}}>
              <IconButtonAnimate sx={{ color: 'text.primary' }} onClick={onCloseSettingsMobile}>
                <Iconify icon="eva:arrow-ios-back-fill" />
              </IconButtonAnimate>
            </Box> */}
            <Typography variant="subtitle2">设置中心</Typography>
          </Stack>
          <Divider sx={{ mb: 1 }}/>
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
          <Stack spacing={2} sx={{ px: 2 }}>
            <TextField
              size="small"
            />
          </Stack>
          {renderMode}
        </Box>
      </Drawer>
    </Box>
  );
}

ChatRoom.propTypes = {
  conversation: PropTypes.object,
  messages: PropTypes.array,
  participants: PropTypes.array,
};
