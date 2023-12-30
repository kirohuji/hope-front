import orderBy from 'lodash/orderBy';
import isEqual from 'lodash/isEqual';
import { useCallback, useEffect, useState } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// _mock
import { _jobs } from 'src/_mock';
// components
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
// redux
import { useDispatch, useSelector } from 'src/redux/store';
import { pagination } from 'src/redux/slices/scope';
import Restricted from 'src/auth/guard/restricted';
import ScopeList from '../scope-list';
import ScopeFiltersResult from '../scope-filters-result';
// auth

// ----------------------------------------------------------------------

const defaultFilters = {
  roles: [],
  locations: [],
  benefits: [],
  experience: 'all',
  employmentTypes: [],
};

// ----------------------------------------------------------------------

export default function ScopeListView() {
  const dispatch = useDispatch();

  const { enqueueSnackbar } = useSnackbar();

  const { data, total } = useSelector((state) => state.scope);

  const [page, setPage] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const settings = useSettingsContext();

  const [sortBy, setSortBy] = useState('latest');

  const [filters, setFilters] = useState(defaultFilters);

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

  const dataFiltered = applyFilter({
    inputData: _jobs,
    filters,
    sortBy,
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

  const renderResults = (
    <ScopeFiltersResult
      filters={filters}
      onResetFilters={handleResetFilters}
      canReset={canReset}
      onFilters={handleFilters}
      results={dataFiltered.length}
    />
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="列表"
        links={[
          {
            name: '作用域',
            href: paths.dashboard.job.root,
          },
          { name: '列表' },
        ]}
        action={
          <Restricted to={['ScopeListAdd']}>
            <Button
              component={RouterLink}
              href={paths.dashboard.scope.new}
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
          mb: { xs: 3, md: 5 },
        }}
      >
        {canReset && renderResults}
      </Stack>

      {notFound && <EmptyContent filled title="没有数据" sx={{ py: 10 }} />}

      <ScopeList scopes={data} onRefresh={() => onRefresh()} />
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
          variant="outlined"
          page={page}
          onChange={handlePageChange}
        />
      </Box>
    </Container>
  );
}

// ----------------------------------------------------------------------

const applyFilter = ({ inputData, filters, sortBy }) => {
  const { employmentTypes, experience, roles, locations, benefits } = filters;

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
  if (employmentTypes.length) {
    inputData = inputData.filter((job) =>
      job.employmentTypes.some((item) => employmentTypes.includes(item))
    );
  }

  if (experience !== 'all') {
    inputData = inputData.filter((job) => job.experience === experience);
  }

  if (roles.length) {
    inputData = inputData.filter((job) => roles.includes(job.role));
  }

  if (locations.length) {
    inputData = inputData.filter((job) => job.locations.some((item) => locations.includes(item)));
  }

  if (benefits.length) {
    inputData = inputData.filter((job) => job.benefits.some((item) => benefits.includes(item)));
  }

  return inputData;
};
