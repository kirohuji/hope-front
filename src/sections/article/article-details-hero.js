import PropTypes from 'prop-types';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
// utils
import { fDate } from 'src/utils/format-time';
// theme
import { bgGradient } from 'src/theme/css';

// ----------------------------------------------------------------------

export default function ArticleDetailsHero({ title, author, coverUrl, createdAt }) {
  const theme = useTheme();

  const titleShow = title.replace(/\|\|\|/g, '\n');
  return (
    <Box
      sx={{
        // height: 480,
        height: 200,
        overflow: 'hidden',
        ...bgGradient({
          imgUrl: coverUrl,
          startColor: `${alpha(theme.palette.grey[900], 0.64)} 0%`,
          endColor: `${alpha(theme.palette.grey[900], 0.64)} 100%`,
        }),
      }}
    >
      <Container sx={{ height: 1, position: 'relative' }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{
            zIndex: 9,
            color: 'common.white',
            position: 'absolute',
            maxWidth: 480,
            whiteSpace: 'break-spaces',
            pt: { xs: 2, md: 8 },
            bottom: 0,
            pb: { xs: 2, md: 8 },
          }}
        >
          {titleShow}
        </Typography>

        <Stack
          sx={{
            left: 0,
            width: 1,
            bottom: 0,
            position: 'absolute',
          }}
        >
          {author && createdAt && (
            <Stack
              direction="row"
              alignItems="center"
              sx={{
                px: { xs: 2, md: 3 },
                pb: { xs: 3, md: 8 },
              }}
            >
              <Avatar
                alt={author.name}
                src={author.avatarUrl}
                sx={{ width: 64, height: 64, mr: 2 }}
              />

              <ListItemText
                sx={{ color: 'common.white' }}
                primary={author.name}
                secondary={fDate(createdAt)}
                primaryTypographyProps={{ typography: 'subtitle1', mb: 0.5 }}
                secondaryTypographyProps={{ color: 'inherit', sx: { opacity: 0.64 } }}
              />
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
}

ArticleDetailsHero.propTypes = {
  author: PropTypes.object,
  coverUrl: PropTypes.string,
  createdAt: PropTypes.string,
  title: PropTypes.string,
};
