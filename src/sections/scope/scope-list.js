import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Pagination, { paginationClasses } from '@mui/material/Pagination';
// components
import { useSnackbar } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { scopeService } from 'src/composables/context-provider';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import ScopeItem from './scope-item';

// ----------------------------------------------------------------------

export default function ScopeList ({ scopes, onRefresh }) {
  const confirm = useBoolean();
  const [current, setCurrent] = useState(null)
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const handleView = useCallback(
    (_id) => {
      router.push(paths.dashboard.scope.details(_id));
    },
    [router]
  );

  const handleEdit = useCallback(
    (_id) => {
      router.push(paths.dashboard.scope.edit(_id));
    },
    [router]
  );

  const handleDelete = useCallback(async (_id) => {
    await scopeService.delete({
      _id
    })
    enqueueSnackbar('删除成功')
    onRefresh()
  }, [onRefresh, enqueueSnackbar]);

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
        {scopes.map((scope) => (
          <ScopeItem
            key={scope._id}
            scope={scope}
            onView={() => handleView(scope._id)}
            onEdit={() => handleEdit(scope._id)}
            onDelete={() => {
              setCurrent(scope);
              confirm.onTrue()
            }}
          />
        ))}
      </Box>

      {scopes.length > 8 && (
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

ScopeList.propTypes = {
  scopes: PropTypes.array,
  onRefresh: PropTypes.func
};
