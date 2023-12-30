import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
//
import { fData } from 'src/utils/format-number';
import Iconify from '../iconify';

// ----------------------------------------------------------------------

function sizeValidator(file) {
  if (file.size > 3145728) {
    return {
      code: 'file-too-large',
      message: `文件不能超过 ${fData(3145728)} !`,
    };
  }

  return null;
}
export default function UploadBox({ placeholder, error, disabled, sx, ...other }) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    validator: sizeValidator,
    disabled,
    ...other,
  });

  const hasError = isDragReject || error;

  return (
    <Box
      {...getRootProps()}
      sx={{
        m: 0.5,
        width: 64,
        height: 64,
        flexShrink: 0,
        display: 'flex',
        borderRadius: 1,
        cursor: 'pointer',
        alignItems: 'center',
        color: 'text.disabled',
        justifyContent: 'center',
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
        border: (theme) => `dashed 1px ${alpha(theme.palette.grey[500], 0.16)}`,
        ...(isDragActive && {
          opacity: 0.72,
        }),
        ...(disabled && {
          opacity: 0.48,
          pointerEvents: 'none',
        }),
        ...(hasError && {
          color: 'error.main',
          bgcolor: 'error.lighter',
          borderColor: 'error.light',
        }),
        '&:hover': {
          opacity: 0.72,
        },
        ...sx,
      }}
    >
      <input {...getInputProps()} />

      {placeholder || <Iconify icon="eva:cloud-upload-fill" width={28} />}
    </Box>
  );
}

UploadBox.propTypes = {
  disabled: PropTypes.object,
  error: PropTypes.bool,
  placeholder: PropTypes.object,
  sx: PropTypes.object,
};
