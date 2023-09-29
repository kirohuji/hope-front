import { useState, useEffect, useCallback } from 'react';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import BookArticlesDetailsToolbar from 'src/sections/book/book-articles-details-toolbar';
import { bookService } from 'src/composables/context-provider';
import ArticleNewEditForm from '../article-new-edit-form';


// ----------------------------------------------------------------------

export default function ArticleCreateView () {
  const settings = useSettingsContext();
  const params = useParams();
  const [book, setBook] = useState(null)
  const { id } = params;
  const [dates, setDates] = useState([]);
  const getData = useCallback(async () => {
    try {
      const response = await bookService.get({
        _id: id
      })
      const getDates = await bookService.dates({
        _id: id
      })
      setDates(getDates)
      setBook(response)
    } catch (error) {
      console.log(error)
    }
  }, [id, setBook, setDates])

  useEffect(() => {
    if (id) {
      getData(id)
    }
  }, [getData, id]);
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <BookArticlesDetailsToolbar backLink={paths.dashboard.book.details.root(id)} />
      {!id ? <CustomBreadcrumbs
        heading="新建"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Blog',
            href: paths.dashboard.article.root,
          },
          {
            name: 'Create',
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      /> : <CustomBreadcrumbs
        heading="新建"
        links={[
          {
            name: '',
            href: ''
          }
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      }
      {book && <ArticleNewEditForm book={book} currentDates={dates}/>}
    </Container>
  );
}
