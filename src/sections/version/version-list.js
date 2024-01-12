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
import { versionService } from 'src/composables/context-provider';
import { ConfirmDialog } from 'src/components/custom-dialog';
//
import VersionItem from './version-item';

// ----------------------------------------------------------------------

export default function VersionList({ versions, onRefresh }) {
  const confirm = useBoolean();
  const [current, setCurrent] = useState({});
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  const handleView = useCallback(
    (_id) => {
      router.push(paths.dashboard.version.details(_id));
    },
    [router]
  );

  const handleEdit = useCallback(
    (_id) => {
      router.push(paths.dashboard.version.edit(_id));
    },
    [router]
  );

  const handleDelete = useCallback(
    async (_id) => {
      await versionService.delete({
        _id: current._id,
      });
      enqueueSnackbar('删除成功');
      onRefresh();
    },
    [current._id, enqueueSnackbar, onRefresh]
  );

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
        {versions.map((version) => (
          <VersionItem
            key={version._id}
            version={version}
            onView={() => handleView(version._id)}
            onEdit={() => handleEdit(version._id)}
            onDelete={() => {
              setCurrent(version);
              confirm.onTrue();
            }}
          />
        ))}
      </Box>

      {versions.length > 8 && (
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

VersionList.propTypes = {
  versions: PropTypes.array,
  onRefresh: PropTypes.func,
};
