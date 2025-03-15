import PropTypes from 'prop-types';
import { useState, useRef, useCallback, useEffect } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Markdown from 'src/components/markdown';
import IconButton from '@mui/material/IconButton';
import Scrollbar from 'src/components/scrollbar';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { useSnackbar } from 'src/components/snackbar';
import InfiniteScroll from 'react-infinite-scroller';
import { postService } from 'src/composables/context-provider';
import FormControlLabel from '@mui/material/FormControlLabel';
import AvatarGroup, { avatarGroupClasses } from '@mui/material/AvatarGroup';

// hooks
import { useMockedUser } from 'src/hooks/use-mocked-user';
// utils
import { fDate } from 'src/utils/format-time';
import { fShortenNumber } from 'src/utils/format-number';
// components
import Image from 'src/components/image';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function DiscoveryPostDetailItem({ post, user, notify }) {
  const { poster } = post;

  const { enqueueSnackbar } = useSnackbar();

  const commentRef = useRef(null);

  const fileRef = useRef(null);

  const [message, setMessage] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [hasMore, setHasMore] = useState(true); // 控制是否继续加载
  const [total, setTotal] = useState(0);

  const handleChangeMessage = useCallback((event) => {
    setMessage(event.target.value);
  }, []);

  const handleAttach = useCallback(() => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  }, []);

  const refreshCurrent = useCallback(async () => {
    const response = await postService.comments(
      { linkedObjectId: post._id, userId: user._id },
      {
        skip: 0,
        sort: { createdAt: -1 },
        limit: 1,
      }
    );
    setComments((prev) => [...response.data, ...prev]);
  }, [post._id, user._id]);

  useEffect(() => {
    if (notify > 0) {
      refreshCurrent();
    }
  }, [notify, refreshCurrent]);

  const refresh = useCallback(
    async () => {
      if (loading) return; // 防止并发加载

      setLoading(true);

      try {
        const response = await postService.comments(
          { linkedObjectId: post._id },
          {
            skip: page * 20,
            limit: 20,
          }
        );

        if (response.data.length === 0) {
          setHasMore(false); // 没有数据了，停止加载
        } else if (total > response.total) {
          setHasMore(false); // 不是满页，表示没有更多数据了
        } else {
          setHasMore(true); // 还有数据
        }

        setComments((prev) => (page === 0 ? response.data : [...prev, ...response.data]));
        setTotal((prev) => prev + response.data.length);
        setPage((prev) => prev + 1);
      } catch (e) {
        enqueueSnackbar(e.message);
        setHasMore(false); // 避免错误导致无限加载
      } finally {
        setLoading(false);
      }
    },
    [enqueueSnackbar, loading, page, post._id, total] // 注意：去掉 loading 作为依赖
  );

  const renderHead = (
    <CardHeader
      disableTypography
      sx={{ p: 1 }}
      avatar={<Avatar src={poster?.photoURL} alt={poster?.displayName} />}
      title={
        <Link color="inherit" variant="subtitle1">
          {poster?.displayName}
        </Link>
      }
      subheader={
        <Box sx={{ color: 'text.disabled', typography: 'caption', mt: 0.5 }}>
          {fDate(post.publishedAt || post.createdAt)}
        </Box>
      }
      action={
        <IconButton>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      }
    />
  );

  const renderCommentList = (
    <Stack spacing={1} sx={{ px: 1, pb: 1 }}>
      {comments &&
        comments.map((comment) => (
          <Stack key={comment._id} direction="row" spacing={1}>
            <Avatar alt={comment.author.username} src={comment.author.photoURL} />

            <Paper
              sx={{
                p: 1,
                flexGrow: 1,
                bgcolor: 'background.neutral',
              }}
            >
              <Stack
                sx={{ mb: 0.5 }}
                alignItems={{ sm: 'center' }}
                justifyContent="space-between"
                direction={{ xs: 'column', sm: 'row' }}
              >
                <Box sx={{ typography: 'subtitle2' }}>{comment.author.username}</Box>

                <Box sx={{ typography: 'caption', color: 'text.disabled' }}>
                  {fDate(comment.createdAt)}
                </Box>
              </Stack>

              <Box sx={{ typography: 'body2', color: 'text.secondary' }}>{comment.body}</Box>
            </Paper>
          </Stack>
        ))}
    </Stack>
  );

  const renderActions = (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        p: (theme) => theme.spacing(2, 3, 3, 3),
      }}
    >
      {/* <FormControlLabel
        control={
          <Checkbox
            defaultChecked
            color="error"
            icon={<Iconify icon="solar:heart-bold" />}
            checkedIcon={<Iconify icon="solar:heart-bold" />}
          />
        }
        label={fShortenNumber(post.likeCount)}
        sx={{ mr: 1 }}
      /> */}
      <Stack direction="row" sx={{ fontSize: '12px', color: 'text.secondary' }}>
        <Box sx={{ mr: 2 }}>{post.likeCount} 赞同</Box>
        <Box>{post.commentCount} 评论</Box>
      </Stack>

      {/* {!!post.personLikes.length && (
        <AvatarGroup
          sx={{
            [`& .${avatarGroupClasses.avatar}`]: {
              width: 32,
              height: 32,
            },
          }}
        >
          {post.personLikes.map((person) => (
            <Avatar key={person.name} alt={person.name} src={person.avatarUrl} />
          ))}
        </AvatarGroup>
      )} */}

      {/* <Box sx={{ flexGrow: 1 }} />

      <IconButton onClick={handleClickComment}>
        <Iconify icon="solar:chat-round-dots-bold" />
      </IconButton>

      <IconButton>
        <Iconify icon="solar:share-bold" />
      </IconButton> */}
    </Stack>
  );

  return (
    <Stack
      sx={{
        // height: 1,
        // overflow: 'hidden',
        position: 'relative',
      }}
    >
      {renderHead}

      {/* <Typography
        variant="body2"
        sx={{
          p: (theme) => theme.spacing(3, 3, 2, 3),
        }}
      >
        <Markdown children={post.body} />
      </Typography> */}
      <Markdown
        sx={{
          p: (theme) => theme.spacing(3, 3, 2, 3),
        }}
        children={post.body}
      />

      <Box sx={{ p: 1 }}>
        <Image alt={post.cover} src={post.cover} ratio="16/9" sx={{ borderRadius: 1.5 }} />
      </Box>

      {renderActions}

      <Scrollbar sx={{ p: 0, pb: 2, maxHeight: '100vh' }}>
        <InfiniteScroll
          loadMore={refresh}
          hasMore={hasMore}
          useWindow={false}
          style={{
            marginTop: '16px',
          }}
          loader={<div key={0}>加载中 ...</div>}
        >
          {renderCommentList}
        </InfiniteScroll>
      </Scrollbar>
    </Stack>
  );
}

DiscoveryPostDetailItem.propTypes = {
  post: PropTypes.object,
  user: PropTypes.object,
  notify: PropTypes.number,
};
