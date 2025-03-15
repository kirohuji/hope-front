import PropTypes from 'prop-types';
// @mui
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
// utils
import { fDate } from 'src/utils/format-time';
// components
import Iconify from 'src/components/iconify';
import Markdown from 'src/components/markdown';

// ----------------------------------------------------------------------

const TYPE_OPTIONS = new Map([
  ['children', '儿童'],
  ['adolescent', '青少年'],
  ['adult', '成人'],
  ['newBelievers', '新人'],
]);

export default function BookDetailsContent({ book }) {
  const {
    label,
    type,
    description,
    publishedDate,
    createdAt,
    createdUser,
  } = book;

  const renderContent = (
    <Stack component={Card} spacing={3} sx={{ p: 3 }}>
      <Typography variant="h4">{label}</Typography>

      <Markdown children={description} />
    </Stack>
  );

  const renderOverview = (
    <Stack component={Card} spacing={2} sx={{ p: 3 }}>
      {[
        {
          label: '创建时间',
          value: fDate(createdAt),
          icon: <Iconify icon="solar:calendar-date-bold" />,
        },
        {
          label: '作者',
          value: `${createdUser?.username}(${createdUser?.realName})` || '未知',
          icon: <Iconify icon="solar:calendar-date-bold" />,
        },
        {
          label: '发布时间',
          value: fDate(publishedDate),
          icon: <Iconify icon="solar:calendar-date-bold" />,
        },
        {
          label: '分类',
          value: TYPE_OPTIONS.get(type),
          icon: <Iconify icon="solar:calendar-date-bold" />,
        },
      ].map((item) => (
        <Stack key={item.label} spacing={1.5} direction="row">
          {item.icon}
          <ListItemText
            primary={item.label}
            secondary={item.value}
            primaryTypographyProps={{
              typography: 'body2',
              color: 'text.secondary',
              mb: 0.5,
            }}
            secondaryTypographyProps={{
              typography: 'subtitle2',
              color: 'text.primary',
              component: 'span',
            }}
          />
        </Stack>
      ))}
    </Stack>
  );

  return (
    <Grid container spacing={3}>
      <Grid xs={12} md={8}>
        {renderContent}
      </Grid>

      <Grid xs={12} md={4}>
        {renderOverview}

        {/** renderCompany * */}
      </Grid>
    </Grid>
  );
}

BookDetailsContent.propTypes = {
  book: PropTypes.object,
};
