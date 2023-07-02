// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import BookNewEditForm from '../book-new-edit-form';

// ----------------------------------------------------------------------

export default function BookCreateView() {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Create a new book"
        links={[
          {
            name: 'Dashboard',
            href: paths.dashboard.root,
          },
          {
            name: 'Book',
            href: paths.dashboard.book.root,
          },
          { name: 'New book' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <BookNewEditForm />
    </Container>
  );
}
