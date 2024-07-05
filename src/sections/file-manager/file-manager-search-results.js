import PropTypes from 'prop-types';
// @mui
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItemButton from '@mui/material/ListItemButton';
//
import SearchNotFound from 'src/components/search-not-found';

// ----------------------------------------------------------------------

export default function FileManagerSearchResults({ query, results, onClickResult }) {
  const totalResults = results.length;

  const notFound = !totalResults && !!query;

  return (
    <>
      <Typography paragraph variant="h6">
        联系人 ({totalResults})
      </Typography>

      {notFound ? (
        <SearchNotFound
          query={query}
          sx={{
            p: 3,
            mx: 'auto',
            width: `calc(100% - 40px)`,
            bgcolor: 'background.neutral',
          }}
        />
      ) : (
        <>
          {results.map((result) => (
            <ListItemButton
              key={result._id}
              onClick={() => onClickResult(result)}
              sx={{
                px: 2.5,
                py: 1.5,
                typography: 'subtitle2',
              }}
            >
              <Avatar alt={result.username} src={result.photoURL} sx={{ mr: 2 }} />
              {`${result.displayName}(${result.realName})`}
            </ListItemButton>
          ))}
        </>
      )}
    </>
  );
}

FileManagerSearchResults.propTypes = {
  query: PropTypes.string,
  results: PropTypes.array,
  onClickResult: PropTypes.func,
};
