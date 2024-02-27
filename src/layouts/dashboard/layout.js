import PropTypes from 'prop-types';
import { useCallback, useEffect } from 'react';
// @mui
import Box from '@mui/material/Box';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useResponsive } from 'src/hooks/use-responsive';
// components
import { useSettingsContext } from 'src/components/settings';
import MusicPlayer from 'src/components/music-player';
import BookPlayer from 'src/sections/training/book-player';
import AppBar from '@mui/material/AppBar';
//
import { usePathname } from 'src/routes/hook';
import { useDispatch, useSelector } from 'src/redux/store';
import { getConversations } from 'src/redux/slices/chat';
import { getScopes } from 'src/redux/slices/scope';
// import { ddpclient, conversations } from 'src/composables/context-provider';
import { useAuthContext } from 'src/auth/hooks';
import _ from 'lodash';
import Main from './main';
import Header from './header';
import NavMini from './nav-mini';
import NavVertical from './nav-vertical';
import NavHorizontal from './nav-horizontal';
import DashboardFooter from './footer';
// ----------------------------------------------------------------------

const conversations2Publish = null;
const conversations2Collection = null;
export default function DashboardLayout({ children }) {
  const { user } = useAuthContext();
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
  }, [getAllEvents]);

  const updateConversationsByDebounce = _.debounce((target) => {
    dispatch(
      getConversations({
        ids: target.map((item) => item._id),
      })
    );
  }, 2000);

  // useEffect(() => {
  //   try {
  //     if (user._id && !conversations.conversations2Publish) {
  //       console.log('user._id', user._id);
  //       conversations.conversations2Publish = ddpclient.subscribe('socialize.conversations');
  //       conversations.conversations2Publish.ready();
  //       conversations.conversations2Collection = ddpclient
  //         .collection('socialize:conversations')
  //         .reactive();
  //       conversations.conversations2Collection.onChange(async (target) => {
  //         console.log('updateConversationsByDebounce', target);
  //         updateConversationsByDebounce(target);
  //       });
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  //   return () => {
  //     console.log('conversations2Publish');
  //     console.log('conversations2Publish');
  //     // if (conversations2Publish) {
  //     //   conversations2Publish.stop();
  //     //   conversations2Collection.stop();
  //     // }
  //   };
  // }, [dispatch, updateConversationsByDebounce, user]);

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
          {!lgUp && <DashboardFooter />}
        </Box>
      </>
    );
  }

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
        {!lgUp && <DashboardFooter />}
        {!lgUp && pathname === '/dashboard/training/dashboard' && (
          <Box
            position="fixed"
            color="primary"
            sx={{ top: 'auto', bottom: 55, background: 'none', width: '100%' }}
            className="book-player"
          >
            {/* <MusicPlayer /> */}
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
