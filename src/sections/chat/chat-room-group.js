import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Dialog, { dialogClasses } from '@mui/material/Dialog';
import InputBase from '@mui/material/InputBase';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import LoadingButton from '@mui/lab/LoadingButton';
import Collapse from '@mui/material/Collapse';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
// hooks
import { useSnackbar } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'src/redux/store';
// components
import Iconify from 'src/components/iconify';
import SearchNotFound from 'src/components/search-not-found';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import ChatNavItem from 'src/sections/chat/chat-nav-item';
import Scrollbar from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import ChatHeaderCompose from 'src/sections/chat/chat-header-compose';

import { getOrganizations } from 'src/redux/slices/chat';

import _ from 'lodash';
//
import { fileService, messagingService } from 'src/composables/context-provider';
import ChatRoomParticipantDialog from './chat-room-participant-dialog';

// ----------------------------------------------------------------------

export default function ChatRoomGroup({ conversation, participants }) {
  const { enqueueSnackbar } = useSnackbar();

  const { contacts } = useSelector((state) => state.chat);

  const [selectedContacts, setSelectedContacts] = useState(participants);

  const search = useBoolean();

  const [loading, setLoading] = useState(false);

  const theme = useTheme();

  const [searchQuery, setSearchQuery] = useState('');

  const [checkeds, setCheckeds] = useState(participants.map((item) => item._id));

  const [levels, setLevels] = useState([]);

  const handleClose = useCallback(() => {
    search.onFalse();
    setSearchQuery('');
    setCheckeds([]);
    setSelectedContacts([]);
    setCurrentOrganization([]);
    setLevels([]);
  }, [search]);

  const dispatch = useDispatch();

  const [recipients, setRecipients] = useState([]);

  const confirm = useBoolean();

  const [data, setData] = useState([]);

  const popover = usePopover();

  const [selected, setSelected] = useState(null);

  const collapse = useBoolean(true);

  const { active } = useSelector((state) => state.scope);

  const [currentOrganization, setCurrentOrganization] = useState([]);

  const handleSearch = useCallback((event) => {
    setSearchQuery(event.target.value);
  }, []);

  const [currentFirstOrganization, setCurrentFirstOrganization] = useState([]);

  const handleOpen = useCallback((participant) => {
    setSelected(participant);
  }, []);

  const onRefreshWithOrganization = useCallback(async () => {
    if (active?._id) {
      const organizationData = await dispatch(getOrganizations(active?._id));
      setCurrentFirstOrganization(organizationData);
      setCurrentOrganization(organizationData);
    }
  }, [active?._id, dispatch]);

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
            onRefreshWithOrganization();
            search.onTrue();
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

  const handleSelectContact = (id) => {
    if (checkeds.includes(id)) {
      setCheckeds((prevSelectedChecks) =>
        prevSelectedChecks.filter((checkedId) => checkedId !== id)
      );
      setSelectedContacts((prevSelectedConatcts) =>
        prevSelectedConatcts.filter((contact) => contact?._id !== id)
      );
    } else {
      const currentItem = contacts.byId[id];
      setSelectedContacts((prevSelectedConatcts) =>
        _.compact([...prevSelectedConatcts].concat(currentItem))
      );
      setCheckeds((prevSelectedChecks) => [...prevSelectedChecks].concat(id));
    }
    console.log('checkeds', checkeds);
    console.log('setSelectedContacts', selectedContacts);
  };

  const handleAddRecipients = useCallback((selectedRecipients) => {
    setRecipients(selectedRecipients);
  }, []);

  const onChildren = (organization) => {
    if (organization.children || organization.users) {
      const level = {
        name: organization.label,
        to: organization._id,
      };
      levels.push(level);
      setCurrentOrganization(
        _.compact([
          ...(organization.children || []),
          ...(organization.users || []).map((item) => ({
            name: item.username,
            photoURL: item.photoURL,
            _id: item._id,
            email: item.email,
            displayName: item.displayName,
            realName: item.realName,
          })),
        ])
      );
      setLevels(levels);
      console.log('currentOrganization', currentOrganization);
    }
  };
  const notFound = searchQuery && !data.length;

  const renderOrganizationsMenuItem = (organization, id) => (
    <ChatNavItem
      key={id}
      onSelect={handleSelectContact}
      checked={checkeds.includes(organization._id) > 0}
      onChildren={onChildren}
      conversation={organization}
      multi
      sx={{ height: 'unset' }}
    />
  );

  const styles = {
    typography: 'body2',
    alignItems: 'center',
    color: 'text.primary',
    display: 'inline-flex',
  };

  const onGoTo = async (level) => {
    let index = 0;
    const length = _.findIndex(levels, ['to', level.to]);
    let isChildren = false;
    let currentOrganizations = currentFirstOrganization;
    const levels2 = [];
    while (index < length) {
      isChildren = true;
      const currentLevel = levels[index];
      currentOrganizations = _.find(currentOrganizations, ['_id', currentLevel.to]);
      index += 1;
      levels2.push(currentLevel);
    }
    if (isChildren) {
      await setCurrentOrganization([
        ...currentOrganizations.children,
        ...currentOrganizations.users.map((item) => ({
          _id: item._id,
          name: item.username,
          photoURL: item.photoURL,
          email: item.email,
          displayName: item.displayName,
          realName: item.realName,
        })),
      ]);
    } else {
      await setCurrentOrganization(currentOrganizations);
    }
    setLevels(levels2);
  };

  const renderOrganizations = (
    <Scrollbar sx={{ height: '100%', ml: 1, mr: 1 }}>
      {levels && levels.length > 0 && (
        <Stack direction="row" alignItems="center" justifyContent="flex-start" sx={{ m: 1 }}>
          {levels.map((level, index) => (
            <Box key={index} sx={{ display: 'flex' }}>
              <Link onClick={() => onGoTo(level)} sx={styles}>
                {`${level.name}`}{' '}
              </Link>
              <div style={{ margin: '0 4px' }}> /</div>
            </Box>
          ))}
        </Stack>
      )}
      {currentOrganization.map((item, i) => renderOrganizationsMenuItem(item, i))}
    </Scrollbar>
  );

  const addConversation = useCallback(async () => {
    if (!selectedContacts.length) {
      enqueueSnackbar('未选择聊天对象');
      return;
    }
    setLoading(true);
    try {
      console.log('checkeds', checkeds);
      console.log(
        'participants',
        participants.map((item) => item._id)
      );
      console.log(
        '_.difference(checkeds,participants.map((item) => item._id))',
        _.difference(
          checkeds,
          participants.map((item) => item._id)
        )
      );
      await messagingService.addParticipants({
        _id: conversation._id,
        participants: _.difference(
          checkeds,
          participants.map((item) => item._id)
        ),
      });
      enqueueSnackbar('添加成功');
      search.onFalse();
      setLoading(false);
    } catch (e) {
      enqueueSnackbar('添加失败,请联系管理员!');
      setLoading(false);
    }
  }, [checkeds, conversation._id, enqueueSnackbar, participants, search, selectedContacts.length]);

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
      <Dialog
        fullWidth
        open={search.value}
        onClose={handleClose}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: 0,
        }}
        PaperProps={{
          sx: {
            mt: 5,
            p: 0,
            width: '100%',
            overflow: 'unset',
          },
        }}
        sx={{
          [`& .${dialogClasses.container}`]: {
            alignItems: 'flex-start',
          },
        }}
      >
        <Box sx={{ p: 3, borderBottom: `solid 1px ${theme.palette.divider}` }}>
          <ChatHeaderCompose
            selectedContacts={selectedContacts}
            onAddRecipients={handleAddRecipients}
            contacts={contacts.allIds.map((id) => contacts.byId[id])}
          />
          <InputBase
            fullWidth
            autoFocus
            placeholder="Search..."
            value={searchQuery}
            sx={{ mt: 1 }}
            onChange={handleSearch}
            startAdornment={
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" width={24} sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            }
            inputProps={{
              sx: { typography: 'h6' },
            }}
          />
        </Box>
        <Scrollbar sx={{ p: 0, pb: 2, height: 500 }}>
          {notFound ? <SearchNotFound query={searchQuery} sx={{ py: 10 }} /> : renderOrganizations}
        </Scrollbar>
        <Stack>
          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="soft"
            loading={loading}
            onClick={addConversation}
          >
            确定
          </LoadingButton>
        </Stack>
      </Dialog>
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
          <Button variant="contained" color="error">
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
