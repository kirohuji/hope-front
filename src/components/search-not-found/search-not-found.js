import PropTypes from 'prop-types';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

// ----------------------------------------------------------------------

export default function SearchNotFound({ query, sx, ...other }) {
  return query ? (
    <Paper
      sx={{
        bgcolor: 'unset',
        textAlign: 'center',
        ...sx,
      }}
      {...other}
    >
      <Typography variant="h6" gutterBottom>
        没有发现
      </Typography>

      <Typography variant="body2">
        没有搜索相关:&nbsp;
        <strong>&quot;{query}&quot;</strong>.
        <br /> 请尝试输入其他词汇
      </Typography>
    </Paper>
  ) : (
    <Typography variant="body2" sx={sx}>
      请输入
    </Typography>
  );
}

SearchNotFound.propTypes = {
  query: PropTypes.string,
  sx: PropTypes.object,
};
