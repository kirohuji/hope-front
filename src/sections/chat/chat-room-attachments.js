import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// utils
import { fDateTime } from 'src/utils/format-time';
// components
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import FileThumbnail from 'src/components/file-thumbnail';

// ----------------------------------------------------------------------

export default function ChatRoomAttachments({ attachments }) {
  const collapse = useBoolean(true);

  const totalAttachments = attachments.length;

  const renderBtn = (
    <ListItemButton
      disabled={!attachments.length}
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
        附件 ({totalAttachments}) (最多保存3天)
      </Box>
      <Iconify
        width={16}
        icon={
          (!collapse.value && 'eva:arrow-ios-forward-fill') ||
          (!attachments.length && 'eva:arrow-ios-forward-fill') ||
          'eva:arrow-ios-downward-fill'
        }
      />
    </ListItemButton>
  );
  const isExpired = (target) => {
    if (target.type!=='image') {
      const createAt = new Date(target.createAt);
      const now = new Date();
      const threeDaysAgo = new Date(now.setDate(now.getDate() - 3));
      return threeDaysAgo>createAt
    }
    return false;
  };
  const renderContent = (
    <Scrollbar sx={{ px: 2, py: 2.5, height: `100%` }}>
      {attachments.map((attachment, index) => (
        <Stack
          key={attachment.name + index}
          spacing={1.5}
          direction="row"
          alignItems="center"
          sx={{ mb: 2, position: 'relative' }}
        >
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: 1,
              overflow: 'hidden',
              position: 'relative',
              backgroundColor: 'background.neutral',
            }}
          >
            <FileThumbnail
              imageView
              file={attachment.preview}
              onDownload={() => {
                if(!isExpired(attachment)) {
                  window.open(attachment.preview, 'blank');
                }
              }}
              sx={{ width: 28, height: 28 }}
            />
          </Stack>

          <ListItemText
            primary={attachment.name}
            secondary={fDateTime(attachment.createdAt)}
            primaryTypographyProps={{
              noWrap: true,
              typography: 'body2',
            }}
            secondaryTypographyProps={{
              mt: 0.25,
              noWrap: true,
              component: 'span',
              typography: 'caption',
              color: 'text.disabled',
            }}
          />
          {isExpired(attachment) && (
            <Chip
              label="已过期"
              color="error"
              size="small"
              sx={{
                position: 'absolute',
                top: '8px',
                zIndex: 2,
                left: '0',
              }}
            />
          )}
          {/* {(
            <Box
              sx={{
                zIndex: 1,
                position: 'absolute',
                top: '0px',
                left: '0px',
                width: 'calc(100% + 0px)',
                height: 'calc(100% + 0px)',
                backgroundColor: 'rgba(0, 0, 0, 0.2)', // 半透明黑色遮罩
                zIndex: 1,
              }}
            />
          )} */}
        </Stack>
      ))}
    </Scrollbar>
  );

  console.log('执行')
  return (
    <>
      {renderBtn}

      <Box
        sx={{
          overflow: 'hidden',
          height: collapse.value ? 'calc(100vh - 450px)' : 0,
          transition: (theme) =>
            theme.transitions.create(['height'], {
              duration: theme.transitions.duration.shorter,
            }),
        }}
      >
        {renderContent}
      </Box>
    </>
  );
}

ChatRoomAttachments.propTypes = {
  attachments: PropTypes.array,
};
