import orderBy from 'lodash/orderBy';
import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// _mock
import {
  _jobs,
  _roles,
  JOB_SORT_OPTIONS,
  JOB_BENEFIT_OPTIONS,
  JOB_EXPERIENCE_OPTIONS,
  JOB_EMPLOYMENT_TYPE_OPTIONS,
} from 'src/_mock';
// assets
import { countries } from 'src/assets/data';
// components
import { useSnackbar } from 'src/components/snackbar';
import Iconify from 'src/components/iconify';
import EmptyContent from 'src/components/empty-content';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { bookService } from 'src/composables/context-provider';
import BookList from '../book-list';
import BookSort from '../book-sort';
import BookSearch from '../book-search';
import BookFilters from '../book-filters';
import BookFiltersResult from '../book-filters-result';


// ----------------------------------------------------------------------

const defaultFilters = {
  roles: [],
  locations: [],
  benefits: [],
  experience: 'all',
  employmentTypes: [],
};

// ----------------------------------------------------------------------

export default function BookListView () {
  const { enqueueSnackbar } = useSnackbar();

  const settings = useSettingsContext();

  const [tableData, setTableData] = useState([]);

  const openFilters = useBoolean();

  const [sortBy, setSortBy] = useState('latest');

  const [search, setSearch] = useState({
    query: '',
    results: [],
  });

  const [filters, setFilters] = useState(defaultFilters);

  const getTableData = useCallback(async (selector = {}, options = {}) => {
    try {
      const response = await bookService.pagination({
        ...selector,
        ...options
      })
      setTableData(response.data);
    } catch (error) {
      enqueueSnackbar(error.message);
    }
  }, [setTableData, enqueueSnackbar]);

  useEffect(() => {
    getTableData()
  }, [getTableData]);

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

  const handleSortBy = useCallback((newValue) => {
    setSortBy(newValue);
  }, []);

  const handleSearch = useCallback(
    (inputValue) => {
      setSearch((prevState) => ({
        ...prevState,
        query: inputValue,
      }));

      if (inputValue) {
        const results = _jobs.filter(
          (book) => book.title.toLowerCase().indexOf(search.query.toLowerCase()) !== -1
        );

        setSearch((prevState) => ({
          ...prevState,
          results,
        }));
      }
    },
    [search.query]
  );

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
      <BookSearch
        query={search.query}
        results={search.results}
        onSearch={handleSearch}
        hrefItem={(id) => paths.dashboard.book.details.root(id)}
      />

      <Stack direction="row" spacing={1} flexShrink={0}>
        <BookFilters
          open={openFilters.value}
          onOpen={openFilters.onTrue}
          onClose={openFilters.onFalse}
          //
          filters={filters}
          onFilters={handleFilters}
          //
          canReset={canReset}
          onResetFilters={handleResetFilters}
          //
          locationOptions={countries}
          roleOptions={_roles}
          benefitOptions={JOB_BENEFIT_OPTIONS.map((option) => option.label)}
          experienceOptions={['all', ...JOB_EXPERIENCE_OPTIONS.map((option) => option.label)]}
          employmentTypeOptions={JOB_EMPLOYMENT_TYPE_OPTIONS.map((option) => option.label)}
        />

        <BookSort sort={sortBy} onSort={handleSortBy} sortOptions={JOB_SORT_OPTIONS} />
      </Stack>
    </Stack>
  );

  const renderResults = (
    <BookFiltersResult
      filters={filters}
      onResetFilters={handleResetFilters}
      //
      canReset={canReset}
      onFilters={handleFilters}
      //
      results={dataFiltered.length}
    />
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="列表"
        links={[
          // { name: 'Dashboard', href: paths.dashboard.root },
          {
            name: '灵修本',
            href: paths.dashboard.book.root,
          },
          { name: '列表' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.book.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            新建
          </Button>
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
        {false && renderFilters}

        {canReset && renderResults}
      </Stack>

      {notFound && <EmptyContent filled title="No Data" sx={{ py: 10 }} />}

      <BookList books={tableData} refresh={() => getTableData()} />
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
    inputData = inputData.filter((book) =>
      book.employmentTypes.some((item) => employmentTypes.includes(item))
    );
  }

  if (experience !== 'all') {
    inputData = inputData.filter((book) => book.experience === experience);
  }

  if (roles.length) {
    inputData = inputData.filter((book) => roles.includes(book.role));
  }

  if (locations.length) {
    inputData = inputData.filter((book) => book.locations.some((item) => locations.includes(item)));
  }

  if (benefits.length) {
    inputData = inputData.filter((book) => book.benefits.some((item) => benefits.includes(item)));
  }

  return inputData;
};
