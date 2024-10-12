import { useState, useCallback } from 'react';

// ----------------------------------------------------------------------

export default function useCollapseSettings() {
  const [openSettingsMobile, setOpenSettingsMobile] = useState(false);

  const onOpenSettingsMobile = useCallback(() => {
    setOpenSettingsMobile(true);
  }, []);

  const onCloseSettingsMobile = useCallback(() => {
    setOpenSettingsMobile(false);
  }, []);

  return {
    openSettingsMobile,
    //
    onOpenSettingsMobile,
    onCloseSettingsMobile,
  };
}
