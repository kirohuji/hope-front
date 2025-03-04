// @mui
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Scrollbar from 'src/components/scrollbar';
//
import FaqsHero from '../faqs-hero';
import FaqsList from '../faqs-list';
import FaqsForm from '../faqs-form';
import FaqsCategory from '../faqs-category';

// ----------------------------------------------------------------------

export default function FaqsView() {
  return (
    <>
      {/* <FaqsHero /> */}

      <Container
        sx={{
          pb: 10,
          // pt: { xs: 10, md: 15 },
          position: 'relative',
        }}
      >
        <Scrollbar sx={{ height: '100%' }}>
          {/* <FaqsCategory /> */}

          <Typography
            variant="h3"
            // sx={{
            //   my: { xs: 5, md: 10 },
            // }}
          >
            经常问到的问题
          </Typography>

          <Box
            gap={10}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              md: 'repeat(2, 1fr)',
            }}
          >
            <FaqsList />

            <FaqsForm />
          </Box>
        </Scrollbar>
      </Container>
    </>
  );
}
