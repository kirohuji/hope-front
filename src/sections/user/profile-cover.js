import PropTypes from 'prop-types';
import { useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
// routes
import { useRouter } from 'src/routes/hook';
import { paths } from 'src/routes/paths';
import { useTheme, alpha } from '@mui/material/styles';
// theme
import { bgGradient } from 'src/theme/css';
// hooks
import { useRevenueCat } from 'src/composables/use-revenue-cat';
import { useAuthContext } from 'src/auth/hooks';
import { Capacitor } from '@capacitor/core';

// ----------------------------------------------------------------------

export default function ProfileCover({ name, username, photoURL, role, coverUrl }) {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthContext();

  const { getCurrentUserPlan, currentUserPlan } = useRevenueCat();

  const handleClickItem = () => {
    router.push(paths.user.account);
  };

  const getMembershipLabel = () => {
    if (Capacitor.getPlatform() === 'ios') {
      return currentUserPlan?.label;
    }
    return user?.membership?.membershipType?.label;
  };

  useEffect(() => {
    if (user._id && Capacitor.getPlatform() === 'ios') {
      getCurrentUserPlan({
        userId: user._id,
      });
    }
  }, [user._id, getCurrentUserPlan]);

  const membershipLabel = getMembershipLabel();

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.primary.darker, 0.8),
          imgUrl: coverUrl,
        }),
        height: 1,
        color: 'common.white',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          left: { md: 24 },
          bottom: { md: 24 },
          zIndex: { md: 10 },
          pt: { xs: 6, md: 0 },
          position: { md: 'absolute' },
        }}
      >
        <Stack alignItems="center" spacing={1}>
          <Avatar
            src={photoURL}
            alt={username}
            onClick={handleClickItem}
            sx={{
              bgcolor: 'background.default',
              mx: 'auto',
              cursor: 'pointer',
              width: { xs: 64, md: 128 },
              height: { xs: 64, md: 128 },
              border: `solid 2px ${theme.palette.common.white}`,
            }}
          />
          {membershipLabel && (
            <Typography
              variant="caption"
              sx={{
                color: 'common.white',
                bgcolor: theme.palette.primary.main,
                px: 0.5,
                py: 0.5,
                marginTop: -3,
                borderRadius: 1,
                zIndex: 1,
              }}
            >
              {membershipLabel}
            </Typography>
          )}
        </Stack>

        <ListItemText
          sx={{
            mt: 1,
            ml: { md: 3 },
            textAlign: { xs: 'center', md: 'unset' },
          }}
          primary={name}
          secondary={role}
          primaryTypographyProps={{
            typography: 'h4',
          }}
          secondaryTypographyProps={{
            mt: 0.5,
            color: 'inherit',
            component: 'span',
            typography: 'body2',
            sx: { opacity: 0.48 },
          }}
        />
      </Stack>
    </Box>
  );
}

ProfileCover.propTypes = {
  photoURL: PropTypes.string,
  username: PropTypes.string,
  coverUrl: PropTypes.string,
  name: PropTypes.string,
  role: PropTypes.string,
};
