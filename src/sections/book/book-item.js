import PropTypes from 'prop-types';
// @mui
// import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Image from 'src/components/image';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
// import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
// utils
import { fDate } from 'src/utils/format-time';
// import { fCurrency } from 'src/utils/format-number';
// routes
import { paths } from 'src/routes/paths';
// components
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

export default function BookItem ({ book, onView, onEdit, onDelete }) {
  const theme = useTheme();
  const popover = usePopover();

  const { _id, label, cover, createdAt, candidates } =
    book;

  return (
    <>
      <Card>
        <IconButton onClick={popover.onOpen} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>

        <Stack sx={{ p: 2, pb: 2 }} direction="row">
          <Image
            alt={label}
            src={cover}
            sx={{
              width: 100,
              height: 120,
            }}
          />
          <Stack sx={{ pl: 2}}>
            <ListItemText
              sx={{ mb: 1 }}
              primary={
                <Link component={RouterLink} href={paths.dashboard.book.details.root(_id)} color="inherit">
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
            {
              /**
               * 
               *             <Stack
              spacing={0.5}
              direction="row"
              alignItems="center"
              sx={{ color: 'primary.main', typography: 'caption' }}
            >
              <Iconify width={16} icon="solar:users-group-rounded-bold" />
              {candidates ? candidates.length : '无'} 参与者
            </Stack>
               */
            }
          </Stack>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />
        {
          /**
                <Box rowGap={1.5} display="grid" gridTemplateColumns="repeat(2, 1fr)" sx={{ p: 3 }}>
                  {[
                    {
                      label: experience,
                      icon: <Iconify width={16} icon="carbon:skill-level-basic" sx={{ flexShrink: 0 }} />,
                    },
                    {
                      label: employmentTypes.join(', '),
                      icon: <Iconify width={16} icon="solar:clock-circle-bold" sx={{ flexShrink: 0 }} />,
                    },
                    {
                      label: salary.negotiable ? 'Negotiable' : fCurrency(salary.price),
                      icon: <Iconify width={16} icon="solar:wad-of-money-bold" sx={{ flexShrink: 0 }} />,
                    },
                    {
                      label: role,
                      icon: <Iconify width={16} icon="solar:user-rounded-bold" sx={{ flexShrink: 0 }} />,
                    },
                  ].map((item) => (
                    <Stack
                      key={item.label}
                      spacing={0.5}
                      flexShrink={0}
                      direction="row"
                      alignItems="center"
                      sx={{ color: 'text.disabled', minWidth: 0 }}
                    >
                      {item.icon}
                      <Typography variant="caption" noWrap>
                        {item.label}
                      </Typography>
                    </Stack>
                  ))}
                </Box>
           */
        }
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

        <MenuItem
          onClick={() => {
            popover.onClose();
            onEdit();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          编辑
        </MenuItem>
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
