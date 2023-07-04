import PropTypes from 'prop-types';
import { useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Pagination, { paginationClasses } from '@mui/material/Pagination';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// redux
// import {
//   setActive
// } from 'src/redux/slices/book';
// import { useDispatch } from 'src/redux/store';
import BookItem from './book-item';

// ----------------------------------------------------------------------

export default function BookList ({ books }) {
  const router = useRouter();

  const handleView = useCallback(
    (id) => {
      router.push(paths.dashboard.book.details.root(id));
    },
    [router]
  );

  const handleEdit = useCallback(
    (id) => {
      router.push(paths.dashboard.book.edit(id));
    },
    [router]
  );


  const handleDelete = useCallback((id) => {
    console.info('DELETE', id);
  }, []);

  return (
    <>
      <Box
        gap={3}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        }}
      >
        {books.map((book) => (
          <BookItem
            key={book._id}
            book={book}
            onView={() => handleView(book._id)}
            onEdit={() => handleEdit(book._id)}
            onDelete={() => handleDelete(book._id)}
          />
        ))}
      </Box>

      {books.length > 8 && (
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

BookList.propTypes = {
  books: PropTypes.array,
};
