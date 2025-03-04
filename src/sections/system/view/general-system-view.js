// components
import Scrollbar from 'src/components/scrollbar';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Label from 'src/components/label';
import { systemNavData } from '../system-navigation';

export default function SystemGeneralView() {
  return (
    <Scrollbar>
      <Stack
        sx={{
          py: 3,
          px: 2.5,
        }}
      >
        {systemNavData.map((option) => (
          <MenuItem
            key={option.label}
            sx={{
              py: 1,
              color: 'text.secondary',
              '& svg': { width: 24, height: 24 },
              '&:hover': { color: 'text.primary' },
            }}
          >
            {option.icon}

            <Box component="span" sx={{ ml: 2 }}>
              {option.label}
            </Box>
            {option.info && (
              <Label color="error" sx={{ ml: 1 }}>
                {option.info}
              </Label>
            )}
          </MenuItem>
        ))}
      </Stack>
    </Scrollbar>
  );
}
