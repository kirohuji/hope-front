import PropTypes from 'prop-types';
// @mui
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
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

export default function VersionItem({ version, onView, onEdit, onDelete }) {
  const popover = usePopover();

  const { _id, label, majorVersion, cover, createdAt, candidates } = version;

  return (
    <>
      <Card>
        <IconButton onClick={popover.onOpen} sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>

        <Stack sx={{ p: 3, pb: 2 }}>
          <Avatar alt={majorVersion} src={cover} variant="rounded" sx={{ width: 48, height: 48, mb: 2 }} />

          <ListItemText
            sx={{ mb: 1 }}
            primary={
              <Link
                component={RouterLink}
                // href={paths.dashboard.version.details(_id)}
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
          {false && (
            <Stack
              spacing={0.5}
              direction="row"
              alignItems="center"
              sx={{ color: 'primary.main', typography: 'caption' }}
            >
              <Iconify width={16} icon="solar:users-group-rounded-bold" />
              {candidates ? candidates.length : '无'} 参与者
            </Stack>
          )}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/*
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
          */}
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
