import PropTypes from 'prop-types';
import { useCallback } from 'react';
// @mui
import Box from '@mui/material/Box';
import Pagination, { paginationClasses } from '@mui/material/Pagination';
// routes
import { paths } from 'src/routes/paths';
// components
import { useRouter } from 'src/routes/hook';
//
import BroadcastItem from './broadcast-item';

// ----------------------------------------------------------------------

export default function BroadcastList({ broadcasts }) {
  const router = useRouter();

  const handleView = useCallback(
    (_id) => {
      router.push(paths.dashboard.broadcast.details(_id));
    },
    [router]
  );

  const handleEdit = useCallback(
    (_id) => {
      router.push(paths.dashboard.broadcast.edit(_id));
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
        {broadcasts.map((broadcast, i) => (
          <BroadcastItem
            key={i}
            broadcast={broadcast}
            onView={() => handleView(broadcast._id)}
            onEdit={() => handleEdit(broadcast._id)}
            onDelete={() => handleDelete(broadcast._id)}
          />
        ))}
      </Box>

      {broadcasts.length > 8 && (
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

BroadcastList.propTypes = {
  broadcasts: PropTypes.array,
};
