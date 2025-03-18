import PropTypes from 'prop-types';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import ListItemText from '@mui/material/ListItemText';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
// components
import Image from 'src/components/image';
import Carousel, { CarouselDots, useCarousel } from 'src/components/carousel';
import { shortDateLabel } from 'src/components/custom-date-range-picker';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import Iconify from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
// utils
import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export default function DiscoveryKanban({ list, ...other }) {
  const carousel = useCarousel({
    speed: 800,
    autoplay: true,
    ...CarouselDots({
      sx: {
        right: 20,
        bottom: 20,
        position: 'absolute',
        color: 'primary.light',
      },
    }),
  });

  return (
    <Card {...other}>
      <Carousel {...carousel.carouselSettings}>
        {list.map((item) => (
          <CarouselItem key={item._id} item={item} />
        ))}
      </Carousel>
    </Card>
  );
}

DiscoveryKanban.propTypes = {
  list: PropTypes.array,
};

// ----------------------------------------------------------------------

function CarouselItem({ item }) {
  const theme = useTheme();

  const router = useRouter();

  const { _id, label, price, images, createdAt, available, priceSale, destination, leaders, type } =
    item;
  const shortLabel = shortDateLabel(new Date(available.startDate), new Date(available.endDate));
  // const renderImg = (
  //   <Image
  //     alt={label}
  //     src={images[0].preview}
  //     overlay={`linear-gradient(to bottom, ${alpha(theme.palette.grey[900], 0)} 0%, ${
  //       theme.palette.grey[900]
  //     } 75%)`}
  //     sx={{
  //       width: 1,
  //       height: { xs: 280, xl: 480 },
  //     }}
  //   />
  // );

  // const renderTexts = (
  //   <ListItemText
  //     sx={{
  //       p: (t) => t.spacing(2.5, 2.5, 2, 2.5),
  //     }}
  //     primary={`发布时间: ${fDateTime(createdAt)}`}
  //     secondary={
  //       <Link component={RouterLink} href={paths.dashboard.broadcast.details(_id)} color="inherit">
  //         {label}
  //       </Link>
  //     }
  //     primaryTypographyProps={{
  //       typography: 'caption',
  //       color: 'text.disabled',
  //     }}
  //     secondaryTypographyProps={{
  //       mt: 1,
  //       noWrap: true,
  //       component: 'span',
  //       color: 'text.primary',
  //       typography: 'subtitle1',
  //     }}
  //   />
  // );

  const renderImages = (
    <Stack spacing={0.5} direction="row">
      <Stack flexGrow={1} sx={{ position: 'relative' }}>
        <Image
          alt={label}
          src={images[0].preview}
          overlay={`linear-gradient(to bottom, ${alpha(theme.palette.grey[900], 0)} 0%, ${
            theme.palette.grey[900]
          } 75%)`}
          sx={{ borderRadius: 1, height: { xs: 280, xl: 480 }, width: 1 }}
        />
      </Stack>
      {images.length > 2 && (
        <Stack spacing={0.5}>
          <Image
            alt={label}
            src={images[1].preview}
            ratio="1/1"
            sx={{ borderRadius: 1, width: 138 }}
          />
          <Image
            alt={label}
            src={images[2].preview}
            ratio="1/1"
            overlay={`linear-gradient(to bottom, ${alpha(theme.palette.grey[900], 0)} 0%, ${
              theme.palette.grey[900]
            } 75%)`}
            sx={{ borderRadius: 1, width: 138 }}
          />
        </Stack>
      )}
    </Stack>
  );

  // const renderInfo = (
  //   <Stack
  //     spacing={1.5}
  //     sx={{
  //       position: 'relative',
  //       p: (t) => t.spacing(0, 2.5, 2.5, 2.5),
  //     }}
  //   >
  //     {[
  //       {
  //         label: destination,
  //         icon: <Iconify icon="mingcute:location-fill" sx={{ color: 'error.main' }} />,
  //       },
  //       {
  //         label: shortLabel,
  //         icon: <Iconify icon="solar:clock-circle-bold" sx={{ color: 'info.main' }} />,
  //       },
  //       {
  //         label: `负责人: ${leaders.map((leader) => leader.realName) || '无'} `,
  //         icon: <Iconify icon="solar:users-group-rounded-bold" sx={{ color: 'primary.main' }} />,
  //       },
  //     ].map((info, i) => (
  //       <Stack key={i} spacing={1} direction="row" alignItems="center" sx={{ typography: 'body2' }}>
  //         {info.icon}
  //         {info.label}
  //       </Stack>
  //     ))}
  //   </Stack>
  // );

  return (
    <Box
      sx={{
        position: 'relative',
        background: `linear-gradient(to bottom, ${alpha(theme.palette.grey[900], 0)} 0%, ${
          theme.palette.grey[900]
        } 75%)`,
      }}
    >
      <CardContent
        sx={{
          left: 0,
          width: 1,
          bottom: 0,
          zIndex: 9,
          textAlign: 'left',
          position: 'absolute',
          color: 'common.white',
        }}
      >
        <Typography variant="overline" sx={{ opacity: 0.48 }}>
          活动
        </Typography>

        <Typography noWrap variant="h5" sx={{ mt: 1, mb: 3 }}>
          {label}
        </Typography>

        <Button color="primary" variant="contained" onClick={()=>{
          router.push(paths.dashboard.broadcast.details(_id))
        }}>
          了解详情
        </Button>
      </CardContent>

      {/* {renderImg} */}
      {renderImages}

      {/* {renderTexts} */}

      {/* {renderInfo} */}
    </Box>
  );
}

CarouselItem.propTypes = {
  item: PropTypes.object,
};
