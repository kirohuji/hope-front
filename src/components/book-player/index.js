/* eslint-disable import/no-extraneous-dependencies */
import * as React from 'react';
import { createRef, useCallback, useState, useEffect } from 'react';
import { useOffSetTop } from 'src/hooks/use-off-set-top';
import { grey } from '@mui/material/colors';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Iconify from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import { useBoolean } from 'src/hooks/use-boolean';
import _ from 'lodash';
import { useDispatch, useSelector } from 'src/redux/store';
import { next, select } from 'src/redux/slices/trainning';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import moment from 'moment';
import { HEADER } from 'src/config-global';
import Header from './header';

function formatDuration(value) {
  const minute = Math.floor(value / 60);
  const secondLeft = Math.floor(value - minute * 60);
  return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
}

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
  const [isOpenList, setOpenList] = useState(null);
  const dispatch = useDispatch();
  const isPlay = useBoolean(false);
  const { book, article, list, selectedArticle } = useSelector((state) => state.trainning);
  const [open, setOpen] = useState(false);
  const isOffset = useOffSetTop(HEADER.H_MAIN_DESKTOP);
  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };
  const handleClickListItem = useCallback((event) => {
    setOpenList(event.currentTarget);
  }, []);
  const selectItem = useCallback(
    async (current) => {
      await dispatch(select(current));
      setOpenList(null);
    },
    [dispatch]
  );
  const container = window !== undefined ? () => window.document.body : undefined;
  return (
    book &&
    article && (
      <>
        <Card sx={{ display: 'flex', p: 0, borderRadius: 0, paddingBottom: '8px' }}>
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
                <IconButton onClick={toggleDrawer(true)}>
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
          {_.compact(list).length > 0 &&
            list.map((item) => (
              <MenuItem key={item._id} selected={item._id === selectedArticle._id}>
                <Box onClick={() => selectItem(item)}>
                  {moment(item.date).format('YYYY/MM/DD')} - {item.title}
                </Box>
              </MenuItem>
            ))}
        </Menu>
        <SwipeableDrawer
          container={container}
          anchor="bottom"
          open={open}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
          // swipeAreaWidth={drawerBleeding}
          disableSwipeToOpen={false}
          ModalProps={{
            keepMounted: true,
          }}
        >
          <StyledBox
            sx={{
              px: 2,
              pb: 2,
              height: '100vh',
              overflow: 'auto',
            }}
          >
            <Header isOffset={isOffset} onClose={toggleDrawer(false)} />
            <Box
              sx={{
                display: { lg: 'flex' },
                minHeight: { lg: 1 },
                height: 'calc(100% - 64px)',
              }}
            >
              1
            </Box>
          </StyledBox>
        </SwipeableDrawer>
      </>
    )
  );
}
