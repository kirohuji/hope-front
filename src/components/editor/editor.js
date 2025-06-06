import PropTypes from 'prop-types';
import 'src/utils/highlight';
import ReactQuill from 'react-quill';
// @mui
import { alpha } from '@mui/material/styles';
//
import { StyledEditor } from './styles';
import Toolbar, { formats } from './toolbar';

// ----------------------------------------------------------------------

export default function Editor({
  id = 'minimal-quill',
  error,
  simple = false,
  isPost = false,
  helperText,
  sx,
  ...other
}) {
  const modules = {
    toolbar: {
      container: `#${id}`,
    },
    history: {
      delay: 500,
      maxStack: 100,
      userOnly: true,
    },
    syntax: true,
    clipboard: {
      matchVisual: false,
    },
  };

  return (
    <>
      <StyledEditor
        sx={{
          ...(error && {
            border: (theme) => `solid 1px ${theme.palette.error.main}`,
            '& .ql-editor': {
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
            },
          }),
          ...(isPost && { borderRadius: 0 }),
          ...sx,
        }}
      >
        <Toolbar id={id} isSimple={simple} isPost={isPost} />

        <ReactQuill modules={modules} formats={formats} placeholder="写点什么..." {...other} />
      </StyledEditor>

      {helperText && helperText}
    </>
  );
}

Editor.propTypes = {
  error: PropTypes.bool,
  helperText: PropTypes.object,
  id: PropTypes.string,
  simple: PropTypes.bool,
  isPost: PropTypes.bool,
  sx: PropTypes.object,
};
