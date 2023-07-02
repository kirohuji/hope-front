import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Pagination, { paginationClasses } from '@mui/material/Pagination';
//
import { ArticleItemSkeleton } from './article-skeleton';
import ArticleItemHorizontal from './article-item-horizontal';

// ----------------------------------------------------------------------

export default function ArticleListHorizontal({ articles, loading }) {
  const renderSkeleton = (
    <>
      {[...Array(16)].map((_, index) => (
        <ArticleItemSkeleton key={index} variant="horizontal" />
      ))}
    </>
  );

  const renderList = (
    <>
      {articles.map((article) => (
        <ArticleItemHorizontal key={article._id} article={article} />
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

      {articles.length > 8 && (
        <Pagination
          count={8}
          sx={{
            mt: 8,
            [`& .${paginationClasses.ul}`]: {
              justifyContent: 'center',
            },
          }}
        />
      )}
    </>
  );
}

ArticleListHorizontal.propTypes = {
  loading: PropTypes.bool,
  articles: PropTypes.array,
};
