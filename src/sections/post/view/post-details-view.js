import PropTypes from 'prop-types';
import { useEffect, useCallback, useState } from 'react';
// @mui
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';
// routes
import { paths } from 'src/routes/paths';
import { useRouter, useParams } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// utils
import { fShortenNumber } from 'src/utils/format-number';
// components
import Iconify from 'src/components/iconify';
import Markdown from 'src/components/markdown';
import EmptyContent from 'src/components/empty-content';
import { useSnackbar } from 'src/components/snackbar';
//
import { postService } from 'src/composables/context-provider';
import CryptoJS from 'crypto-js';
import PostDetailsHero from '../post-details-hero';
import PostCommentList from '../post-comment-list';
import PostCommentForm from '../post-comment-form';
import { PostDetailsSkeleton } from '../post-skeleton';


const secretKey = 'future';
// ----------------------------------------------------------------------

PostDetailsView.propTypes = {
  postId: PropTypes.string,
};

export default function PostDetailsView({ postId }) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const params = useParams();

  const { id } = params;

  const [post, setPost] = useState(null);

  const [errorMsg, setErrorMsg] = useState(null);

  const [loadingPost, setLoadingPost] = useState(true);

  const getPost = useCallback(async (_id) => {
    try {
      const response = await postService.get({
        _id,
      });

      setPost(response);
      setLoadingPost(false);
    } catch (error) {
      setLoadingPost(false);
      setErrorMsg(error.message);
    }
  }, []);

  useEffect(() => {
    if (id) {
      getPost(id);
    } else if (postId) {
      getPost(postId);
    }
  }, [getPost, postId, id]);

  const renderSkeleton = <PostDetailsSkeleton />;

  const renderError = (
    <EmptyContent
      filled
      title={`${errorMsg}`}
      action={
        <Button
          component={RouterLink}
          href={paths.dashboard.post.root}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
          sx={{ mt: 3 }}
        >
          Back to List
        </Button>
      }
      sx={{
        py: 20,
      }}
    />
  );

  const renderPost = post && (
    <>
      {(post.coverUrl || post.cover) && <PostDetailsHero title={post.title} coverUrl={post.coverUrl || post.cover} />}

      <Stack
        sx={{
          maxWidth: 720,
          mx: 'auto',
          mt: { xs: 5, md: 10 },
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 5 }}>
          {post.description}
        </Typography>

        <Markdown
          children={CryptoJS.AES.decrypt(post.body, secretKey).toString(CryptoJS.enc.Utf8)}
        />

        <Stack
          spacing={3}
          sx={{
            py: 3,
            borderTop: (theme) => `dashed 1px ${theme.palette.divider}`,
            borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          {/* <Stack direction="row" flexWrap="wrap" spacing={1}>
            {post.tags.map((tag) => (
              <Chip key={tag} label={tag} variant="soft" />
            ))}
          </Stack> */}

          {/* <Stack direction="row" alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  defaultChecked
                  size="small"
                  color="error"
                  icon={<Iconify icon="solar:heart-bold" />}
                  checkedIcon={<Iconify icon="solar:heart-bold" />}
                />
              }
              label={fShortenNumber(post.totalFavorites)}
              sx={{ mr: 1 }}
            />

            <AvatarGroup
              sx={{
                [`& .${avatarGroupClasses.avatar}`]: {
                  width: 32,
                  height: 32,
                },
              }}
            >
              {post.favoritePerson.map((person) => (
                <Avatar key={person.name} alt={person.name} src={person.avatarUrl} />
              ))}
            </AvatarGroup>
          </Stack> */}
        </Stack>

        {/* <Stack direction="row" sx={{ mb: 3, mt: 5 }}>
          <Typography variant="h4">Comments</Typography>

          <Typography variant="subtitle2" sx={{ color: 'text.disabled' }}>
            ({post.comments.length})
          </Typography>
        </Stack>

        <PostCommentForm />

        <Divider sx={{ mt: 5, mb: 2 }} />

        <PostCommentList comments={post.comments} /> */}
      </Stack>
    </>
  );

  return (
    <Container maxWidth={false}>
      <Stack
        spacing={1.5}
        direction="row"
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        <Button
          onClick={() => {
            router.back();
          }}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
        >
          返回
        </Button>
      </Stack>
      {loadingPost && renderSkeleton}

      {errorMsg && renderError}

      {post && renderPost}
    </Container>
  );
}
