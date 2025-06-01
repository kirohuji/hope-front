// @mui
import Accordion from '@mui/material/Accordion';
import Typography from '@mui/material/Typography';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
// _mock
// import { _faqs } from 'src/_mock';
// components
import Iconify from 'src/components/iconify';
import { useSnackbar } from 'src/components/snackbar';
import { useEffect, useState, useCallback } from 'react';
import { dictionaryService } from 'src/composables/context-provider';

// ----------------------------------------------------------------------

export default function FaqsList() {
  // const [loading, setLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const [data, setData] = useState([]);
  const refresh = useCallback(async () => {
    try {
      const response = await dictionaryService.dict({
        value: 'FAQ',
      });
      setData(response.children);
    } catch (error) {
      enqueueSnackbar(error.message);
    }
  }, [enqueueSnackbar]);
  useEffect(() => {
    refresh();
  }, [refresh]);
  return (
    <div>
      {data.map((accordion) => (
        <Accordion key={accordion._id}>
          <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
            <Typography variant="subtitle1">{accordion.label}</Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Typography>{accordion.description}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}
