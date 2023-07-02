import { useState, useEffect, useCallback } from 'react';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// _mock
import { _jobs } from 'src/_mock';
// components
import { useParams } from 'src/routes/hook';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { bookService } from 'src/composables/context-provider';
import BookNewEditForm from '../book-new-edit-form';

// redux

// ----------------------------------------------------------------------

export default function BookEditView() {
  const settings = useSettingsContext();
  const [book, setBook] = useState(null)
  const params = useParams();

  const { id } = params;

  const getData = useCallback(async () => {
    try {
      const response = await bookService.get({
        _id: id
      })
      setBook(response)
    } catch (error) {
      console.log(error)
    }
  }, [id, setBook])

  useEffect(() => {
    if (id) {
      getData(id)
    }
  }, [getData, id]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Edit"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Book',
            href: paths.dashboard.book.root,
          },
          { name: book?.label },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <BookNewEditForm currentBook={book} />
    </Container>
  );
}
