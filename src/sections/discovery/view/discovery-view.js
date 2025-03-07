import { useSettingsContext } from 'src/components/settings';
import { useState, useCallback, useEffect } from 'react';
import { Container, Stack, Divider, Tabs, Tab } from '@mui/material';
import { useSelector } from 'src/redux/store';
import { useSnackbar } from 'src/components/snackbar';
import InfiniteScroll from 'react-infinite-scroller';
import { postService } from 'src/composables/context-provider';
import Scrollbar from 'src/components/scrollbar';
import { _ecommerceNewProducts } from 'src/_mock';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hook';
// auth
import { useAuthContext } from 'src/auth/hooks';
import DiscoveryPostItem from '../discovery-post-item';
import DiscoveryKanban from '../discovery-kanban';

const TABS = [
  { value: 'Offcial', label: '社区' },
  { value: 'Following', label: '你的关注' },
  { value: 'Recommendation', label: '为你推荐' },
];

export default function DiscoveryView() {
  const { enqueueSnackbar } = useSnackbar();

  const { themeStretch } = useSettingsContext();

  const router = useRouter();

  const scope = useSelector((state) => state.scope);

  const { user, logout } = useAuthContext();

  const [currentTab, setCurrentTab] = useState('Offcial');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true); // 控制是否继续加载
  const [total, setTotal] = useState(0);

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

  const refresh = useCallback(
    async () => {
      if (loading) return; // 防止并发加载

      setLoading(true);

      try {
        const response = await postService.pagination(
          { scope: scope.active._id },
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

  return (
    <Container maxWidth={themeStretch ? false : 'xl'}>
      <Tabs value={currentTab} onChange={handleChangeTab}>
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.label} value={tab.value} />
        ))}
      </Tabs>
      <Divider />
      <Stack spacing={3} sx={{ mt: 1 }}>
        <Scrollbar sx={{ p: 0, pb: 2, height: 'calc(100vh - 120px)' }}>
          {currentTab === 'Offcial' && <DiscoveryKanban list={_ecommerceNewProducts} />}
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
                onClick={() => handleClickPost(post)}
              />
            ))}
          </InfiniteScroll>
        </Scrollbar>
      </Stack>
    </Container>
  );
}
