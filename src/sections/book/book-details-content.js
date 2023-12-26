import PropTypes from 'prop-types';
// @mui
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
// import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
// import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
// utils
import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';
// components
import Iconify from 'src/components/iconify';
import Markdown from 'src/components/markdown';

// ----------------------------------------------------------------------

const TYPE_OPTIONS = new Map([
  ['children', '儿童'],
  ['adolescent', '青少年'],
  ['adult', '成人'],
  ['newBelievers', '初信'],
]);

export default function BookDetailsContent({ book }) {
  const {
    label,
    // skills,
    // salary,
    type,
    description,
    // benefits,
    publishedDate,
    createdAt,
    createdUser,
    // experience,
    // // expiredDate,
    // employmentTypes,
  } = book;

  const renderContent = (
    <Stack component={Card} spacing={3} sx={{ p: 3 }}>
      <Typography variant="h4">{label}</Typography>

      <Markdown children={description} />

      {/**
         * 
         *       <Stack spacing={2}>
        <Typography variant="h6">Skills</Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          {skills && skills.map((skill) => (
            <Chip key={skill} label={skill} variant="soft" />
          ))}
        </Stack>
      </Stack>

      <Stack spacing={2}>
        <Typography variant="h6">Benefits</Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          {benefits && benefits.map((benefit) => (
            <Chip key={benefit} label={benefit} variant="soft" />
          ))}
        </Stack>
      </Stack>
         */}
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
        // {
        //   label: '所属',
        //   value: fDate(createdAt),
        //   icon: <Iconify icon="solar:calendar-date-bold" />,
        // },
        {
          label: '分类',
          value: TYPE_OPTIONS.get(type),
          icon: <Iconify icon="solar:calendar-date-bold" />,
        },
        // {
        //   label: 'Expiration date',
        //   value: fDate(expiredDate),
        //   icon: <Iconify icon="solar:calendar-date-bold" />,
        // },
        // {
        //   label: 'Employment type',
        //   value: employmentTypes,
        //   icon: <Iconify icon="solar:clock-circle-bold" />,
        // },
        // {
        //   label: 'Offered salary',
        //   value: salary && salary.negotiable ? 'Negotiable' : salary && fCurrency(salary.price),
        //   icon: <Iconify icon="solar:wad-of-money-bold" />,
        // },
        // {
        //   label: 'Experience',
        //   value: experience,
        //   icon: <Iconify icon="carbon:skill-level-basic" />,
        // },
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

  // const renderCompany = (
  //   <Stack
  //     component={Paper}
  //     variant="outlined"
  //     spacing={2}
  //     direction="row"
  //     sx={{ p: 3, borderRadius: 2, mt: 3 }}
  //   >
  //     <Avatar
  //       alt={book.company.name}
  //       src={book.company.logo}
  //       variant="rounded"
  //       sx={{ width: 64, height: 64 }}
  //     />

  //     <Stack spacing={1}>
  //       <Typography variant="subtitle1">{book.company.name}</Typography>
  //       <Typography variant="body2">{book.company.fullAddress}</Typography>
  //       <Typography variant="body2">{book.company.phoneNumber}</Typography>
  //     </Stack>
  //   </Stack>
  // );

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
