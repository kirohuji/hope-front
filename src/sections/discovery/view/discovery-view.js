import { useSettingsContext } from 'src/components/settings';
import { useState, useCallback, useEffect } from 'react';
import { Container, Stack, Divider, Tabs, Tab } from '@mui/material';
import { useSelector } from 'src/redux/store';
import { useSnackbar } from 'src/components/snackbar';
import MenuItem from '@mui/material/MenuItem';
import InfiniteScroll from 'react-infinite-scroller';
import { postService, broadcastService } from 'src/composables/context-provider';
import Scrollbar from 'src/components/scrollbar';
// import { _ecommerceNewProducts } from 'src/_mock';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import Iconify from 'src/components/iconify';
import Restricted from 'src/auth/guard/restricted';
import emitter from "src/utils/eventEmitter";
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// auth
import { useAuthContext } from 'src/auth/hooks';
import ConfirmDialog from 'src/components/confirm-dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DiscoveryPostItem from '../discovery-post-item';
import DiscoveryKanban from '../discovery-kanban';

const TABS = [
  { value: 'Offcial', label: '社区活动' },
  // { value: 'Following', label: '你的关注' },
  // { value: 'Recommendation', label: '最近的发生' },
];

export default function DiscoveryView() {
  const { enqueueSnackbar } = useSnackbar();

  const popover = usePopover();

  const [openConfirm, setOpenConfirm] = useState(false);

  const { themeStretch } = useSettingsContext();

  const router = useRouter();

  const scope = useSelector((state) => state.scope);

  const [buttonLoading, setButtonLoading] = useState(false);

  const { user, logout } = useAuthContext();

  const [broadcasts, setBroadcasts] = useState([]);
  const [currentTab, setCurrentTab] = useState('Offcial');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [hasMore, setHasMore] = useState(true); // 控制是否继续加载
  const [total, setTotal] = useState(0);

  const handleOpenConfirm = useCallback(() => {
    setOpenConfirm(true);
  }, []);

  const handleCloseConfirm = useCallback(() => {
    setOpenConfirm(false);
  }, []);

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
    setPage(0);
    setPosts([]); // 切换 Tab 时清空数据
    setHasMore(true);
  }, []);

  const handleClickPost = useCallback(
    (post) => {
      router.push(paths.dashboard.discovery.details(post._id));
    },
    [router]
  );

  const handleSetting = useCallback(
    (e, selectedPost) => {
      console.log('打开');
      setCurrentPost(selectedPost);
      // handleOpenConfirm()
      popover.onOpen(e)
    },
    [popover]
  );


  const refresh = useCallback(
    async () => {
      console.log('刷新')
      if (loading) return; // 防止并发加载

      setLoading(true);

      try {
        const response = await postService.pagination(
          { scope: scope.active._id, status: "published" },
          {
            skip: page * 10,
            limit: 10,
          }
        );

        if (response.data.length === 0) {
          setHasMore(false); // 没有数据了，停止加载
        } else if (total > response.total) {
          setHasMore(false); // 不是满页，表示没有更多数据了
        } else {
          setHasMore(true); // 还有数据
        }

        setPosts((prev) => (page === 0 ? response.data : [...prev, ...response.data]));
        setTotal((prev) => prev + response.data.length);
        setPage((prev) => prev + 1);
      } catch (e) {
        enqueueSnackbar(e.message);
        setHasMore(false); // 避免错误导致无限加载
      } finally {
        setLoading(false);
      }
    },
    [enqueueSnackbar, loading, page, scope.active._id, total] // 注意：去掉 loading 作为依赖
  );

  const filterData = useCallback(() => {
    if (currentPost) {
      setPosts((prev) => prev.filter(post => post._id !== currentPost._id))
    }
    refresh()
  }, [currentPost, refresh])

  const handleDelete = useCallback(async () => {
    try {
      setButtonLoading(true);
      await postService.delete({
        _id: currentPost?._id,
      });
      filterData()
      enqueueSnackbar('删除成功');
      setButtonLoading(false);
      handleCloseConfirm();
    } catch (e) {
      enqueueSnackbar('删除失败');
      setButtonLoading(false);
    }
  }, [currentPost, enqueueSnackbar, filterData, handleCloseConfirm]);


  const getBroadcasts = useCallback(async () => {
    try {
      const response = await broadcastService.recent();
      setBroadcasts(response);
    } catch (e) {
      enqueueSnackbar(e.message);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    getBroadcasts();
    emitter.on("refreshBroadcastsMessage", filterData);
    return () => {
      emitter.off("refreshBroadcastsMessage", filterData);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getBroadcasts]);

  return (
    <Container maxWidth={themeStretch ? false : 'xl'}>
      <Tabs value={currentTab} onChange={handleChangeTab}>
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>
      <Divider />
      <Stack spacing={3} sx={{ mt: 1 }}>
        <Scrollbar sx={{ p: 0, pb: 2, height: 'calc(100% - 120px)' }}>
          {currentTab === 'Offcial' && <DiscoveryKanban list={broadcasts} />}
          <InfiniteScroll
            loadMore={refresh}
            hasMore={hasMore}
            useWindow={false}
            style={{
              marginTop: '16px',
            }}
            loader={<div key={0}>加载中 ...</div>}
          >
            {posts.map((post) => (
              <DiscoveryPostItem
                key={post._id}
                post={post}
                user={user}
                onSetting={(e) => handleSetting(e, post)}
                onClick={() => handleClickPost(post)}
              />
            ))}
          </InfiniteScroll>
        </Scrollbar>
      </Stack>
      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <Restricted to={['BroadcastListDelete']}>
          <MenuItem
            onClick={() => {
              popover.onClose();
              handleOpenConfirm();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            删除
          </MenuItem>
        </Restricted>
      </CustomPopover>
      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="删除"
        content="你确定删除吗?"
        action={
          <LoadingButton variant="contained" color="error" onClick={()=> handleDelete()} loading={buttonLoading}>
            删除
          </LoadingButton>
        }
      />
    </Container>
  );
}
