import { useState, useEffect, useCallback } from 'react';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// utils
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { articleService, bookService } from 'src/composables/context-provider';
import ArticleNewEditForm from '../article-new-edit-form';
// ----------------------------------------------------------------------

export default function ArticleEditView () {
  const settings = useSettingsContext();
  const [article, setArticle] = useState(null)
  const params = useParams();
  const [book, setBook] = useState(null)
  const [dates, setDates] = useState([]);
  const { id, articleId } = params;
  // const { article: currentArticle } = useGetPost(`${title}`);

  const getData = useCallback(async () => {
    try {
      if (articleId) {
        const articleRes = await articleService.get({
          _id: articleId
        })
        setArticle(articleRes)
        const response = await bookService.get({
          _id: id
        })
        setBook(response)
        const getDates = await bookService.dates({
          _id: id
        })
        setDates(getDates)
      } else {
        const articleRes = await articleService.get({
          _id: id
        })
        setArticle(articleRes)
      }
    } catch (error) {
      console.log(error)
    }
  }, [id, setArticle,setDates,setBook, articleId])

  useEffect(() => {
    if (id) {
      getData()
    }
  }, [getData, id]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
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

      {article && <ArticleNewEditForm currentArticle={article} book={book} currentDates={dates} />}
    </Container>
  );
}
