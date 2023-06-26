import PropTypes from 'prop-types';
import { useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Pagination, { paginationClasses } from '@mui/material/Pagination';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
//
import ScopeItem from './scope-item';

// ----------------------------------------------------------------------

export default function ScopeList({ scopes }) {
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

  const handleDelete = useCallback((_id) => {
    console.info('DELETE', _id);
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
  
};
