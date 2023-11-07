import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Pagination, { paginationClasses } from '@mui/material/Pagination';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useSnackbar } from 'src/components/snackbar';
// redux
// import {
//   setActive
// } from 'src/redux/slices/book';
// import { useDispatch } from 'src/redux/store';
import { bookService } from 'src/composables/context-provider';
import { ConfirmDialog } from 'src/components/custom-dialog';
import BookItem from './book-item';
// ----------------------------------------------------------------------

export default function BookList ({ books, refresh }) {
  const router = useRouter();
  const confirm = useBoolean();
  const [current, setCurrent] = useState(null)
  const { enqueueSnackbar } = useSnackbar();
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


  const handleDelete = useCallback(async () => {
    await bookService.delete({
      _id: current._id
    })
    enqueueSnackbar("删除成功")
    refresh()
  }, [refresh, enqueueSnackbar, current]);

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
            onDelete={() => {
              setCurrent(book);
              confirm.onTrue()
            }}
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
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="删除"
        content={
          <>
            确定要删除吗?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDelete();
              confirm.onFalse();
            }}
          >
            删除
          </Button>
        }
      />
    </>
  );
}

BookList.propTypes = {
  books: PropTypes.array,
  refresh: PropTypes.func
};
