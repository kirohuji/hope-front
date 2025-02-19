import { m } from 'framer-motion';
// @mui
import { alpha } from '@mui/material/styles';
import { MenuItem, Stack } from '@mui/material';
import IconButton from '@mui/material/IconButton';

// components
import Image from 'src/components/image';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// redux
import { useDispatch, useSelector } from 'src/redux/store';
import { setActive } from 'src/redux/slices/scope';
import { varHover } from 'src/components/animate';
// ----------------------------------------------------------------------

export default function ScopePopover() {
  const dispatch = useDispatch();

  const scope = useSelector((state) => state.scope);

  const popover = usePopover();

  const handleChange = (item) => {
    dispatch(setActive(item));
    popover.onClose();
  };

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={{
          width: 40,
          height: 40,
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          ...(popover.open && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
        }}
      >
        <Image disabledEffect src={scope.active?.cover} alt={scope.active?.cover} />
      </IconButton>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 200, p: 0 }}>
        <Stack spacing={0.75}>
          {scope.scopes.map((option) => (
            <MenuItem
              key={option._id}
              selected={option._id === scope.active?._id}
              onClick={() => handleChange(option)}
            >
              <Image
                disabledEffect
                alt={option.label}
                src={option.cover}
                sx={{
                  width: 40,
                  height: 40,
                  mr: 2,
                }}
              />

              {option.label}
            </MenuItem>
          ))}
        </Stack>
      </CustomPopover>
    </>
  );
}
