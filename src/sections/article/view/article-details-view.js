import PropTypes from 'prop-types';
import { useEffect, useCallback, useState } from 'react';
// @mui
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
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
import { useSnackbar } from 'src/components/snackbar';
import ArticleDetailsHero from '../article-details-hero';
import ArticleCommentList from '../article-comment-list';
import ArticleCommentForm from '../article-comment-form';
import ArticleQuestionForm from '../article-question-form';
import { ArticleDetailsSkeleton } from '../article-skeleton';
import ArticleDetailsToolbar from '../article-details-toolbar';
// ----------------------------------------------------------------------

ArticleDetailsView.propTypes = {
  articleId: PropTypes.string,
  onClose: PropTypes.func,
};

export default function ArticleDetailsView({ onClose, articleId }) {
  const { themeStretch } = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const [publish, setPublish] = useState('');

  const [articleUser, setArticleUser] = useState({
    answers: [],
  });
  const [answers, setAnswers] = useState([]);

  const [recentPosts, setRecentPosts] = useState([]);

  const [article, setArticle] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loadingPost, setLoadingPost] = useState(true);

  const [errorMsg, setErrorMsg] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  const getPost = useCallback(async (_id) => {
    try {
      const response = await articleService.get({
        _id,
      });

      const getArticleUser = await articleService.getArticleCurrentUser({
        _id,
      });
      setArticle(response);
      setArticleUser(getArticleUser);
      setAnswers(getArticleUser.answers);
      setPublish(response.public ? 'published' : 'draft');
      setLoadingPost(false);
    } catch (error) {
      console.error(error);
      setLoadingPost(false);
      setErrorMsg(error.message);
    }
  }, []);
  useEffect(() => {
    if (id) {
      getPost(id);
    } else if (articleId) {
      getPost(articleId);
    }
  }, [getPost, articleId, id]);

  const handleChangePublish = useCallback((newValue) => {
    setPublish(newValue);
  }, []);

  const renderSkeleton = <ArticleDetailsSkeleton />;

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      await articleService.updateArticleCurrentUser({
        _id: articleUser._id,
        article_id: article._id,
        answers,
      });
      const getArticleUser = await articleService.getArticleCurrentUser({
        _id: id || articleId,
      });
      setArticleUser(getArticleUser);
      setAnswers(getArticleUser.answers);
      enqueueSnackbar('保存成功!');
      setIsSubmitting(false);
      onClose();
    } catch (e) {
      setIsSubmitting(false);
      enqueueSnackbar('保存失败!');
    }
  };
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
      {false && (
        <ArticleDetailsToolbar
          backLink={paths.dashboard.article.root}
          editLink={paths.dashboard.article.edit(`${article?.title}`)}
          // liveLink={paths.dashboard.article.details(`${article?._id}`)}
          publish={publish}
          onChangePublish={handleChangePublish}
          publishOptions={POST_PUBLISH_OPTIONS}
        />
      )}

      <ArticleDetailsHero title={article.title} coverUrl={article.coverUrl} />

      <Stack
        sx={{
          maxWidth: 720,
          mx: 'auto',
          mt: { xs: 2, md: 4 },
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 1, whiteSpace: 'break-spaces' }}>
          {article.description}
        </Typography>
        <Divider sx={{ mt: 1, mb: 1 }} />
        <Stack direction="row" sx={{ mb: 1, mt: 1 }}>
          {/* <Typography variant="h4">阅读经文</Typography> */}
        </Stack>
        <Markdown children={article.content} />
        {false && (
          <Stack
            spacing={3}
            sx={{
              py: 3,
              borderTop: (theme) => `dashed 1px ${theme.palette.divider}`,
              borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
            }}
          >
            {false && (
              <Stack direction="row" flexWrap="wrap" spacing={1}>
                {article.tags.map((tag) => (
                  <Chip key={tag} label={tag} variant="soft" />
                ))}
              </Stack>
            )}

            <Stack direction="row" alignItems="center">
              {false && (
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
              )}

              {false && (
                <AvatarGroup
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
              )}
            </Stack>
          </Stack>
        )}
        {false && (
          <Stack direction="row" sx={{ mb: 3, mt: 5 }}>
            <Typography variant="h4">Comments</Typography>

            <Typography variant="subtitle2" sx={{ color: 'text.disabled' }}>
              ({article.comments.length})
            </Typography>
          </Stack>
        )}
        {/* <Stack direction="row" sx={{ mb: 1, mt: 1 }}>
          <Typography variant="h4">思考交互</Typography>
        </Stack> */}
        {false && <ArticleCommentForm />}

        {false && <ArticleCommentList comments={article.comments} />}
        <Stack sx={{ mb: 3 }}>
          {article.questions.map((q, i) => (
            <div key={i}>
              <Divider sx={{ mt: 1, mb: 1 }} />
              <ArticleQuestionForm
                item={q}
                comment={articleUser.answers && articleUser.answers[i]}
                onChangeComment={(e) => {
                  answers[i] = e.target.value;
                  setAnswers(answers);
                }}
              />
            </div>
          ))}
          <Divider sx={{ mt: 1, mb: 1 }} />
          <LoadingButton onClick={() => onSubmit()} variant="contained">
            完成阅读
          </LoadingButton>
        </Stack>
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
