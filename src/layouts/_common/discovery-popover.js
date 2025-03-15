import { m } from 'framer-motion';
// @mui
import IconButton from '@mui/material/IconButton';
import { useBoolean } from 'src/hooks/use-boolean';
import { useEventListener } from 'src/hooks/use-event-listener';
// components
import { varHover } from 'src/components/animate';
import Iconify from 'src/components/iconify';
import DiscoveryCompose from 'src/sections/discovery//discovery-compose';
// ----------------------------------------------------------------------

export default function DiscoveryPopover() {

  const feed = useBoolean();

  const handleKeyDown = (event) => {
    if (event.key === 'k' && event.metaKey) {
      feed.onToggle();
    }
  };

  useEventListener('keydown', handleKeyDown);

  const renderButton = (
    <IconButton
      component={m.button}
      whileTap="tap"
      whileHover="hover"
      variants={varHover(1.05)}
      onClick={feed.onTrue}
      sx={{ pl: '2px' }}
    >
      <Iconify icon="lets-icons:fire-duotone-fill" width={30} />
    </IconButton>
  );
  return (
    <>
      {renderButton}
      {feed.value && <DiscoveryCompose onCloseCompose={feed.onFalse} />}
    </>
  );
}
