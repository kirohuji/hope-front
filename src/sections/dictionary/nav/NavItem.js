import PropTypes from 'prop-types';
// @mui
import { ListItemText, ListItemButton } from '@mui/material';
import { ICON } from 'src/config-global';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

NavItem.propTypes = {
  item: PropTypes.object,
  onSelect: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  active: PropTypes.bool
};

export default function NavItem ({ active, item, onSelect, onEdit, onDelete, ...other }) {

  return (
    <ListItemButton
      onClick={() => onSelect(item)}
      sx={{
        px: 3,
        height: 48,
        typography: 'body2',
        color: 'text.secondary',
        textTransform: 'capitalize',
        ...(active && {
          color: 'text.primary',
          bgcolor: 'action.selected',
          fontWeight: 'fontWeightMedium',
        }),
      }}
      {...other}
    >

      <ListItemText primary={item.label} sx={{ color: 'text.primary' }} />
      <Iconify
        icon="eva:edit-outline"
        onClick={onEdit}
        sx={{
          mr: 0,
          width: ICON.NAV_ITEM,
          height: ICON.NAV_ITEM,
          color: "text.primary",
        }}
      />
      <Iconify
        icon="eva:trash-2-outline"
        onClick={onDelete}
        sx={{
          mr: 0,
          width: ICON.NAV_ITEM,
          height: ICON.NAV_ITEM,
          color: "error.main",
        }}
      />
    </ListItemButton>
  );
}