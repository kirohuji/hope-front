import { useState, useEffect, useCallback } from 'react';
// @mui
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Backdrop from '@mui/material/Backdrop';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { bpmnService } from 'src/composables/context-provider';
import { useSnackbar } from 'src/components/snackbar';
import BpmnNewEditForm from '../bpmn-new-edit-form';

// ----------------------------------------------------------------------

export default function BpmnEditView() {
  const settings = useSettingsContext();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [bpmn, setBpmn] = useState({});
  const params = useParams();

  const { id } = params;

  const getData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await bpmnService.get({
        _id: id,
      });
      setBpmn(response);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      enqueueSnackbar('获取数据失败,请联系管理员');
    }
  }, [enqueueSnackbar, id]);

  useEffect(() => {
    if (id) {
      getData(id);
    }
  }, [getData, id]);

  // const currentBpmn = _bpmns.find((bpmn) => bpmn.id === id);

  return (
    <Container
      maxWidth={settings.themeStretch ? false : 'lg'}
      sx={{ height: 'calc(100% - 200px)' }}
    >
      {/* <CustomBreadcrumbs
        heading="编辑"
        links={[
          {},
          // {
          //   name: 'Bpmn',
          //   href: paths.dashboard.bpmn.root,
          // },
          // { name: currentBpmn?.bpmnNumber },
        ]}
        // sx={{
        //   mb: { xs: 3, md: 5 },
        // }}
      /> */}
      <Backdrop
        sx={{ background: 'white', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      {!loading && <BpmnNewEditForm currentBpmn={bpmn} backLink={paths.dashboard.bpmn.root} />}
    </Container>
  );
}
