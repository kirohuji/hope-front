// @mui
import { Box, Skeleton, Card } from '@mui/material';

// ----------------------------------------------------------------------

export default function SkeletonPostItem({ ...other }) {
  console.log('骨骼')
  return (
    <Card sx={{ margin: '15px 0 15px 15px', width: '110px', height: '140px' }}>
      <Skeleton variant="rectangular" width="100%" sx={{ height: 200, borderRadius: 2 }} />
      <Box sx={{ display: 'flex', mt: 1.5 }}>
        <Skeleton variant="circular" sx={{ width: 40, height: 40 }} />
        <Skeleton variant="text" sx={{ mx: 1, flexGrow: 1 }} />
      </Box>
    </Card>
  );
}
