import PropTypes from 'prop-types';
import { useEffect, useCallback, useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { useRouter, useParams } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// components
import Iconify from 'src/components/iconify';
import Markdown from 'src/components/markdown';
import EmptyContent from 'src/components/empty-content';
//
import { articleService } from 'src/composables/context-provider';
import { useSettingsContext } from 'src/components/settings';
import { useSnackbar } from 'src/components/snackbar';
import ArticleDetailsHero from '../article-details-hero';
import ArticleQuestionForm from '../article-question-form';
import { ArticleDetailsSkeleton } from '../article-skeleton';
// ----------------------------------------------------------------------

ArticleDetailsView.propTypes = {
  articleId: PropTypes.string,
  onClose: PropTypes.func,
};

export default function ArticleDetailsView({ onClose, articleId }) {
  const { themeStretch } = useSettingsContext();

  const router = useRouter();

  const params = useParams();

  const { id } = params;


  const [articleUser, setArticleUser] = useState({
    answers: [],
  });
  const [answers, setAnswers] = useState([]);

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
      setLoadingPost(false);
    } catch (error) {
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
      if(onClose){
        onClose();
      }
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
          返回
        </Button>
      }
      sx={{
        py: 20,
      }}
    />
  );

  const renderArticle = article && (
    <>
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
        <Markdown children={article.content} />
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
          <LoadingButton onClick={() => onSubmit()} variant="contained" loading={isSubmitting}>
            完成阅读
          </LoadingButton>
        </Stack>
      </Stack>
    </>
  );

  return (
    <Container maxWidth={themeStretch ? false : 'lg'} sx={{ overflow: 'auto', pb: '48px'}}>
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

      {article && renderArticle}
    </Container>
  );
}
