import { useState, useCallback } from 'react';

// ----------------------------------------------------------------------

export default function useCollapseHistory() {
  const [openHistoryMobile, setOpenHistoryMobile] = useState(false);

  const onOpenHistoryMobile = useCallback(() => {
    setOpenHistoryMobile(true);
  }, []);

  const onCloseHistoryMobile = useCallback(() => {
    setOpenHistoryMobile(false);
  }, []);

  return {
    openHistoryMobile,
    //
    onOpenHistoryMobile,
    onCloseHistoryMobile,
  };
}
