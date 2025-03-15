import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Pagination, { paginationClasses } from '@mui/material/Pagination';
//
import { ArticleItemSkeleton } from './article-skeleton';
import ArticleItemHorizontal from './article-item-horizontal';

// ----------------------------------------------------------------------

export default function ArticleListHorizontal({
  onRefresh,
  onChange,
  book,
  page,
  articles,
  loading,
  total,
  rowsPerPage,
}) {
  const renderSkeleton = (
    <>
      {[...Array(4)].map((_, index) => (
        <ArticleItemSkeleton key={index} variant="horizontal" />
      ))}
    </>
  );

  const renderList = (
    <>
      {articles &&
        articles.map((article) => (
          <ArticleItemHorizontal
            key={article._id}
            book={book}
            article={article}
            onRefresh={onRefresh}
          />
        ))}
    </>
  );

  return (
    <>
      <Box
        gap={3}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          md: 'repeat(2, 1fr)',
        }}
      >
        {loading ? renderSkeleton : renderList}
      </Box>

      <Pagination
        count={Math.ceil(total / rowsPerPage)}
        shape="rounded"
        defaultPage={page}
        page={page}
        variant="outlined"
        onChange={onChange}
        sx={{
          mt: 8,
          [`& .${paginationClasses.ul}`]: {
            justifyContent: 'center',
          },
        }}
      />
    </>
  );
}

ArticleListHorizontal.propTypes = {
  onRefresh: PropTypes.func,
  loading: PropTypes.bool,
  articles: PropTypes.array,
  total: PropTypes.any,
  book: PropTypes.object,
  onChange: PropTypes.func,
  page: PropTypes.any,
  rowsPerPage: PropTypes.any,
};
