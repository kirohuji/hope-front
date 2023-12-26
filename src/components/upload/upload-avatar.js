import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
//
import { fData } from 'src/utils/format-number';
import Iconify from '../iconify';
import Image from '../image';
//
import RejectionFiles from './errors-rejection-files';

// ----------------------------------------------------------------------

function sizeValidator(file) {
  if (file.size > 3145728) {
    return {
      code: "file-too-large",
      message: `文件不能超过 ${fData(3145728)} !`
    };
  }

  return null
}

export default function UploadAvatar({ error, file, disabled, helperText, sx, ...other }) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    validator: sizeValidator,
    multiple: false,
    disabled,
    accept: {
      'image/*': [],
    },
    ...other,
  });

  const hasFile = !!file;

  const hasError = isDragReject || !!error;

  const imgUrl = typeof file === 'string' ? file : file?.preview;

  const renderPreview = hasFile && (
    <Image
      alt="avatar"
      src={imgUrl}
      sx={{
        width: 1,
        height: 1,
        borderRadius: '50%',
      }}
    />
  );

  const renderPlaceholder = (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1}
      className="upload-placeholder"
      sx={{
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        zIndex: 9,
        borderRadius: '50%',
        position: 'absolute',
        color: 'text.disabled',
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
        transition: (theme) =>
          theme.transitions.create(['opacity'], {
            duration: theme.transitions.duration.shorter,
          }),
        '&:hover': {
          opacity: 0.72,
        },
        ...(hasError && {
          color: 'error.main',
          bgcolor: 'error.lighter',
        }),
        ...(hasFile && {
          zIndex: 9,
          opacity: 0,
          color: 'common.white',
          bgcolor: (theme) => alpha(theme.palette.grey[900], 0.64),
        }),
      }}
    >
      <Iconify icon="solar:camera-add-bold" width={32} />

      <Typography variant="caption">{file ? 'Update photo' : 'Upload photo'}</Typography>
    </Stack>
  );

  const renderContent = (
    <Box
      sx={{
        width: 1,
        height: 1,
        overflow: 'hidden',
        borderRadius: '50%',
        position: 'relative',
      }}
    >
      {renderPreview}
      {renderPlaceholder}
    </Box>
  );

  return (
    <>
      <Box
        {...getRootProps()}
        sx={{
          p: 1,
          m: 'auto',
          width: 144,
          height: 144,
          cursor: 'pointer',
          overflow: 'hidden',
          borderRadius: '50%',
          border: (theme) => `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
          ...(isDragActive && {
            opacity: 0.72,
          }),
          ...(disabled && {
            opacity: 0.48,
            pointerEvents: 'none',
          }),
          ...(hasError && {
            borderColor: 'error.light',
          }),
          ...(hasFile && {
            ...(hasError && {
              bgcolor: 'error.lighter',
            }),
            '&:hover .upload-placeholder': {
              opacity: 1,
            },
          }),
          ...sx,
        }}
      >
        <input {...getInputProps()} />

        {renderContent}
      </Box>

      {helperText && helperText}

      <RejectionFiles fileRejections={fileRejections} />
    </>
  );
}

UploadAvatar.propTypes = {
  disabled: PropTypes.object,
  error: PropTypes.bool,
  file: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  helperText: PropTypes.object,
  sx: PropTypes.object,
};
