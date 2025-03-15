import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';
// @mui
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// hooks
import { useDebounce } from 'src/hooks/use-debounce';
// redux
import { useDispatch, useSelector } from 'src/redux/store';
import { useResponsive } from 'src/hooks/use-responsive';
import { pagination } from 'src/redux/slices/broadcast';

// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// auth
import Restricted from 'src/auth/guard/restricted';
import BroadcastList from '../broadcast-list';
import BroadcastFiltersResult from '../broadcast-filters-result';

// ----------------------------------------------------------------------

const defaultFilters = {
  label: '',
  destination: [],
  tourGuides: [],
  services: [],
  startDate: null,
  endDate: null,
};

// ----------------------------------------------------------------------

export default function BroadcastListView() {
  const { enqueueSnackbar } = useSnackbar();

  const settings = useSettingsContext();

  const lgUp = useResponsive('up', 'lg');

  const { data, total } = useSelector((state) => state.broadcast);

  const [page, setPage] = useState(1);

  const [rowsPerPage] = useState(10);

  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const scope = useSelector((state) => state.scope);

  const [filters, setFilters] = useState(defaultFilters);

  const debouncedFilters = useDebounce(filters);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const onRefresh = useCallback(
    async (selector = {}, options = {}) => {
      setLoading(true);
      try {
        await dispatch(
          pagination(
            {
              ...selector,
              scope: scope.active?._id,
              label: {
                $regex: debouncedFilters.label,
                $options: 'i',
              },
            },
            {
              skip: (page - 1) * rowsPerPage,
              limit: rowsPerPage,
              ...options,
            }
          )
        );
        setLoading(false);
      } catch (error) {
        setLoading(false);
        enqueueSnackbar(error.message);
      }
    },
    [debouncedFilters.label, dispatch, enqueueSnackbar, page, rowsPerPage, scope.active]
  );

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = !data.length && canReset;

  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const renderFilters = (
    <Stack
      spacing={3}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-end', sm: 'center' }}
      direction={{ xs: 'column', sm: 'row' }}
    >
      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          fullWidth
          value={filters.label}
          onChange={(event) => {
            handleFilters('label', event.target.value);
          }}
          placeholder="请输入..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
    </Stack>
  );

  const renderResults = (
    <BroadcastFiltersResult
      filters={filters}
      onResetFilters={handleResetFilters}
      canReset={canReset}
      onFilters={handleFilters}
      results={total}
    />
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="活动列表"
        links={[{ name: '' }]}
        action={
          lgUp ? (
            <Restricted to={['BroadcastListAdd']}>
              <Button
                component={RouterLink}
                href={paths.dashboard.broadcast.new}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                新建一个活动通知
              </Button>
            </Restricted>
          ) : (
            <Box />
          )
        }
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Stack
        spacing={2.5}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {renderFilters}

        {canReset && renderResults}
      </Stack>

      {notFound && <EmptyContent title="没有数据" filled sx={{ py: 10 }} />}

      {loading ? (
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
        <BroadcastList broadcasts={data} refresh={() => onRefresh()} />
      )}

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
          defaultPage={page}
          variant="outlined"
          page={page}
          onChange={handlePageChange}
        />
      </Box>
    </Container>
  );
}
