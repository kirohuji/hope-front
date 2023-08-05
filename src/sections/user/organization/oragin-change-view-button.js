import PropTypes from 'prop-types';
// @mui
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

OraginChangeViewButton.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export default function OraginChangeViewButton({ value, onChange, ...other }) {
  return (
    <ToggleButtonGroup
      size="small"
      color="primary"
      value={value}
      exclusive
      onChange={onChange}
      {...other}
    >
      <ToggleButton value="org">
        <Iconify icon="eva:list-fill" />
      </ToggleButton>

      <ToggleButton value="role">
        <Iconify icon="eva:grid-fill" />
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
