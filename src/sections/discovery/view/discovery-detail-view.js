import { useSettingsContext } from 'src/components/settings';
import { useState, useCallback, useRef, useEffect } from 'react';
// @mui
import { alpha } from '@mui/material/styles';
import { Container, Stack, Divider, Tabs, Tab } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';

import { useSelector } from 'src/redux/store';
import { useSnackbar } from 'src/components/snackbar';
import { postService } from 'src/composables/context-provider';
// compoennts
import Scrollbar from 'src/components/scrollbar';
import Iconify from 'src/components/iconify';
// routes
import { paths } from 'src/routes/paths';
import { useParams, useRouter } from 'src/routes/hook';
import { RouterLink } from 'src/routes/components';
// auth
import { useAuthContext } from 'src/auth/hooks';
import DiscoveryPostDetailItem from '../discovery-post-detail-item';
import DiscoveryKanban from '../discovery-kanban';

const TABS = [
  { value: 'Offcial', label: '社区' },
  { value: 'Following', label: '你的关注' },
  { value: 'Recommendation', label: '为你推荐' },
];

export default function DiscoveryDetailView() {
  const { enqueueSnackbar } = useSnackbar();
  const params = useParams();
  const { id, selectedTab } = params;
  const [post, setPost] = useState(null);
  const [notify, setNotify] = useState(0);
  const { themeStretch } = useSettingsContext();
  const [sendingType, setSendingType] = useState('send');
  const scope = useSelector((state) => state.scope);

  const { user } = useAuthContext();

  const [isLike, setLike] = useState(false);

  const [message, setMessage] = useState('');

  const commentRef = useRef(null);

  const fileRef = useRef(null);

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleAttach = useCallback(() => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  }, []);

  const handleChangeMessage = useCallback((event) => {
    setMessage(event.target.value);
  }, []);

  const handleLike = useCallback(
    async (like) => {
      try {
        if (like) {
          await postService.like(post);
          setLike(true);
          setPost((prev) => ({ ...prev, likeCount: prev.likeCount + 1 }));
        } else {
          await postService.unLike(post);
          setLike(false);
          setPost((prev) => ({ ...prev, likeCount: prev.likeCount - 1 }));
        }
      } catch (e) {
        enqueueSnackbar(e.message);
      }
    },
    [enqueueSnackbar, post]
  );

  const refresh = useCallback(
    async () => {
      setLoading(true);
      try {
        const response = await postService.get({ scope: scope.active._id, _id: id });
        const like = await postService.isLike({ _id: response._id });
        setPost(response);
        setLike(!!like);
      } catch (e) {
        enqueueSnackbar(e.message);
      } finally {
        setLoading(false);
      }
    },
    [enqueueSnackbar, id, scope.active._id, setPost] // 注意：去掉 loading 作为依赖
  );

  const handleSendMessage = useCallback(
    async (event) => {
      try {
        if (event.key === 'Enter') {
          if (message && message !== '\n') {
            try {
              await postService.addComment({
                linkedObjectId: id,
                body: message,
              });
              setNotify((prev) => prev + 1);
              setPost((prev) => ({ ...prev, commentCount: prev.commentCount + 1 }));
              enqueueSnackbar('发送成功');
            } catch (e) {
              enqueueSnackbar(e.message);
            } finally {
              setMessage('');
              setSendingType('send');
            }
          } else {
            setMessage('');
            setSendingType('send');
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    [message, id, enqueueSnackbar]
  );

  const handleDelete = useCallback(() => {
    // 删除后返回上一页
    router.back();
  }, [router]);

  const renderInput = (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        // p: (theme) => theme.spacing(0, 3, 3, 3),
        p: 0,
        pl: 1,
        pr: 1,
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '45px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* <Avatar src={user?.photoURL} alt={user?.displayName} /> */}

      <InputBase
        fullWidth
        value={message}
        inputProps={{ enterKeyHint: sendingType }}
        inputRef={commentRef}
        placeholder="请输入内容"
        onKeyUp={handleSendMessage}
        onChange={handleChangeMessage}
        // endAdornment={
        //   <InputAdornment position="end" sx={{ mr: 1 }}>
        //     <IconButton size="small" onClick={handleAttach}>
        //       <Iconify icon="solar:gallery-add-bold" />
        //     </IconButton>

        //     <IconButton size="small">
        //       <Iconify icon="eva:smiling-face-fill" />
        //     </IconButton>
        //   </InputAdornment>
        // }
        sx={{
          pl: 1.5,
          height: 40,
          // borderRadius: 1,
          borderTop: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.32)}`,
        }}
      />

      <input type="file" ref={fileRef} style={{ display: 'none' }} />
    </Stack>
  );

  useEffect(() => {
    if (id) {
      refresh();
    }
  }, [refresh, id]);
  return (
    <Container maxWidth={false} sx={{ position: 'relative' }}>
      <Scrollbar sx={{ p: 0, height: 'calc(100vh - 120px)' }}>
        {post && (
          <DiscoveryPostDetailItem
            post={post}
            user={user}
            notify={notify}
            isLike={isLike}
            onLike={handleLike}
            onDelete={handleDelete}
          />
        )}
      </Scrollbar>
      {renderInput}
    </Container>
  );
}
