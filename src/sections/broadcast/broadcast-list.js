import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import LoadingButton from '@mui/lab/LoadingButton';
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

export default function BroadcastList({ broadcasts, refresh }) {
  const router = useRouter();

  const confirm = useBoolean();

  const loading = useBoolean();

  const [current, setCurrent] = useState({});

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
    try {
      loading.onTrue();
      await broadcastService.delete({
        _id: current._id,
      });
      enqueueSnackbar('删除成功');
      loading.onFalse();
      confirm.onFalse();
      refresh();
    } catch (e) {
      enqueueSnackbar('删除失败');
      loading.onFalse();
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
        {broadcasts.map((broadcast, i) => (
          <BroadcastItem
            key={i}
            broadcast={broadcast}
            onView={() => handleView(broadcast._id)}
            onEdit={() => handleEdit(broadcast._id)}
            onDelete={() => {
              setCurrent(broadcast);
              confirm.onTrue();
            }}
          />
        ))}
      </Box>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="删除"
        content={<>确定要删除吗?</>}
        action={
          <LoadingButton
            variant="contained"
            loading={loading.value}
            color="error"
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

BroadcastList.propTypes = {
  broadcasts: PropTypes.array,
  refresh: PropTypes.func,
};
