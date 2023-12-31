import { useState, useEffect, useCallback } from 'react';
// @mui
import Container from '@mui/material/Container';
import { Box, CircularProgress } from '@mui/material';
// routes
import { paths } from 'src/routes/paths';
// utils
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import { useSnackbar } from 'src/components/snackbar';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { articleService, bookService } from 'src/composables/context-provider';
import BookArticlesDetailsToolbar from 'src/sections/book/book-articles-details-toolbar';
import ArticleNewEditForm from '../article-new-edit-form';
// ----------------------------------------------------------------------

export default function ArticleEditView() {
  const { enqueueSnackbar } = useSnackbar();
  const settings = useSettingsContext();
  const [article, setArticle] = useState(null);
  const params = useParams();
  const [book, setBook] = useState(null);
  const [dates, setDates] = useState([]);
  const { id, articleId } = params;
  const [loading, setLoading] = useState(true);

  const getData = useCallback(async () => {
    try {
      if (articleId) {
        setLoading(true);
        const articleRes = await articleService.get({
          _id: articleId,
        });
        setArticle(articleRes);
        const response = await bookService.get({
          _id: id,
        });
        setBook(response);
        const getDates = await bookService.dates({
          _id: id,
        });
        setDates(getDates);
        setLoading(false);
      } else {
        const articleRes = await articleService.get({
          _id: id,
        });
        setArticle(articleRes);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      enqueueSnackbar('获取数据失败,请联系管理员');
    }
  }, [articleId, id, enqueueSnackbar]);

  useEffect(() => {
    if (id) {
      getData();
    }
  }, [getData, id]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <BookArticlesDetailsToolbar backLink={paths.dashboard.book.details.tab(id, 'chapter')} />
      <CustomBreadcrumbs
        heading="编辑"
        links={[
          // {
          //   name: 'Dashboard',
          //   href: paths.dashboard.root,
          // },
          {
            name: '灵修本',
            href: paths.dashboard.article.root,
          },
          {
            name: article?.title,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {loading ? (
        <Box
          sx={{
            zIndex: 10,
            backgroundColor: '#ffffffc4',
            paddingTop: '92px',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <ArticleNewEditForm currentArticle={article} book={book} currentDates={dates} />
      )}
    </Container>
  );
}
