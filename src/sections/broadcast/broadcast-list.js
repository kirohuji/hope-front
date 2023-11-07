import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Pagination, { paginationClasses } from '@mui/material/Pagination';
// routes
import { paths } from 'src/routes/paths';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useSnackbar } from 'src/components/snackbar';
// components
import { useRouter } from 'src/routes/hook';
//
import { broadcastService } from 'src/composables/context-provider';
import { ConfirmDialog } from 'src/components/custom-dialog';
import BroadcastItem from './broadcast-item';
// ----------------------------------------------------------------------

export default function BroadcastList ({ broadcasts, refresh }) {
  const router = useRouter();
  const confirm = useBoolean();
  const [current, setCurrent] = useState(null)
  const { enqueueSnackbar } = useSnackbar();
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

  const handleDelete = useCallback(async () => {
    await broadcastService.delete({
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
        {broadcasts.map((broadcast, i) => (
          <BroadcastItem
            key={i}
            broadcast={broadcast}
            onView={() => handleView(broadcast._id)}
            onEdit={() => handleEdit(broadcast._id)}
            onDelete={() => {
              setCurrent(broadcast);
              confirm.onTrue()
            }}
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

BroadcastList.propTypes = {
  broadcasts: PropTypes.array,
  refresh: PropTypes.func
};
