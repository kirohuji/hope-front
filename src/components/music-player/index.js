/* eslint-disable import/no-extraneous-dependencies */
import * as React from 'react';
import { createRef, useCallback, useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import AudioPlayer from 'react-audio-player';
import Stack from '@mui/material/Stack';
import Iconify from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import { useBoolean } from 'src/hooks/use-boolean';
import parse from 'id3-parser';
import { useDispatch, useSelector } from 'src/redux/store';
import { next, select, clean } from 'src/redux/slices/audio';
import { fetchFileAsBuffer } from 'id3-parser/lib/util';

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

export default function MusicPlayer() {
  const [isOpenList, setOpenList] = useState(null);
  const theme = useTheme();
  const dispatch = useDispatch();
  const isPlay = useBoolean(false);
  const player = createRef();
  const [tag, setTag] = useState(0);
  const [position, setPosition] = useState(0);
  const [image, setImage] = useState('');
  const [duration, setDuration] = useState(0);
  const [isStop, setIsStop] = useState(false);
  const { list, current } = useSelector((state) => state.audio);
  const selectLoading = useBoolean(true);

  const handleClickListItem = useCallback((event) => {
    setOpenList(event.currentTarget);
  }, []);

  const handlePlay = useCallback(
    async (audio) => {
      try {
        selectLoading.onTrue();
        const getTag = await fetchFileAsBuffer(audio.url).then(parse);
        setTag(getTag);
        setImage(
          URL.createObjectURL(new Blob([getTag?.image?.data]), { type: getTag?.image?.type })
        );
        selectLoading.onFalse();
        isPlay.onTrue();
        // player.current.audioEl.current.play();
        // setDuration(player.current.audioEl.current.duration);
      } catch (e) {
        console.log(e);
      }
    },
    [isPlay, selectLoading]
  );

  useEffect(() => {
    if (current) {
      const payerElement = player;
      if (payerElement.current) {
        payerElement.current.audioEl.current.pause(); // Pause the audio
      }
    }
    return () => {
      const payerElement = player;
      if (payerElement.current) {
        payerElement.current.audioEl.current.pause(); // Pause the audio
      }
      dispatch(clean());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const onSelect = (item) => {
    dispatch(select(item));
    setOpenList(null);
  };
  const onPlay = () => {
    if (player.current.audioEl.current.paused) {
      player.current.audioEl.current.play();
    }
  };
  const onPause = () => {
    if (!player.current.audioEl.current.paused) {
      player.current.audioEl.current.pause();
      isPlay.onFalse();
    }
  };

  return (
    current && (
      <>
        <AudioPlayer
          autoPlay
          onPlay={() => {
            handlePlay(current);
          }}
          onListen={(value) => {
            if (!isStop) {
              setPosition(value);
            }
          }}
          onPause={() => {
            isPlay.onFalse();
          }}
          listenInterval={1000}
          onEnded={() => {
            setPosition(0);
            isPlay.onFalse();
          }}
          ref={player}
          src={current.url}
        />
        <Card sx={{ display: 'flex', p: 0, borderRadius: 0 }}>
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
            sx={{ width: 80, height: 80, pl: 0.5, pr: 0.5 }}
            image={image}
            alt=""
          />
          <Box
            sx={{
              // padding: '0 8px',
              width: 'calc(100% - 80px)',
            }}
          >
            <Stack>
              <Stack sx={{ p: 1, pb: 0, pl: 0 }}>
                <Typography
                  component="div"
                  sx={{
                    fontSize: '14px',
                    whiteSpace: 'nowrap' /* 防止文本换行 */,
                    overflow: 'hidden' /* 隐藏溢出的文本 */,
                    textOverflow: 'ellipsis' /* 显示省略号 */,
                  }}
                >
                  {tag.title}
                </Typography>
                <Typography
                  color="text.secondary"
                  component="div"
                  sx={{
                    fontSize: '12px',
                    whiteSpace: 'nowrap' /* 防止文本换行 */,
                    overflow: 'hidden' /* 隐藏溢出的文本 */,
                    textOverflow: 'ellipsis' /* 显示省略号 */,
                  }}
                >
                  {tag.artist}
                </Typography>
              </Stack>
            </Stack>
            <Stack
              sx={{ display: 'flex', flexDirection: 'row', p: 0, pl: 1, alignItems: 'center' }}
            >
              <Stack sx={{ width: '100%' }}>
                <Slider
                  aria-label="time-indicator"
                  size="small"
                  value={position}
                  min={0}
                  step={1}
                  max={duration}
                  onChange={(_, value) => {
                    setIsStop(true);
                    setPosition(value);
                    player.current.audioEl.current.currentTime = value;
                    setIsStop(false);
                    onPlay();
                  }}
                  sx={{
                    color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.87)',
                    height: 3,
                    padding: '14px 0 !important',
                    '& .MuiSlider-thumb': {
                      width: 8,
                      height: 8,
                      transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                      '&:before': {
                        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
                      },
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: `0px 0px 0px 8px ${
                          theme.palette.mode === 'dark'
                            ? 'rgb(255 255 255 / 16%)'
                            : 'rgb(0 0 0 / 16%)'
                        }`,
                      },
                      '&.Mui-active': {
                        width: 20,
                        height: 20,
                      },
                    },
                    '& .MuiSlider-rail': {
                      opacity: 0.28,
                    },
                  }}
                />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mt: -2,
                  }}
                >
                  <TinyText>{formatDuration(position)}</TinyText>
                  <TinyText>-{formatDuration(duration - position)}</TinyText>
                </Box>
              </Stack>
              {!isPlay.value ? (
                <IconButton onClick={onPlay}>
                  <Iconify icon="bi:play-fill" />
                </IconButton>
              ) : (
                <IconButton onClick={onPause}>
                  <Iconify icon="bi:pause-fill" />
                </IconButton>
              )}
              <IconButton
                onClick={() => {
                  onPause();
                  setPosition(0);
                  dispatch(next());
                }}
              >
                <Iconify icon="fluent:next-16-filled" />
              </IconButton>
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
                width: '35ch',
                maxHeight: 48 * 4.5,
              },
            },
          }}
        >
          {list.map((item) => (
            <MenuItem
              key={item._id}
              selected={item._id === current._id}
              onClick={() => onSelect(item)}
            >
              <Typography
                component="span"
                sx={{
                  whiteSpace: 'nowrap' /* 防止文本换行 */,
                  overflow: 'hidden' /* 隐藏溢出的文本 */,
                  textOverflow: 'ellipsis' /* 显示省略号 */,
                }}
              >
                {item.label}
              </Typography>
            </MenuItem>
          ))}
        </Menu>
      </>
    )
  );
}
