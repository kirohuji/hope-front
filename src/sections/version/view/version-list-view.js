import { useCallback, useEffect, useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// components
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// redux
import { useDispatch, useSelector } from 'src/redux/store';
import { pagination } from 'src/redux/slices/version';
import Restricted from 'src/auth/guard/restricted';
import VersionList from '../version-list';
// ----------------------------------------------------------------------

export default function VersionListView() {
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const { data, total } = useSelector((state) => state.version);

  const [page, setPage] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(100);

  const settings = useSettingsContext();

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const onRefresh = useCallback(() => {
    try {
      dispatch(
        pagination(
          {},
          {
            skip: (page - 1) * rowsPerPage,
            limit: rowsPerPage,
          }
        )
      );
    } catch (error) {
      enqueueSnackbar(error.message);
    }
  }, [dispatch, enqueueSnackbar, page, rowsPerPage]);

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  const notFound = !data.length;
  const renderFilters = (
    <Stack direction="row" justifyContent="flex-end">
      <Typography sx={{ fontSize: '14px', fontWeight: 'bold' }}>根据版本分类</Typography>
    </Stack>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="列表"
        links={[
          {
            name: '版本管理',
            href: paths.dashboard.job.root,
          },
          { name: '列表' },
        ]}
        action={
          <Restricted to={['VersionListAdd']}>
            <Button
              component={RouterLink}
              href={paths.dashboard.version.newMajor}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              新建
            </Button>
          </Restricted>
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
      <Stack
        spacing={2.5}
        sx={{
          my: { xs: 3, md: 5 },
        }}
      >
        {renderFilters}
      </Stack>
      {notFound && <EmptyContent filled title="没有数据" sx={{ py: 10 }} />}
      <VersionList versions={data} onRefresh={() => onRefresh()} />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        <Pagination
          shape="rounded"
          count={Math.ceil(total / rowsPerPage)}
          variant="outlined"
          page={page}
          onChange={handlePageChange}
        />
      </Box>
    </Container>
  );
}
