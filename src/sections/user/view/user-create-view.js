// @mui
import Container from '@mui/material/Container';
import PropTypes from 'prop-types';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import UserNewEditForm from '../user-new-edit-form';
import PersonaNewEditForm from '../persona-new-edit-form';

// ----------------------------------------------------------------------

export default function UserCreateView({ isPersona }) {
  const settings = useSettingsContext();

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading={isPersona ? '创建一个人设' : '创建一个用户'}
        links={[
          // {
          //   name: 'Dashboard',
          //   href: paths.dashboard.root,
          // },
          // {
          //   name: '用户',
          //   href: paths.dashboard.user.root,
          // },
          { name: '' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      {isPersona ? <PersonaNewEditForm /> : <UserNewEditForm />}
    </Container>
  );
}


UserCreateView.propTypes = {
  isPersona: PropTypes.bool,
};