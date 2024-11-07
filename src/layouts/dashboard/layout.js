import PropTypes from 'prop-types';
import { useRef, useCallback, useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// components
import { useSettingsContext } from 'src/components/settings';
import MusicPlayer from 'src/components/music-player';
import BookPlayer from 'src/sections/training/book-player';
//
import { usePathname } from 'src/routes/hook';
import { useDispatch, useSelector } from 'src/redux/store';
import { getScopes } from 'src/redux/slices/scope';
import _ from 'lodash';
import Main from './main';
import Header from './header';
import NavMini from './nav-mini';
import NavVertical from './nav-vertical';
import NavHorizontal from './nav-horizontal';
import DashboardFooter from './footer';
// ----------------------------------------------------------------------

export default function DashboardLayout({ children }) {
  const bookPlayerRef = useRef(null);
  const musicPlayerRef = useRef(null);

  const dispatch = useDispatch();
  const scope = useSelector((state) => state.scope);

  const settings = useSettingsContext();

  const lgUp = useResponsive('up', 'lg');

  const nav = useBoolean();

  const isHorizontal = settings.themeLayout === 'horizontal';

  const isMini = settings.themeLayout === 'mini';

  const renderNavMini = <NavMini />;

  const renderHorizontal = <NavHorizontal />;

  const renderNavVertical = <NavVertical openNav={nav.value} onCloseNav={nav.onFalse} />;

  const pathname = usePathname();

  const getAllEvents = useCallback(() => {
    if (!scope.active?._id) {
      dispatch(getScopes());
    }
  }, [dispatch, scope.active]);

  useEffect(() => {
    getAllEvents();
    if (!lgUp && pathname === '/dashboard/training/dashboard') {
      const bookPlayerElement = bookPlayerRef.current;
      if (bookPlayerElement) {
        const navigationElement = document.getElementById('bottom-navigation');
        if (navigationElement) {
          if(navigationElement.clientHeight > 56){
            bookPlayerElement.style.bottom = `${navigationElement.clientHeight}px`;
          } else {
            bookPlayerElement.style.bottom = `${85}px`;
          }
        } else {
          bookPlayerElement.style.bottom = `${85}px`;
        }
      }
    } else if (!lgUp && pathname === '/dashboard/file-manager') {
      const musicPlayerElement = musicPlayerRef.current;
      if (musicPlayerRef) {
        const navigationElement = document.getElementById('bottom-navigation');
        if (navigationElement) {
          musicPlayerElement.style.bottom = `${navigationElement.clientHeight}px`;
        }
      }
    }
  }, [getAllEvents, lgUp, pathname]);

  if (isHorizontal) {
    return (
      <>
        <Header onOpenNav={nav.onTrue} />

        {lgUp ? renderHorizontal : renderNavVertical}

        <Main>{children}</Main>
      </>
    );
  }

  if (isMini) {
    return (
      <>
        <Header onOpenNav={nav.onTrue} />

        <Box
          sx={{
            minHeight: 1,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {lgUp ? renderNavMini : renderNavVertical}

          <Main>{children}</Main>
          {!lgUp && !pathname.includes('/dashboard/broadcast/') && <DashboardFooter />}
        </Box>
      </>
    );
  }
  console.log(pathname)
  return (
    <>
      <Header onOpenNav={nav.onTrue} />
      <Box
        sx={{
          minHeight: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        {renderNavVertical}

        <Main className="main">{children}</Main>
        {!lgUp && !pathname.includes('/dashboard/broadcast/') && !pathname.includes('/dashboard/article/') && <DashboardFooter />}
        {!lgUp && pathname === '/dashboard/file-manager' && (
          <Box
            ref={musicPlayerRef}
            position="fixed"
            color="primary"
            sx={{ top: 'auto', background: 'none', width: '100%' }}
            className="book-player"
          >
            <MusicPlayer />
          </Box>
        )}
        {!lgUp && pathname === '/dashboard/training/dashboard' && (
          <Box
            ref={bookPlayerRef}
            position="fixed"
            color="primary"
            sx={{ top: 'auto', background: 'none', width: '100%' }}
            className="book-player"
          >
            <BookPlayer />
          </Box>
        )}
      </Box>
    </>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node,
};
