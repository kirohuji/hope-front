import { useState, useEffect, useCallback } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { Divider, Stack, Backdrop, CircularProgress, Box } from '@mui/material';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// _mock
import { JOB_PUBLISH_OPTIONS } from 'src/_mock';
import { useAuthContext } from 'src/auth/hooks';
// components
import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';
//
import { versionService } from 'src/composables/context-provider';
// redux
import { useDispatch, useSelector } from 'src/redux/store';
import { getData } from 'src/redux/slices/version';
// sections
import { useSnackbar } from 'src/components/snackbar';
import VersionDetailsToolbar from '../version-details-toolbar';
import VersionDetailsContent from '../version-details-content';

// ----------------------------------------------------------------------

export default function VersionDetailsView() {
  const { enqueueSnackbar } = useSnackbar();
  const settings = useSettingsContext();
  const params = useParams();
  const { user } = useAuthContext();
  const { details } = useSelector((state) => state.version);
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      await dispatch(
        getData({
          id,
          user,
        })
      );
      setLoading(false);
    } catch (error) {
      setLoading(false);
      enqueueSnackbar('获取数据失败,请联系管理员');
    }
  }, [dispatch, enqueueSnackbar, id, user]);


  useEffect(() => {
    if (id) {
      refresh(id);
    }
  }, [refresh, id]);

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <VersionDetailsToolbar
        backLink={paths.dashboard.version.root}
        editLink={paths.dashboard.version.edit(`${details.byId[id]?._id}`)}
        liveLink="#"
        publishOptions={JOB_PUBLISH_OPTIONS}
      />
      {!details.byId[id] ? (
        <Box
          sx={{
            zIndex: 10,
            backgroundColor: '#ffffffc4',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <VersionDetailsContent content={details.byId[id]} />

          <Divider sx={{ m: 2 }} />
        </>
      )}
    </Container>
  );
}
