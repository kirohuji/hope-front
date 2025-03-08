import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
// @mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Pagination, { paginationClasses } from '@mui/material/Pagination';
// routes
import { paths } from 'src/routes/paths';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useSnackbar } from 'src/components/snackbar';
// components
import { useRouter } from 'src/routes/hook';
//
import { notificationService } from 'src/composables/context-provider';
import { ConfirmDialog } from 'src/components/custom-dialog';
import MembershipItem from './membership-item';
// ----------------------------------------------------------------------

export default function MembershipList({ notifications, refresh }) {
  const router = useRouter();
  const confirm = useBoolean();
  const loading = useBoolean();
  const [current, setCurrent] = useState({});
  const { enqueueSnackbar } = useSnackbar();
  const handleView = useCallback(
    (_id) => {
      router.push(paths.dashboard.membership.details(_id));
    },
    [router]
  );

  const handleEdit = useCallback(
    (_id) => {
      router.push(paths.dashboard.membership.edit(_id));
    },
    [router]
  );

  const handleDelete = useCallback(async () => {
    try {
      loading.onTrue();
      await notificationService.delete({
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
        {notifications.map((membership, i) => (
          <MembershipItem
            key={i}
            membership={membership}
            onView={() => handleView(membership._id)}
            onEdit={() => handleEdit(membership._id)}
            onDelete={() => {
              setCurrent(membership);
              confirm.onTrue();
            }}
          />
        ))}
      </Box>

      {/* {notifications.length > 8 && (
        <Pagination
          count={8}
          sx={{
            mt: 8,
            [`& .${paginationClasses.ul}`]: {
              justifyContent: 'center',
            },
          }}
        />
      )} */}
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

MembershipList.propTypes = {
  notifications: PropTypes.array,
  refresh: PropTypes.func,
};
