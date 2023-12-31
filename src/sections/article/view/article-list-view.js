import PropTypes from 'prop-types';
// import orderBy from 'lodash/orderBy';
import { useCallback, useEffect, useState } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
// hooks
import { useDebounce } from 'src/hooks/use-debounce';
// components
import { useSnackbar } from 'src/components/snackbar';
// redux
import { useDispatch, useSelector } from 'src/redux/store';
import { pagination } from 'src/redux/slices/article';
// import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
//
import { articleService } from 'src/composables/context-provider';
import ArticleListHorizontal from '../article-list-horizontal';

// ----------------------------------------------------------------------

const defaultFilters = {
  published: 'all',
  title: '',
};

ArticleListView.propTypes = {
  book: PropTypes.object,
};

const TABS = [
  {
    value: 'all',
    label: '所有',
  },
  {
    value: 'hasPublished',
    label: '已经发布的',
  },
  {
    value: 'draft',
    label: '还在编写',
  },
];
// ----------------------------------------------------------------------

// eslint-disable-next-line react/prop-types
export default function ArticleListView({ book }) {
  const { enqueueSnackbar } = useSnackbar();

  const settings = useSettingsContext();

  const { data, total } = useSelector((state) => state.article);

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const [sortBy, setSortBy] = useState('latest');

  const [filters, setFilters] = useState(defaultFilters);

  const [page, setPage] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [searchQuery, setSearchQuery] = useState('');

  const debouncedFilters = useDebounce(filters);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const onRefresh = useCallback(
    async (selector = {}, options = {}) => {
      let published = 'all';
      if (debouncedFilters.published !== 'all') {
        published = debouncedFilters.published === 'hasPublished';
      } else {
        published = '';
      }
      try {
        setLoading(true);
        await dispatch(
          pagination(
            {
              ...selector,
              title: {
                $regex: debouncedFilters.title,
                $options: 'i',
              },
              published,
              book_id: book ? book._id : '',
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
    [
      book,
      debouncedFilters.published,
      debouncedFilters.title,
      dispatch,
      enqueueSnackbar,
      page,
      rowsPerPage,
    ]
  );

  useEffect(() => {
    onRefresh();
  }, [onRefresh]);

  const handleSortBy = useCallback((newValue) => {
    setSortBy(newValue);
  }, []);

  const handleFilters = useCallback((name, value) => {
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  }, []);

  const handleSearch = useCallback((inputValue) => {
    setSearchQuery(inputValue);
  }, []);

  const handleFilterPublish = useCallback(
    (event, newValue) => {
      handleFilters('published', newValue);
    },
    [handleFilters]
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {!book ? (
        <CustomBreadcrumbs
          heading="文章列表"
          links={[
            {
              name: 'Dashboard',
              href: paths.dashboard.root,
            },
            {
              name: 'Blog',
              href: paths.dashboard.article.root,
            },
            {
              name: 'List',
            },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.article.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              新建文章
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />
      ) : (
        <Stack
          spacing={3}
          justifyContent="flex-end"
          alignItems={{ xs: 'flex-end', sm: 'center' }}
          direction={{ xs: 'column', sm: 'row' }}
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        >
          <Button
            component={RouterLink}
            href={paths.dashboard.book.article.new(book._id)}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            新建文章
          </Button>
        </Stack>
      )}

      <Stack
        spacing={3}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-end', sm: 'center' }}
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.title}
            onChange={(event) => {
              handleFilters('title', event.target.value);
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
        {/**
          <ArticleSearch
            query={debouncedQuery}
            results={searchResults}
            onSearch={handleSearch}
            loading={searchLoading}
            // hrefItem={(title) => paths.dashboard.article.details(title)}
          />
           */}

        {/**  <ArticleSort sort={sortBy} onSort={handleSortBy} sortOptions={POST_SORT_OPTIONS} /> */}
      </Stack>

      <Tabs
        value={filters.published}
        onChange={handleFilterPublish}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      >
        {TABS.map((tab, index) => (
          <Tab
            key={index}
            iconPosition="end"
            value={tab.value}
            label={tab.label}
            // icon={
            //   <Label
            //     variant={((tab.value === 'all' || tab.value === filters.publish) && 'filled') || 'soft'}
            //     color={(tab.value === 'published' && 'info') || 'default'}
            //   >
            //     {tab.value === 'all' && articles.length}

            //     {tab.value === 'published' && articles.filter((article) => article.publish === 'published').length}

            //     {tab.value === 'draft' && articles.filter((article) => article.publish === 'draft').length}
            //   </Label>
            // }
            sx={{ textTransform: 'capitalize' }}
          />
        ))}
      </Tabs>

      <ArticleListHorizontal
        onRefresh={() => onRefresh()}
        book={book}
        articles={data}
        total={total}
        page={page}
        defaultPage={page}
        onChange={handlePageChange}
        loading={loading}
      />
    </Container>
  );
}

// ----------------------------------------------------------------------

// const applyFilter = ({ inputData, filters, sortBy }) => {
//   const { publish } = filters;

//   if (sortBy === 'latest') {
//     inputData = orderBy(inputData, ['createdAt'], ['desc']);
//   }

//   if (sortBy === 'oldest') {
//     inputData = orderBy(inputData, ['createdAt'], ['asc']);
//   }

//   if (sortBy === 'popular') {
//     inputData = orderBy(inputData, ['totalViews'], ['desc']);
//   }

//   if (publish !== 'all') {
//     inputData = inputData.filter((article) => article.publish === publish);
//   }

//   return inputData;
// };
