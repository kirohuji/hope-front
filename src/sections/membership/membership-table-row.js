import PropTypes from 'prop-types';
import { format } from 'date-fns';
// @mui
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import { fCurrency } from 'src/utils/format-number';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function MembershipTableRow({
  row,
  selected,
  onSelectRow,
  onViewRow,
  onEditRow,
  onDeleteRow,
}) {
  const {
    userId,
    membershipType,
    status,
    startDate,
    endDate,
    autoRenew,
    price,
    discount,
    points,
    paymentMethod,
    orderId,
    createdAt,
  } = row;

  const confirm = useBoolean();
  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        <TableCell>
          <Typography variant="body2" noWrap>
            {userId}
          </Typography>
        </TableCell>

        <TableCell>{membershipType}</TableCell>

        <TableCell>
          <Label
            variant="soft"
            color={
              (status === 'active' && 'success') ||
              (status === 'expired' && 'warning') ||
              (status === 'canceled' && 'error') ||
              'default'
            }
          >
            {status}
          </Label>
        </TableCell>

        <TableCell>{format(new Date(startDate), 'dd MMM yyyy')}</TableCell>

        <TableCell>{format(new Date(endDate), 'dd MMM yyyy')}</TableCell>

        <TableCell>
          <Label variant="soft" color={autoRenew ? 'success' : 'default'}>
            {autoRenew ? '是' : '否'}
          </Label>
        </TableCell>

        <TableCell>{fCurrency(price)}</TableCell>

        <TableCell>{discount}%</TableCell>

        <TableCell>{points}</TableCell>

        <TableCell>{paymentMethod}</TableCell>

        <TableCell>{orderId}</TableCell>

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

MembershipTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  onViewRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
