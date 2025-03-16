import PropTypes from 'prop-types';
// @mui
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
// routes
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useResponsive } from 'src/hooks/use-responsive';
// utils
import { fDateTime } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
// components
import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import { shortDateLabel } from 'src/components/custom-date-range-picker';
import _ from 'lodash';
import Restricted from 'src/auth/guard/restricted';

// ----------------------------------------------------------------------

function isAssetTypeAnImage(ext) {
  return /\.(jpg|jpeg|png|gif)$/i.test(ext.toLowerCase());
}

const BROAECAST_TYPE_OPTIONS = [
  { value: 'activity', label: '活动通知' },
  { value: 'notification', label: '消息公告' },
  { value: 'familyGathering', label: '社交聚会' },
  // { value: 'book', label: '阅读' },
];

export default function BroadcastItem({ broadcast, onView, onEdit, onDelete }) {
  const popover = usePopover();
  const lgUp = useResponsive('up', 'lg');
  const { _id, label, price, images, createdAt, available, priceSale, destination, leaders, type } =
    broadcast;

  const imageSet = images.filter((img) => isAssetTypeAnImage(img.path));
  const shortLabel = shortDateLabel(new Date(available.startDate), new Date(available.endDate));

  const renderType = (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        top: 8,
        right: 8,
        zIndex: 9,
        borderRadius: 1,
        position: 'absolute',
        p: '2px 6px 2px 4px',
        typography: 'subtitle2',
        bgcolor: 'warning.lighter',
      }}
    >
      {_.find(BROAECAST_TYPE_OPTIONS, ['value', type]).label}
    </Stack>
  );

  const renderPrice = (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        top: 8,
        left: 8,
        zIndex: 9,
        borderRadius: 1,
        bgcolor: 'grey.800',
        position: 'absolute',
        p: '2px 6px 2px 4px',
        color: 'common.white',
        typography: 'subtitle2',
      }}
    >
      {!!priceSale && (
        <Box component="span" sx={{ color: 'grey.500', mr: 0.25, textDecoration: 'line-through' }}>
          {fCurrency(priceSale)}
        </Box>
      )}
      {fCurrency(price)}
    </Stack>
  );

  const renderImages = (
    <Stack
      spacing={0.5}
      direction="row"
      sx={{
        p: (theme) => theme.spacing(1, 1, 0, 1),
      }}
    >
      <Stack flexGrow={1} sx={{ position: 'relative' }}>
        {renderPrice}
        {renderType}
        {imageSet[0] && (
          <Image
            alt={imageSet[0].preview || ''}
            src={imageSet[0].preview || ''}
            sx={{ borderRadius: 1, height: 164, w_idth: 1 }}
          />
        )}
      </Stack>
      {imageSet[1] && (
        <Stack spacing={0.5}>
          <Image
            alt={imageSet[1].preview || ''}
            src={imageSet[1].preview || ''}
            ratio="1/1"
            sx={{ borderRadius: 1, width: 80 }}
          />
          {imageSet[2] && (
            <Image
              alt={imageSet[2].preview || ''}
              src={imageSet[2].preview || ''}
              ratio="1/1"
              sx={{ borderRadius: 1, width: 80 }}
            />
          )}
        </Stack>
      )}
    </Stack>
  );

  const renderTexts = (
    <ListItemText
      sx={{
        p: (theme) => theme.spacing(2.5, 2.5, 2, 2.5),
      }}
      primary={`发布时间: ${fDateTime(createdAt)}`}
      secondary={
        <Link component={RouterLink} href={paths.dashboard.broadcast.details(_id)} color="inherit">
          {label}
        </Link>
      }
      primaryTypographyProps={{
        typography: 'caption',
        color: 'text.disabled',
      }}
      secondaryTypographyProps={{
        mt: 1,
        noWrap: true,
        component: 'span',
        color: 'text.primary',
        typography: 'subtitle1',
      }}
    />
  );

  const renderInfo = (
    <Stack
      spacing={1.5}
      sx={{
        position: 'relative',
        p: (theme) => theme.spacing(0, 2.5, 2.5, 2.5),
      }}
    >
      <IconButton onClick={popover.onOpen} sx={{ position: 'absolute', bottom: 20, right: 8 }}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>

      {[
        {
          label: destination,
          icon: <Iconify icon="mingcute:location-fill" sx={{ color: 'error.main' }} />,
        },
        {
          label: shortLabel,
          icon: <Iconify icon="solar:clock-circle-bold" sx={{ color: 'info.main' }} />,
        },
        {
          label: `负责人: ${leaders.map((leader) => leader.realName) || '无'} `,
          icon: <Iconify icon="solar:users-group-rounded-bold" sx={{ color: 'primary.main' }} />,
        },
      ].map((item, i) => (
        <Stack key={i} spacing={1} direction="row" alignItems="center" sx={{ typography: 'body2' }}>
          {item.icon}
          {item.label}
        </Stack>
      ))}
    </Stack>
  );

  return (
    <>
      <Card>
        {renderImages}

        {renderTexts}

        {renderInfo}
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
        {lgUp && (
          <Restricted to={['BroadcastListEdit']}>
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
        )}
        {lgUp && (
          <Restricted to={['BroadcastListDelete']}>
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
        )}
      </CustomPopover>
    </>
  );
}

BroadcastItem.propTypes = {
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  onView: PropTypes.func,
  broadcast: PropTypes.object,
};
