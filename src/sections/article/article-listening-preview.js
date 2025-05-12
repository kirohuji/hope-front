import PropTypes from 'prop-types';
// @mui
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Markdown from 'src/components/markdown';

// ----------------------------------------------------------------------

export function ArticleListeningPreview({ loading, text, ...other }) {
  if (loading) {
    return (
      <Paper sx={{ p: 3 }} {...other}>
        <Stack spacing={2}>
          <Skeleton height={20} width="80%" />
          <Skeleton height={20} width="90%" />
          <Skeleton height={20} width="70%" />
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }} {...other}>
      <Markdown children={text} />
    </Paper>
  );
}

ArticleListeningPreview.propTypes = {
  loading: PropTypes.bool,
  text: PropTypes.string,
};
