// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
// utils
import { useParams } from 'src/routes/hook';
// api
import { useGetPost } from 'src/api/blog';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import ArticleNewEditForm from '../article-new-edit-form';

// ----------------------------------------------------------------------

export default function ArticleEditView() {
  const settings = useSettingsContext();

  const params = useParams();

  const { title } = params;

  const { article: currentArticle } = useGetPost(`${title}`);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="编辑"
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
            name: currentArticle?.title,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <ArticleNewEditForm currentArticle={currentArticle} />
    </Container>
  );
}
