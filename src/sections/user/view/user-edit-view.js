import { useState, useEffect, useCallback } from 'react';
// @mui
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// redux
// import { useSelector } from 'src/redux/store';
import { userService, roleService } from 'src/composables/context-provider';
import UserNewEditForm from '../user-new-edit-form';

// ----------------------------------------------------------------------

export default function UserEditView () {
  // const { active } = useSelector((state) => state.scope);
  const settings = useSettingsContext();
  const [user, setUser] = useState(null)
  const params = useParams();

  const { id } = params;

  const getData = useCallback(async () => {
    try {
      const userProfile = await userService.infoById({
        _id: id
      })
      setUser({
        ...userProfile.profile,
      })
    } catch (error) {
      console.log(error)
    }
  }, [id, setUser])

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
            name: 'User',
            href: paths.dashboard.user.root,
          },
          { name: user?.name },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      {
        user && <UserNewEditForm currentUser={user} />
      }
    </Container>
  );
}
