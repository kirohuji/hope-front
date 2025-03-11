import PropTypes from 'prop-types';
// @mui
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// utils
import { fDate } from 'src/utils/format-time';
// routes
import { paths } from 'src/routes/paths';
// components
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import Restricted from 'src/auth/guard/restricted';

// ----------------------------------------------------------------------

export default function VersionItem({ version, onView, onEdit, onDelete }) {
  const popover = usePopover();

  const { _id, majorVersion, cover, createdAt } = version;

  return (
    <>
      <Card>
        <IconButton onClick={popover.onOpen} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>

        <Stack sx={{ p: 3, pb: 2 }}>
          <Avatar
            alt={majorVersion}
            src={cover}
            variant="rounded"
            sx={{ width: 48, height: 48, mb: 2 }}
          />

          <ListItemText
            sx={{ mb: 1 }}
            primary={
              <Link
                component={RouterLink}
                href={paths.dashboard.version.details.root(_id)}
                color="inherit"
              >
                主版本号: {majorVersion}
              </Link>
            }
            secondary={`创建时间: ${fDate(createdAt)}`}
            primaryTypographyProps={{
              typography: 'subtitle1',
            }}
            secondaryTypographyProps={{
              mt: 1,
              component: 'span',
              typography: 'caption',
              color: 'text.disabled',
            }}
          />
        </Stack>
      </Card>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            popover.onClose();
            onView();
          }}
        >
          <Iconify icon="solar:eye-bold" />
          查看
        </MenuItem>
        <Restricted to={['VersionListEdit']}>
          <MenuItem
            onClick={() => {
              popover.onClose();
              onEdit();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            编辑
          </MenuItem>
        </Restricted>
        <Restricted to={['VersionListDelete']}>
          <MenuItem
            onClick={() => {
              popover.onClose();
              onDelete();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            删除
          </MenuItem>
        </Restricted>
      </CustomPopover>
    </>
  );
}

VersionItem.propTypes = {
  version: PropTypes.object,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onView: PropTypes.func,
};
