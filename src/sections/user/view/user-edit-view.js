import { useState, useEffect, useCallback } from 'react';
// @mui
import Container from '@mui/material/Container';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
// routes
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// redux
import { userService } from 'src/composables/context-provider';
import UserNewEditForm from '../user-new-edit-form';

// ----------------------------------------------------------------------

export default function UserEditView() {
  const settings = useSettingsContext();

  const [user, setUser] = useState(null);

  const params = useParams();

  const { id } = params;

  const getData = useCallback(async () => {
    try {
      const userProfile = await userService.infoById({
        _id: id,
      });
      let { email } = userProfile.profile;
      if (!email) {
        email = userProfile.user.emails[0].address;
      }
      setUser({
        ...userProfile.profile,
        email,
      });
    } catch (error) {
      console.log(error);
    }
  }, [id, setUser]);

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
          // {
          //   name: '用户',
          //   href: paths.dashboard.user.root,
          // },
          { name: user?.username },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={!user}>
        <CircularProgress />
      </Backdrop>
      {!!user && <UserNewEditForm currentUser={user} />}
    </Container>
  );
}
