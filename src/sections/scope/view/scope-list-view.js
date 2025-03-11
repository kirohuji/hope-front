import isEqual from 'lodash/isEqual';
import { useCallback, useEffect, useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Container from '@mui/material/Container';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// hooks
import { useDebounce } from 'src/hooks/use-debounce';
// components
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// redux
import { useDispatch, useSelector } from 'src/redux/store';
import { pagination } from 'src/redux/slices/scope';
// auth
import Restricted from 'src/auth/guard/restricted';
import ScopeList from '../scope-list';
import ScopeFiltersResult from '../scope-filters-result';

// ----------------------------------------------------------------------

const defaultFilters = {
  label: '',
};

// ----------------------------------------------------------------------

export default function ScopeListView() {
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const { data, total } = useSelector((state) => state.scope);

  const [page, setPage] = useState(1);

  const [rowsPerPage] = useState(10);

  const [loading, setLoading] = useState(true);

  const settings = useSettingsContext();

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
    [debouncedFilters.label, dispatch, enqueueSnackbar, page, rowsPerPage]
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
    <ScopeFiltersResult
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
        heading="作用域列表"
        links={[{ name: '' }]}
        action={
          <Restricted to={['ScopeListAdd']}>
            <Button
              component={RouterLink}
              href={paths.dashboard.scope.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              新建一个作用域
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
          mb: { xs: 3, md: 5 },
        }}
      >
        {renderFilters}
        {canReset && renderResults}
      </Stack>

      {notFound && <EmptyContent filled title="没有数据" sx={{ py: 10 }} />}

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
        <ScopeList scopes={data} onRefresh={() => onRefresh()} />
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
          variant="outlined"
          page={page}
          onChange={handlePageChange}
        />
      </Box>
    </Container>
  );
}
