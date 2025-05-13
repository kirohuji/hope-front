import PropTypes from 'prop-types';
// @mui
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';

// components
import Restricted from 'src/auth/guard/restricted';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

export default function VersionTableRow({
  row,
  selected,
  onClose,
  onEditRow,
  onActiveRow,
  onSelectRow,
  onDeleteRow,
}) {
  const {
    majorVersion,
    minorVersion,
    patchVersion,
    isMandatory,
    releaseDate,
    description,
    isActive,
  } = row;

  const confirm = useBoolean();

  const quickEdit = useBoolean();

  const popover = usePopover();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>
        <TableCell>
          <ListItemText
            primary={`${majorVersion}.${minorVersion}.${patchVersion}`}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </TableCell>

        <TableCell>
          <ListItemText
            primary={description || '无'}
            primaryTypographyProps={{ typography: 'body2' }}
            secondaryTypographyProps={{ component: 'span', color: 'text.disabled' }}
          />
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{isMandatory || '否'}</TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{releaseDate || '未定'}</TableCell>

        <TableCell>
          <Label variant="soft" color={isActive ? 'success' : 'default'}>
            {isActive ? '激活' : '禁用'}
          </Label>
        </TableCell>
        <Restricted to={['UserListEdit', 'UserListDelete']}>
          <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
            <Restricted to={['UserListEdit']} hidden>
              <Tooltip title="快速编辑" placement="top" arrow>
                <IconButton
                  color={quickEdit.value ? 'inherit' : 'default'}
                  onClick={quickEdit.onTrue}
                >
                  <Iconify icon="solar:pen-bold" />
                </IconButton>
              </Tooltip>
            </Restricted>
            <Restricted to={['UserListEdit', 'UserListDelete']}>
              <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
            </Restricted>
          </TableCell>
        </Restricted>
      </TableRow>
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <Restricted to={['UserListEdit']}>
          <MenuItem
            onClick={() => {
              onActiveRow();
              popover.onClose();
            }}
          >
            <Iconify icon="material-symbols:motion-sensor-active" />
            {isActive ? '禁用' : '激活'}
          </MenuItem>
        </Restricted>
        <Restricted to={['UserListEdit']}>
          <MenuItem
            onClick={() => {
              onEditRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" />
            查看/编辑
          </MenuItem>
        </Restricted>
        <Restricted to={['UserListDelete']}>
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
        </Restricted>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="删除"
        content="你确认要删除吗?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow();
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

VersionTableRow.propTypes = {
  onDeleteRow: PropTypes.func,
  onClose: PropTypes.func,
  onEditRow: PropTypes.func,
  onActiveRow: PropTypes.func,
  onSelectRow: PropTypes.func,
  row: PropTypes.object,
  selected: PropTypes.bool,
};
