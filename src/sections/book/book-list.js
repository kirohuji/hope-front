import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
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

export default function BookList({ books, refresh }) {
  const router = useRouter();
  const confirm = useBoolean();
  const loading = useBoolean();
  const [current, setCurrent] = useState({});
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
    try {
      loading.onTrue();
      await bookService.delete({
        _id: current._id,
      });
      enqueueSnackbar('删除成功');
      confirm.onFalse();
      loading.onFalse();
      refresh();
    } catch (e) {
      loading.onFalse();
      enqueueSnackbar('删除失败');
    }
  }, [loading, current._id, enqueueSnackbar, confirm, refresh]);

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
              confirm.onTrue();
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
        content={<>确定要删除吗?</>}
        action={
          <LoadingButton
            variant="contained"
            color="error"
            loading={loading.value}
            onClick={() => {
              handleDelete();
            }}
          >
            删除
          </LoadingButton>
        }
      />
    </>
  );
}

BookList.propTypes = {
  books: PropTypes.array,
  refresh: PropTypes.func,
};
