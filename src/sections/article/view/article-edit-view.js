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
import { articleService } from 'src/composables/context-provider';
import ArticleNewEditForm from '../article-new-edit-form';
// ----------------------------------------------------------------------

export default function ArticleEditView () {
  const settings = useSettingsContext();
  const [article, setArticle] = useState(null)
  const params = useParams();

  const { id } = params;
  console.log('id',id)
  // const { article: currentArticle } = useGetPost(`${title}`);

  const getData = useCallback(async () => {
    try {
      const response = await articleService.get({
        _id: id
      })
      setArticle(response)
    } catch (error) {
      console.log(error)
    }
  }, [id, setArticle])

  useEffect(() => {
    if (id) {
      getData(id)
    }
  }, [getData, id]);

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
            name: article?.title,
          },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {article && <ArticleNewEditForm currentArticle={article} />}
    </Container>
  );
}
