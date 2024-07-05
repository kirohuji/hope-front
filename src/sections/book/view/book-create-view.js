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
        heading="创建一本阅读本"
        links={[
          {
            name: '阅读本',
            href: paths.dashboard.book.root,
          },
          { name: '新的阅读本' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <BookNewEditForm />
    </Container>
  );
}
