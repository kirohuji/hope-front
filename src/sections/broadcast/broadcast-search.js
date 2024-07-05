import PropTypes from 'prop-types';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
// @mui
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';
// routes
import { useRouter } from 'src/routes/hook';
// components
import Iconify from 'src/components/iconify';
import SearchNotFound from 'src/components/search-not-found';

// ----------------------------------------------------------------------

export default function BroadcastSearch({ query, results, onSearch, hrefItem }) {
  const router = useRouter();

  const handleClick = (id) => {
    router.push(hrefItem(id));
  };

  const handleKeyUp = (event) => {
    if (query) {
      if (event.key === 'Enter') {
        const selectProduct = results.filter((broadcast) => broadcast.name === query)[0];

        handleClick(selectProduct.id);
      }
    }
  };

  return (
    <Autocomplete
      sx={{ width: { xs: 1, sm: 260 } }}
      autoHighlight
      popupIcon={null}
      options={results}
      onInputChange={(event, newValue) => onSearch(newValue)}
      getOptionLabel={(option) => option.name}
      noOptionsText={<SearchNotFound query={query} sx={{ bgcolor: 'unset' }} />}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      slotProps={{
        popper: {
          placement: 'bottom-start',
          sx: {
            minWidth: 320,
          },
        },
        paper: {
          sx: {
            [` .${autocompleteClasses.option}`]: {
              pl: 0.75,
            },
          },
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search..."
          onKeyUp={handleKeyUp}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ ml: 1, color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      )}
      renderOption={(props, broadcast, { inputValue }) => {
        const matches = match(broadcast.name, inputValue);
        const parts = parse(broadcast.name, matches);

        return (
          <Box component="li" {...props} onClick={() => handleClick(broadcast.id)} key={broadcast.id}>
            <Avatar
              key={broadcast.id}
              alt={broadcast.name}
              src={broadcast.images[0]}
              variant="rounded"
              sx={{ width: 48, height: 48, flexShrink: 0, mr: 1.5, borderRadius: 1 }}
            />

            <div key={inputValue}>
              {parts.map((part, index) => (
                <Typography
                  key={index}
                  component="span"
                  color={part.highlight ? 'primary' : 'textPrimary'}
                  sx={{
                    typography: 'body2',
                    fontWeight: part.highlight ? 'fontWeightSemiBold' : 'fontWeightMedium',
                  }}
                >
                  {part.text}
                </Typography>
              ))}
            </div>
          </Box>
        );
      }}
    />
  );
}

BroadcastSearch.propTypes = {
  hrefItem: PropTypes.func,
  onSearch: PropTypes.func,
  query: PropTypes.string,
  results: PropTypes.array,
};
