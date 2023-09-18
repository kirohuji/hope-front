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
import { useParams } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// utils
import { fShortenNumber } from 'src/utils/format-number';
// _mock
import { POST_PUBLISH_OPTIONS } from 'src/_mock';
// api
import { useGetPost } from 'src/api/blog';
// components
import Iconify from 'src/components/iconify';
import Markdown from 'src/components/markdown';
import EmptyContent from 'src/components/empty-content';
//
import { articleService } from 'src/composables/context-provider';
import { useSettingsContext } from 'src/components/settings';
import ArticleDetailsHero from '../article-details-hero';
import ArticleCommentList from '../article-comment-list';
import ArticleCommentForm from '../article-comment-form';
import { ArticleDetailsSkeleton } from '../article-skeleton';
import ArticleDetailsToolbar from '../article-details-toolbar';
// ----------------------------------------------------------------------

export default function ArticleDetailsView () {
  const { themeStretch } = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const [publish, setPublish] = useState('');

  const [recentPosts, setRecentPosts] = useState([]);

  const [article, setArticle] = useState(null);

  const [loadingPost, setLoadingPost] = useState(true);

  const [errorMsg, setErrorMsg] = useState(null);


  const getPost = useCallback(async () => {
    try {
      const response = await articleService.get({
        _id: id
      })

      setArticle(response);
      setPublish(response.public ? 'published' : 'draft')
      setLoadingPost(false);
    } catch (error) {
      console.error(error);
      setLoadingPost(false);
      setErrorMsg(error.message);
    }
  }, [id]);
  useEffect(() => {
    if (id) {
      getPost();
    }
  }, [getPost, id]);

  const handleChangePublish = useCallback((newValue) => {
    setPublish(newValue);
  }, []);

  const renderSkeleton = <ArticleDetailsSkeleton />;

  const renderError = (
    <EmptyContent
      filled
      title={errorMsg}
      action={
        <Button
          component={RouterLink}
          href={paths.dashboard.article.root}
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

  const renderArticle = article && (
    <>
      {
        false && <ArticleDetailsToolbar
          backLink={paths.dashboard.article.root}
          editLink={paths.dashboard.article.edit(`${article?.title}`)}
          // liveLink={paths.dashboard.article.details(`${article?._id}`)}
          publish={publish}
          onChangePublish={handleChangePublish}
          publishOptions={POST_PUBLISH_OPTIONS}
        />
      }

      <ArticleDetailsHero title={article.title} coverUrl={article.coverUrl} />

      <Stack
        sx={{
          maxWidth: 720,
          mx: 'auto',
          mt: { xs: 5, md: 10 },
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 5 }}>
          {article.description}
        </Typography>

        <Markdown children={article.content} />

        <Stack
          spacing={3}
          sx={{
            py: 3,
            borderTop: (theme) => `dashed 1px ${theme.palette.divider}`,
            borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          {
            false && <Stack direction="row" flexWrap="wrap" spacing={1}>
              {article.tags.map((tag) => (
                <Chip key={tag} label={tag} variant="soft" />
              ))}
            </Stack>
          }

          <Stack direction="row" alignItems="center">
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
              label={fShortenNumber(article.totalFavorites)}
              sx={{ mr: 1 }}
            />

            {
              false && <AvatarGroup
                sx={{
                  [`& .${avatarGroupClasses.avatar}`]: {
                    width: 32,
                    height: 32,
                  },
                }}
              >
                {article.favoritePerson.map((person) => (
                  <Avatar key={person.name} alt={person.name} src={person.avatarUrl} />
                ))}
              </AvatarGroup>
            }
          </Stack>
        </Stack>
        {
          false &&
          <Stack direction="row" sx={{ mb: 3, mt: 5 }}>
            <Typography variant="h4">Comments</Typography>

            <Typography variant="subtitle2" sx={{ color: 'text.disabled' }}>
              ({article.comments.length})
            </Typography>
          </Stack>

        }
        <ArticleCommentForm />

        <Divider sx={{ mt: 5, mb: 2 }} />

        {
          false && <ArticleCommentList comments={article.comments} />
        }
      </Stack>
    </>
  );

  return (
    <Container maxWidth={themeStretch ? false : 'lg'}>
      {loadingPost && renderSkeleton}

      {errorMsg && renderError}

      {article && renderArticle}
    </Container>
  );
}
