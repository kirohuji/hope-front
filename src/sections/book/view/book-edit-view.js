import { useState, useEffect, useCallback } from 'react';
// @mui
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
// routes
import { paths } from 'src/routes/paths';
// _mock
// import { _jobs } from 'src/_mock';
// components
import { useParams } from 'src/routes/hook';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { bookService } from 'src/composables/context-provider';
import { useSnackbar } from 'src/components/snackbar';
import BookNewEditForm from '../book-new-edit-form';

// redux

// ----------------------------------------------------------------------

export default function BookEditView() {
  const { enqueueSnackbar } = useSnackbar();
  const settings = useSettingsContext();
  const [book, setBook] = useState(null);
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const { id } = params;

  const getData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bookService.get({
        _id: id,
      });
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
      <CustomBreadcrumbs
        heading="编辑"
        links={[
          // {
          //   name: 'Dashboard',
          //   href: paths.dashboard.root,
          // },
          {
            name: '阅读本',
            href: paths.dashboard.book.root,
          },
          { name: book?.label },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Backdrop
        sx={{ background: 'white', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <BookNewEditForm currentBook={book} />
    </Container>
  );
}
