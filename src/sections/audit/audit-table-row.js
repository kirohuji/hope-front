import PropTypes from 'prop-types';
import { format } from 'date-fns';
// @mui
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import { paths } from 'src/routes/paths';
import ListItemText from '@mui/material/ListItemText';
// routes
import { useRouter } from 'src/routes/hook';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { getLabelFromValue } from 'src/utils/map';
import { status as statusMap } from './audit-new-edit-form';

// ----------------------------------------------------------------------

export default function AuditTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
}) {
  const router = useRouter();

  const { sourceId, reason, createdUser, createdAt, reviewerId, category, status } = row;

  const confirm = useBoolean();

  const popover = usePopover();

  const handleSourceId = () => {
    if (category === '内容分享') {
      router.push(paths.dashboard.post.details(sourceId));
    }
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell
          sx={{
            display: 'flex',
            alignItems: 'center',
            maxWidth: '210px',
            whiteSpace: 'nowrap',
            overflow: 'hidden' /* 隐藏溢出的文本 */,
            textOverflow: 'ellipsis' /* 显示省略号 */,
          }}
        >
          <Avatar alt={createdUser.username} src={createdUser.photoURL} sx={{ mr: 2 }} />

          <ListItemText
            primary={`${createdUser.username}${
              createdUser.realName ? `(${createdUser.realName})` : ''
            }`}
            secondary={createdUser.email}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </TableCell>
        <TableCell
          sx={{
            maxWidth: '100px',
            whiteSpace: 'nowrap',
            overflow: 'hidden' /* 隐藏溢出的文本 */,
            textOverflow: 'ellipsis' /* 显示省略号 */,
          }}
        >
          <Link color="primary" onClick={handleSourceId} sx={{ cursor: 'pointer' }}>
            查看
          </Link>
        </TableCell>
        {/* <TableCell>{description}</TableCell> */}
        {/* <TableCell>{result}</TableCell> */}
        <TableCell>{reason}</TableCell>
        <TableCell>{reviewerId}</TableCell>
        <TableCell>{category}</TableCell>
        <TableCell>
          <ListItemText
            primary={format(new Date(createdAt), 'dd MMM yyyy')}
            secondary={format(new Date(createdAt), 'p')}
            primaryTypographyProps={{ typography: 'body2', noWrap: true }}
            secondaryTypographyProps={{
              mt: 0.5,
              component: 'span',
              typography: 'caption',
            }}
          />
        </TableCell>
        <TableCell>
          <Label
            variant="soft"
            color={
              (status === 'paid' && 'success') ||
              (status === 'pending' && 'warning') ||
              (status === 'overdue' && 'error') ||
              'default'
            }
          >
            {getLabelFromValue(status, statusMap)}
          </Label>
        </TableCell>

        <TableCell align="right" sx={{ px: 1 }}>
          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 160 }}
      >
        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          查看/编辑
        </MenuItem>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          删除
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="删除"
        content="你确认要删除吗?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            删除
          </Button>
        }
      />
    </>
  );
}

AuditTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
