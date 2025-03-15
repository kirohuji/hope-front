import PropTypes from 'prop-types';
// @mui
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Image from 'src/components/image';
import Divider from '@mui/material/Divider';
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

const TYPE_OPTIONS = new Map([
  ['children', '儿童'],
  ['adolescent', '青少年'],
  ['adult', '成人'],
  ['newBelievers', '新人'],
]);
export default function BookItem({ book, onView, onEdit, onDelete }) {
  const popover = usePopover();

  const { _id, label, cover, createdAt, type } = book;

  const renderType = (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        top: 8,
        left: 8,
        zIndex: 9,
        borderRadius: 1,
        position: 'absolute',
        p: '2px 6px 2px 4px',
        typography: 'subtitle2',
        bgcolor: 'warning.lighter',
        fontSize: '12px',
      }}
    >
      {Array.isArray(type)
        ? type.map((tp) => TYPE_OPTIONS.get(tp)).join(',')
        : TYPE_OPTIONS.get(type)}
    </Stack>
  );
  return (
    <>
      <Card>
        <IconButton onClick={popover.onOpen} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>

        <Stack sx={{ p: 2, pb: 2 }} direction="row">
          {renderType}
          <Image
            alt={label}
            src={cover}
            sx={{
              width: 100,
              height: 120,
            }}
          />
          <Stack sx={{ pl: 2, pr: 2 }}>
            <ListItemText
              sx={{ mb: 1 }}
              primary={
                <Link
                  component={RouterLink}
                  href={paths.dashboard.book.details.root(_id)}
                  color="inherit"
                >
                  {label}
                </Link>
              }
              secondary={`发布时间: ${fDate(createdAt)}`}
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
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />
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
        <Restricted to={['BookListEdit']}>
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
        <Restricted to={['BookListDelete']}>
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

BookItem.propTypes = {
  book: PropTypes.object,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onView: PropTypes.func,
};
