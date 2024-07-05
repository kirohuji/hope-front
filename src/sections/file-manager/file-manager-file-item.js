import PropTypes from 'prop-types';
import { useState, useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
// utils
import { fDateTime } from 'src/utils/format-time';
import { useDispatch } from 'src/redux/store';
import { getList } from 'src/redux/slices/audio';
import { fData } from 'src/utils/format-number';

// components
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { useSnackbar } from 'src/components/snackbar';
import TextMaxLine from 'src/components/text-max-line';
import FileThumbnail from 'src/components/file-thumbnail';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import { fileManagerService } from 'src/composables/context-provider';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import FileManagerShareDialog from './file-manager-share-dialog';
import FileManagerFileDetails from './file-manager-file-details';

// ----------------------------------------------------------------------

export default function FileManagerFileItem({
  isMain,
  file,
  selected,
  onSelect,
  onDelete,
  onDeleteInvited,
  sx,
  user,
  ...other
}) {
  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();

  const { copy } = useCopyToClipboard();

  const [inviteEmail, setInviteEmail] = useState('');

  const checkbox = useBoolean();

  const share = useBoolean();

  const loading = useBoolean();

  const confirm = useBoolean();

  const details = useBoolean();

  const favorite = useBoolean(file.isFavorited);

  const popover = usePopover();

  const handleChangeInvite = useCallback((event) => {
    setInviteEmail(event.target.value);
  }, []);

  const handleInvite = useCallback(async () => {
    try {
      loading.onTrue();
      await fileManagerService.inviteEmailWithCurrent({
        inviteEmail,
        fileId: file._id,
      });
      enqueueSnackbar('发送成功!');
    } catch (e) {
      enqueueSnackbar('发送失败!');
    }
    loading.onFalse();
    share.onFalse();
  }, [share, loading, inviteEmail, file._id, enqueueSnackbar]);

  const handleInviteEmails = useCallback(
    async (inviteEmails) => {
      loading.onTrue();
      try {
        await fileManagerService.inviteEmailsWithCurrent({
          inviteEmails: inviteEmails.results,
          fileId: file._id,
        });
        enqueueSnackbar('发送成功!');
      } catch (e) {
        enqueueSnackbar(e.response.data.message);
      }
      loading.onFalse();
      share.onFalse();
    },
    [share, loading, file._id, enqueueSnackbar]
  );

  const handleCopy = useCallback(() => {
    enqueueSnackbar('拷贝成功!');
    copy(file.url);
  }, [copy, enqueueSnackbar, file.url]);

  const renderIcon =
    (checkbox.value || selected) && onSelect ? (
      <Checkbox
        size="medium"
        checked={selected}
        onClick={onSelect}
        icon={<Iconify icon="eva:radio-button-off-fill" />}
        checkedIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
        sx={{ p: 0.75 }}
      />
    ) : (
      <FileThumbnail file={file.type} sx={{ width: 36, height: 36 }} />
    );

  const renderAction = (
    <Stack direction="row" alignItems="center" sx={{ top: 8, right: 8, position: 'absolute' }}>
      {false && (
        <Checkbox
          color="warning"
          icon={<Iconify icon="eva:star-outline" />}
          checkedIcon={<Iconify icon="eva:star-fill" />}
          checked={favorite.value}
          onChange={favorite.onToggle}
        />
      )}
      <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>
    </Stack>
  );

  const renderText = (
    <>
      <TextMaxLine
        persistent
        variant="subtitle2"
        onClick={details.onTrue}
        sx={{ width: 1, mt: 2, mb: 0.5 }}
      >
        {file.label}
      </TextMaxLine>

      <Stack
        direction="row"
        alignItems="center"
        sx={{
          maxWidth: 0.99,
          whiteSpace: 'nowrap',
          typography: 'caption',
          color: 'text.disabled',
        }}
      >
        {fData(file.size)}

        <Box
          component="span"
          sx={{
            mx: 0.75,
            width: 2,
            height: 2,
            flexShrink: 0,
            borderRadius: '50%',
            bgcolor: 'currentColor',
          }}
        />
        <Typography noWrap component="span" variant="caption">
          {fDateTime(file.modifiedAt)}
        </Typography>
      </Stack>
    </>
  );

  const renderAvatar = (
    <AvatarGroup
      max={3}
      sx={{
        mt: 1,
        [`& .${avatarGroupClasses.avatar}`]: {
          width: 24,
          height: 24,
          '&:first-of-type': {
            fontSize: 12,
          },
        },
      }}
    >
      {file.shared?.map((person) => (
        <Avatar key={person._id} alt={person.username} src={person.photoURL} />
      ))}
    </AvatarGroup>
  );

  return (
    <>
      <Stack
        component={Paper}
        variant="outlined"
        alignItems="flex-start"
        sx={{
          p: 2.5,
          width: 300,
          borderRadius: 2,
          bgcolor: 'unset',
          cursor: 'pointer',
          position: 'relative',
          ...((checkbox.value || selected) && {
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.z20,
          }),
          ...sx,
        }}
        {...other}
      >
        {false && (
          <Box onMouseEnter={checkbox.onTrue} onMouseLeave={checkbox.onFalse}>
            {renderIcon}
          </Box>
        )}
        <Box onClick={details.onTrue}>{renderIcon}</Box>
        {renderText}

        {renderAvatar}

        {renderAction}
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            handleCopy();
          }}
        >
          <Iconify icon="eva:link-2-fill" />
          拷贝链接
        </MenuItem>

        <MenuItem
          onClick={() => {
            popover.onClose();
            window.open(file.url, 'blank');
          }}
        >
          <Iconify icon="eva:link-2-fill" />
          下载
        </MenuItem>
        {file && file.type === 'mp3' && (
          <MenuItem
            onClick={() => {
              dispatch(getList(file));
              popover.onClose();
            }}
          >
            <Iconify icon="eva:link-2-fill" />
            播放
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            popover.onClose();
            share.onTrue();
          }}
        >
          <Iconify icon="solar:share-bold" />
          分享
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {!isMain ? (
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
              onDeleteInvited({
                user_id: user._id,
                file_id: file._id,
              });
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            退出分享
          </MenuItem>
        ) : (
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
        )}
      </CustomPopover>

      <FileManagerFileDetails
        item={file}
        favorited={favorite.value}
        onFavorite={favorite.onToggle}
        onCopyLink={handleCopy}
        open={details.value}
        onDeleteInvited={(item) =>
          onDeleteInvited({
            user_id: item._id,
            file_id: file._id,
          })
        }
        onClose={details.onFalse}
        onDelete={() => {
          details.onFalse();
          onDelete();
        }}
      />

      <FileManagerShareDialog
        open={share.value}
        onInviteEmail={handleInvite}
        onInviteEmails={handleInviteEmails}
        shared={file.shared}
        inviteEmail={inviteEmail}
        onChangeInvite={handleChangeInvite}
        onCopyLink={handleCopy}
        onClose={() => {
          share.onFalse();
          setInviteEmail('');
        }}
      />

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="删除"
        content="确认要删除吗?"
        action={
          <Button variant="contained" color="error" onClick={onDelete}>
            删除
          </Button>
        }
      />
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading.value}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </>
  );
}

FileManagerFileItem.propTypes = {
  file: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onDelete: PropTypes.func,
  onDeleteInvited: PropTypes.func,
  onSelect: PropTypes.func,
  selected: PropTypes.bool,
  isMain: PropTypes.bool,
  user: PropTypes.object,
  sx: PropTypes.object,
};
