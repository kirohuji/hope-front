import PropTypes from 'prop-types';
// @mui
import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineItem, { timelineItemClasses } from '@mui/lab/TimelineItem';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
// utils
import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export default function OrderDetailsHistory({ history }) {
  const renderSummary = (
    <Stack
      spacing={2}
      component={Paper}
      variant="outlined"
      sx={{
        p: 2.5,
        minWidth: 260,
        flexShrink: 0,
        borderRadius: 2,
        typography: 'body2',
        borderStyle: 'dashed',
      }}
    >
      <Stack spacing={0.5}>
        <Box sx={{ color: 'text.disabled' }}>下单时间</Box>
        {fDateTime(history.orderTime)}
      </Stack>
      <Stack spacing={0.5}>
        <Box sx={{ color: 'text.disabled' }}>付款时间</Box>
        {fDateTime(history.orderTime)}
      </Stack>
      <Stack spacing={0.5}>
        <Box sx={{ color: 'text.disabled' }}>发货时间</Box>
        {fDateTime(history.orderTime)}
      </Stack>
      <Stack spacing={0.5}>
        <Box sx={{ color: 'text.disabled' }}>完成时间</Box>
        {fDateTime(history.orderTime)}
      </Stack>
    </Stack>
  );

  const renderTimeline = (
    <Timeline
      sx={{
        p: 0,
        m: 0,
        [`& .${timelineItemClasses.root}:before`]: {
          flex: 0,
          padding: 0,
        },
      }}
    >
      {history.timeline.map((item, index) => {
        const firstTimeline = index === 0;

        const lastTimeline = index === history.timeline.length - 1;

        return (
          <TimelineItem key={item.title}>
            <TimelineSeparator>
              <TimelineDot color={(firstTimeline && 'primary') || 'grey'} />
              {lastTimeline ? null : <TimelineConnector />}
            </TimelineSeparator>

            <TimelineContent>
              <Typography variant="subtitle2">{item.title}</Typography>

              <Box sx={{ color: 'text.disabled', typography: 'caption', mt: 0.5 }}>
                {fDateTime(item.time)}
              </Box>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );

  return (
    <Card>
      <CardHeader title="历史记录" />
      <Stack
        spacing={3}
        alignItems={{ md: 'flex-start' }}
        direction={{ xs: 'column-reverse', md: 'row' }}
        sx={{ p: 3 }}
      >
        {renderTimeline}

        {renderSummary}
      </Stack>
    </Card>
  );
}

OrderDetailsHistory.propTypes = {
  history: PropTypes.object,
};
