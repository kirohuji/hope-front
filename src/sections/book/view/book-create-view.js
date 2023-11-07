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
        heading="创建一本灵修本"
        links={[
          {
            name: '灵修本',
            href: paths.dashboard.book.root,
          },
          { name: '新的灵修本' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <BookNewEditForm />
    </Container>
  );
}
