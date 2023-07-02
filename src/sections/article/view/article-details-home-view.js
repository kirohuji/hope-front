// @mui
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import AvatarGroup from '@mui/material/AvatarGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// utils
import { fShortenNumber } from 'src/utils/format-number';
// api
import { useGetPost, useGetLatestPosts } from 'src/api/blog';
// components
import Iconify from 'src/components/iconify';
import Markdown from 'src/components/markdown';
import EmptyContent from 'src/components/empty-content';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import ArticleList from '../article-list';
import ArticleCommentList from '../article-comment-list';
import ArticleCommentForm from '../article-comment-form';
import ArticleDetailsHero from '../article-details-hero';
import { ArticleDetailsSkeleton } from '../article-skeleton';

// ----------------------------------------------------------------------

export default function ArticleDetailsHomeView() {
  const params = useParams();

  const { title } = params;

  const { article, postError, postLoading } = useGetPost(`${title}`);

  const { latestArticles, latestArticlesLoading } = useGetLatestPosts(`${title}`);

  const renderSkeleton = <ArticleDetailsSkeleton />;

  const renderError = (
    <Container sx={{ my: 10 }}>
      <EmptyContent
        filled
        title={`${postError?.message}`}
        action={
          <Button
            component={RouterLink}
            href={paths.article.root}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
            sx={{ mt: 3 }}
          >
            Back to List
          </Button>
        }
        sx={{ py: 10 }}
      />
    </Container>
  );

  const renderArticle = article && (
    <>
      <ArticleDetailsHero
        title={article.title}
        author={article.author}
        coverUrl={article.coverUrl}
        createdAt={article.createdAt}
      />

      <Container
        maxWidth={false}
        sx={{
          py: 3,
          mb: 5,
          borderBottom: (theme) => `solid 1px ${theme.palette.divider}`,
        }}
      >
        <CustomBreadcrumbs
          links={[
            {
              name: 'Home',
              href: '/',
            },
            {
              name: 'Blog',
              href: paths.article.root,
            },
            {
              name: article?.title,
            },
          ]}
          sx={{ maxWidth: 720, mx: 'auto' }}
        />
      </Container>

      <Container maxWidth={false}>
        <Stack sx={{ maxWidth: 720, mx: 'auto' }}>
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
            <Stack direction="row" flexWrap="wrap" spacing={1}>
              {article.tags.map((tag) => (
                <Chip key={tag} label={tag} variant="soft" />
              ))}
            </Stack>

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

              <AvatarGroup>
                {article.favoritePerson.map((person) => (
                  <Avatar key={person.name} alt={person.name} src={person.avatarUrl} />
                ))}
              </AvatarGroup>
            </Stack>
          </Stack>

          <Stack direction="row" sx={{ mb: 3, mt: 5 }}>
            <Typography variant="h4">Comments</Typography>

            <Typography variant="subtitle2" sx={{ color: 'text.disabled' }}>
              ({article.comments.length})
            </Typography>
          </Stack>

          <ArticleCommentForm />

          <Divider sx={{ mt: 5, mb: 2 }} />

          <ArticleCommentList comments={article.comments} />
        </Stack>
      </Container>
    </>
  );

  const renderLatestArticles = (
    <>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Recent Articles
      </Typography>

      <ArticleList
        articles={latestArticles.slice(latestArticles.length - 4)}
        loading={latestArticlesLoading}
        disabledIndex
      />
    </>
  );

  return (
    <>
      {postLoading && renderSkeleton}

      {postError && renderError}

      {article && renderArticle}

      <Container sx={{ pb: 15 }}>{!!latestArticles.length && renderLatestArticles}</Container>
    </>
  );
}
