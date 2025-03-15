import { useState, useEffect, useCallback } from 'react';
// @mui
import Container from '@mui/material/Container';
import { Box, CircularProgress } from '@mui/material';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import BookArticlesDetailsToolbar from 'src/sections/book/book-articles-details-toolbar';
import { bookService } from 'src/composables/context-provider';
import { useSnackbar } from 'src/components/snackbar';
import ArticleNewEditForm from '../article-new-edit-form';

// ----------------------------------------------------------------------

export default function ArticleCreateView() {
  const { enqueueSnackbar } = useSnackbar();

  const settings = useSettingsContext();

  const params = useParams();

  const [book, setBook] = useState(null);

  const { id } = params;

  const [dates, setDates] = useState([]);

  const [loading, setLoading] = useState(true);
  
  const getData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookService.get({
        _id: id,
      });
      const getDates = await bookService.dates({
        _id: id,
      });
      setDates(getDates);
      setBook(response);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      enqueueSnackbar('获取数据失败,请联系管理员');
    }
  }, [enqueueSnackbar, id]);

  useEffect(() => {
    if (id) {
      getData(id);
    }
  }, [getData, id]);
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <BookArticlesDetailsToolbar backLink={paths.dashboard.book.details.tab(id, 'chapter')} />
      {!id ? (
        <CustomBreadcrumbs
          heading="新建文章"
          links={[
            {
              name: '',
            },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="新建"
          links={[
            {
              name: '',
              href: '',
            },
          ]}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
      )}
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
        <ArticleNewEditForm book={book} currentDates={dates} />
      )}
    </Container>
  );
}
