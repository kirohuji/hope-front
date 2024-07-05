import PropTypes from 'prop-types';
import { Stack, Box, Button, Container, Typography, Divider } from '@mui/material';
// components
import Markdown from 'src/components/markdown';
import Scrollbar from 'src/components/scrollbar';
// import EmptyContent from '../../../components/empty-content';
import BlogPostHero from 'src/sections/blog/post-details-hero';

// ----------------------------------------------------------------------

BookPostReading.propTypes = {
  post: PropTypes.object,
  onNextStep: PropTypes.func,
};

export default function BookPostReading ({ post, onNextStep }) {
  const { content = '', description = '' } = post;

  return <Scrollbar>
    <Stack
      sx={{
        borderRadius: 2,
        boxShadow: (theme) => ({
          md: theme.customShadows.card,
        }),
      }}
    >
      <BlogPostHero post={post} />
      <Container sx={{ mt: 5, mb: 10 }}>
        <Typography variant="h6" sx={{ mb: 5 }}>
          {description}
        </Typography>

        <Markdown children={content} />

        <Divider />
        <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            onClick={onNextStep}
          >
            下一步
          </Button>
        </Stack>
      </Container>
    </Stack>
  </Scrollbar>
}
