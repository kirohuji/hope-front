import { useCallback } from 'react';
// @mui
import MenuItem from '@mui/material/MenuItem';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Label from 'src/components/label';
import Typography from '@mui/material/Typography';

// routes
import { useRouter } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import Scrollbar from 'src/components/scrollbar';
import BaseOptions from 'src/components/settings/drawer/base-option';
import PresetsOptions from 'src/components/settings/drawer/presets-options';
import { useAuthContext } from 'src/auth/hooks';
import { useSnackbar } from 'src/components/snackbar';
import { systemNavData } from '../system-navigation';

export default function SystemGeneralView() {
  const { logout } = useAuthContext();

  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const settings = useSettingsContext();
  const labelStyles = {
    mb: 1.5,
    color: 'text.disabled',
    fontWeight: 'fontWeightSemiBold',
  };
  const renderMode = (
    <div>
      <Typography variant="caption" component="div" sx={{ ...labelStyles }}>
        主题
      </Typography>

      <BaseOptions
        value={settings.themeMode}
        onChange={(newValue) => settings.onUpdate('themeMode', newValue)}
        options={['light', 'dark']}
        icons={['sun', 'moon']}
      />
    </div>
  );
  const renderContrast = (
    <div>
      <Typography variant="caption" component="div" sx={{ ...labelStyles }}>
        对比度
      </Typography>

      <BaseOptions
        value={settings.themeContrast}
        onChange={(newValue) => settings.onUpdate('themeContrast', newValue)}
        options={['default', 'bold']}
        icons={['contrast', 'contrast_bold']}
      />
    </div>
  );
  const renderPresets = (
    <div>
      <Typography variant="caption" component="div" sx={{ ...labelStyles }}>
        预设
      </Typography>

      <PresetsOptions
        value={settings.themeColorPresets}
        onChange={(newValue) => settings.onUpdate('themeColorPresets', newValue)}
      />
    </div>
  );

  const handleClickItem = useCallback(
    (path) => {
      router.push(path);
    },
    [router]
  );

  const handleLogout = async () => {
    try {
      await logout();
      await router.replace('/auth/jwt/login');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to logout!', { variant: 'error' });
    }
  };

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Scrollbar sx={{ height: '100%' }}>
        <Card
          sx={{
            m: 1,
            mb: 2,
            p: 1,
          }}
        >
          <Stack spacing={2} sx={{ p: 1 }}>
            {renderMode}
          </Stack>
        </Card>
        <Card
          sx={{
            m: 1,
            mb: 2,
            p: 1,
          }}
        >
          <Stack spacing={2} sx={{ p: 1 }}>
            {renderContrast}
          </Stack>
        </Card>
        <Card
          sx={{
            m: 1,
            mb: 2,
            p: 1,
          }}
        >
          <Stack spacing={2} sx={{ p: 1 }}>
            {renderPresets}
          </Stack>
        </Card>
        <Card
          sx={{
            m: 1,
            mb: 2,
            p: 1,
          }}
        >
          <Stack spacing={2} sx={{ p: 1 }}>
            {systemNavData.map((option) => (
              <MenuItem
                key={option.label}
                onClick={() => handleClickItem(option.href)}
                sx={{
                  py: 1,
                  color: 'text.secondary',
                  '& svg': { width: 24, height: 24 },
                  '&:hover': { color: 'text.primary' },
                }}
              >
                {option.icon}

                <Box component="span" sx={{ ml: 2 }}>
                  {option.label}
                </Box>
                {option.info && (
                  <Label color="error" sx={{ ml: 1 }}>
                    {option.info}
                  </Label>
                )}
              </MenuItem>
            ))}
          </Stack>
        </Card>
        <Card
          sx={{
            m: 1,
            mb: 2,
          }}
        >
          <Stack spacing={2} sx={{ p: 1 }}>
            <MenuItem
              onClick={handleLogout}
              sx={{
                py: 1,
                color: 'text.secondary',
                display: 'flex',
                justifyContent: 'center',
                '& svg': { width: 24, height: 24 },
                '&:hover': { color: 'text.primary' },
              }}
            >
              退出登录
            </MenuItem>
          </Stack>
        </Card>
      </Scrollbar>
    </Container>
  );
}
