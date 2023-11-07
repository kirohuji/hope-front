import PropTypes from 'prop-types';
import { useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Pagination, { paginationClasses } from '@mui/material/Pagination';
// components
import { useSnackbar } from 'src/components/snackbar';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import { scopeService } from 'src/composables/context-provider';
//
import ScopeItem from './scope-item';

// ----------------------------------------------------------------------

export default function ScopeList({ scopes ,onRefresh}) {
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
            onDelete={() => handleDelete(scope._id)}
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
    </>
  );
}

ScopeList.propTypes = {
  scopes: PropTypes.array,
  onRefresh: PropTypes.func
};
