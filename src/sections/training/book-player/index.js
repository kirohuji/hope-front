import * as React from 'react';
import { useRef, useCallback, useState, useEffect } from 'react';
import { useScroll } from 'framer-motion';
import { useOffSetTop } from 'src/hooks/use-off-set-top';
import { grey } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Iconify from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'src/redux/store';
import { getBooksWithCurrentUserBySummarize, select } from 'src/redux/slices/trainning';
// import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Drawer from '@mui/material/Drawer';
import moment from 'moment';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
import Scrollbar from 'src/components/scrollbar';
import ScrollProgress from 'src/components/scroll-progress';
import { HEADER } from 'src/config-global';
import { ArticleDetailsView } from 'src/sections/article/view';
import Header from './header';

const TinyText = styled(Typography)({
  fontSize: '0.75rem',
  opacity: 0.38,
  fontWeight: 500,
  letterSpacing: 0.2,
});

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? '#fff' : grey[800],
}));

export default function BookPlayer() {
  const selectLoading = useBoolean(false);
  const [isOpenList, setOpenList] = useState(null);
  const dispatch = useDispatch();
  const isPlay = useBoolean(false);
  const { book, article, list, selectedArticle } = useSelector((state) => state.trainning);
  const [open, setOpen] = useState(false);
  const isOffset = useOffSetTop(HEADER.H_MAIN_DESKTOP);
  const router = useRouter();
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };
  const handleClickListItem = useCallback((event) => {
    setOpenList(event.currentTarget);
  }, []);
  const container = window !== undefined ? () => window.document.body : undefined;

  const containerRef = useRef(null);

  const scrollContainer = useScroll({ container: containerRef });

  const selectItem = useCallback(
    async (current) => {
      setOpenList(null);
      selectLoading.onTrue();
      await dispatch(select(current));
      selectLoading.onFalse();
    },
    [dispatch, selectLoading]
  );

  return (
    book &&
    article && (
      <>
        <Card sx={{ display: 'flex', p: 0, borderRadius: 0, position: 'relative' }}>
          {selectLoading.value && (
            <Box
              sx={{
                position: 'absolute',
                zIndex: 10,
                backgroundColor: '#ffffffc4',
                width: '100%',
                height: '100%',
                top: '0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <CircularProgress size={20} />
            </Box>
          )}
          <CardMedia
            component="img"
            sx={{ width: 60, height: 55, pl: 0.5, pr: 0.5 }}
            image={book.cover}
            alt=""
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              padding: '0 8px',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <Stack sx={{ width: '100%' }}>
              <Stack sx={{ p: 0 }}>
                <TinyText>
                  {book.label} - {moment(article.date).format('YYYY/MM/DD')}
                </TinyText>
                <Typography color="text.secondary" component="div">
                  {article.title}
                </Typography>
              </Stack>
            </Stack>
            <Stack
              sx={{ display: 'flex', flexDirection: 'row', p: 0, pl: 1, alignItems: 'center' }}
            >
              {!isPlay.value ? (
                <IconButton onClick={()=> {
                  router.push(`${paths.reading(article._id)}`);
                }}>
                  <Iconify icon="bi:play-fill" />
                </IconButton>
              ) : (
                <IconButton>
                  <Iconify icon="bi:pause-fill" />
                </IconButton>
              )}
              {false && (
                <IconButton>
                  <Iconify icon="fluent:next-16-filled" />
                </IconButton>
              )}
              <IconButton
                onClick={handleClickListItem}
                aria-label="more"
                aria-controls="lock-menu"
                aria-haspopup="true"
              >
                <Iconify icon="eva:more-vertical-fill" />
              </IconButton>
            </Stack>
          </Box>
        </Card>
        <Menu
          id="lock-menu"
          anchorEl={isOpenList}
          onClose={() => setOpenList(null)}
          open={Boolean(isOpenList)}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          slotProps={{
            paper: {
              sx: {
                width: '30ch',
                maxHeight: 48 * 4.5,
              },
            },
          }}
        >
          {list.map(
            (item) =>
              item && (
                <MenuItem
                  key={item._id}
                  onClick={() => selectItem(item)}
                  selected={item._id === selectedArticle._id}
                >
                  {moment(item.date).format('YYYY/MM/DD')} - {item.title}
                </MenuItem>
              )
          )}
        </Menu>
        <Drawer
          container={container}
          anchor="right"
          open={open}
          onClose={toggleDrawer(false)}
          // onOpen={toggleDrawer(true)}
          // disableSwipeToOpen={false}
          slotProps={{
            backdrop: { invisible: true },
          }}
          PaperProps={{
            sx: { width: '100%' },
          }}
          ModalProps={{
            keepMounted: true,
          }}
        >
          <StyledBox
            sx={{
              px: 2,
              pb: 2,
              height: '100vh',
              overflow: 'hidden',
            }}
          >
            <Header isOffset={isOffset} onClose={toggleDrawer(false)} />
            {/* <ScrollProgress
              scrollYProgress={scrollContainer.scrollYProgress}
              sx={{ position: 'unset', height: 6, background: 'black' }}
            /> */}

            <Box
              sx={{
                display: { lg: 'flex' },
                height: 'calc(100% - 64px)',
              }}
            >
              <Scrollbar ref={containerRef} sx={{ height: 'calc(100% - 24px)' }} className="book-scrollbar">
                {!selectLoading.value && (
                  <ArticleDetailsView
                    articleId={article._id}
                    onClose={() => {
                      setOpen(false);
                      dispatch(
                        getBooksWithCurrentUserBySummarize({
                          bookId: book._id,
                        })
                      );
                    }}
                  />
                )}
              </Scrollbar>
            </Box>
          </StyledBox>
        </Drawer>
      </>
    )
  );
}
