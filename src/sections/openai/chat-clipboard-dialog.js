import PropTypes from 'prop-types';
import { useEffect, useState, useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import Dialog, { dialogClasses } from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
// utils
import { fData } from 'src/utils/format-number';
import { fDateTime } from 'src/utils/format-time';
import FileThumbnail, { fileFormat } from 'src/components/file-thumbnail';
import Iconify from 'src/components/iconify';
// hooks
import { useSnackbar } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
import _ from 'lodash';
//

export default function ChatClipboardDialog({ open, onClose, data, onUpload }) {
  const { label, size, url, type, lastModified } = data;
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);

  const properties = useBoolean(false);

  const theme = useTheme();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleImage = useCallback(() => {
    console.log('fileFormat(label)', url);
    if (type === 'folder') {
      return type;
    }
    if (fileFormat(label) === 'image') {
      return data;
    }
    return label;
  }, [data, label, type, url]);

  const renderProperties = (
    <Stack spacing={1.5}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ typography: 'subtitle2' }}
      >
        属性
        <IconButton size="small" onClick={properties.onToggle}>
          <Iconify
            icon={properties.value ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
          />
        </IconButton>
      </Stack>

      {properties.value && (
        <>
          <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
            <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
              大小
            </Box>
            {fData(size)}
          </Stack>

          <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
            <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
              修改时间
            </Box>
            {fDateTime(lastModified)}
          </Stack>

          <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
            <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
              类型
            </Box>
            {fileFormat(type)}
          </Stack>
        </>
      )}
    </Stack>
  );
  return (
    <Dialog
      fullWidth
      open={open}
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
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5 }}>
        <Typography variant="h6"> 信息 </Typography>
      </Stack>
      <Stack
        spacing={2.5}
        justifyContent="center"
        sx={{
          p: 2.5,
          bgcolor: 'background.neutral',
        }}
      >
        <FileThumbnail
          imageView
          file={handleImage()}
          // sx={{ width: 64, height: 64 }}
          imgSx={{ borderRadius: 1, width: '240px', height: '240px' }}
        />

        <Typography variant="subtitle1" sx={{ wordBreak: 'break-all' }}>
          {label}
        </Typography>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {renderProperties}
      </Stack>
      <Stack>
        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="soft"
          loading={loading}
          onClick={onUpload}
        >
          确定
        </LoadingButton>
      </Stack>
    </Dialog>
  );
}

ChatClipboardDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  data: PropTypes.object,
  onUpload: PropTypes.func,
};
