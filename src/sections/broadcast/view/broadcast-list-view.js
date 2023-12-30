import orderBy from 'lodash/orderBy';
import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// hooks
import { useDebounce } from 'src/hooks/use-debounce';
// utils
import { fTimestamp } from 'src/utils/format-time';
// _mock
import { _tours } from 'src/_mock';
// redux
import { useDispatch, useSelector } from 'src/redux/store';
import { pagination } from 'src/redux/slices/broadcast';

// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
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

  const { data, total } = useSelector((state) => state.broadcast);

  const [page, setPage] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const dispatch = useDispatch();

  const [sortBy, setSortBy] = useState('latest');

  const [search, setSearch] = useState({
    query: '',
    results: [],
  });

  const [filters, setFilters] = useState(defaultFilters);

  const debouncedFilters = useDebounce(filters);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const onRefresh = useCallback(
    async (selector = {}, options = {}) => {
      try {
        dispatch(
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
      } catch (error) {
        enqueueSnackbar(error.message);
      }
    },
    [debouncedFilters.label, dispatch, enqueueSnackbar, page, rowsPerPage]
  );

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  const dateError =
    filters.startDate && filters.endDate
      ? filters.startDate.getTime() > filters.endDate.getTime()
      : false;

  const dataFiltered = applyFilter({
    inputData: _tours,
    filters,
    sortBy,
    dateError,
  });
  const canReset = !isEqual(defaultFilters, filters);

  const notFound = !dataFiltered.length && canReset;

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
      //
      canReset={canReset}
      onFilters={handleFilters}
      //
      results={total}
    />
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="活动列表"
        links={[
          // { name: 'Dashboard', href: paths.dashboard.root },
          // {
          //   name: 'Broadcast',
          //   href: paths.dashboard.broadcast.root,
          // },
          { name: '' },
        ]}
        action={
          <Restricted to={['BookListAdd']}>
            <Button
              component={RouterLink}
              href={paths.dashboard.broadcast.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              新建一个新的活动通知
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

      {notFound && <EmptyContent title="No Data" filled sx={{ py: 10 }} />}

      <BroadcastList broadcasts={data} refresh={() => onRefresh()} />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        <Pagination
          shape="rounded"
          count={total}
          defaultPage={page}
          variant="outlined"
          page={page}
          onChange={handlePageChange}
        />
      </Box>
    </Container>
  );
}

// ----------------------------------------------------------------------

const applyFilter = ({ inputData, filters, sortBy, dateError }) => {
  const { services, destination, startDate, endDate, tourGuides } = filters;

  const tourGuideIds = tourGuides.map((tourGuide) => tourGuide.id);

  // SORT BY
  if (sortBy === 'latest') {
    inputData = orderBy(inputData, ['createdAt'], ['desc']);
  }

  if (sortBy === 'oldest') {
    inputData = orderBy(inputData, ['createdAt'], ['asc']);
  }

  if (sortBy === 'popular') {
    inputData = orderBy(inputData, ['totalViews'], ['desc']);
  }

  // FILTERS
  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(
        (broadcast) =>
          fTimestamp(broadcast.available.startDate) >= fTimestamp(startDate) &&
          fTimestamp(broadcast.available.endDate) <= fTimestamp(endDate)
      );
    }
  }

  if (destination.length) {
    inputData = inputData.filter((broadcast) => destination.includes(broadcast.destination));
  }

  if (tourGuideIds.length) {
    inputData = inputData.filter((broadcast) =>
      broadcast.tourGuides.some((filterItem) => tourGuideIds.includes(filterItem.id))
    );
  }

  if (services.length) {
    inputData = inputData.filter((broadcast) =>
      broadcast.services.some((item) => services.includes(item))
    );
  }

  return inputData;
};
