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
import { useParams } from 'src/routes/hook';
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
  const { themeStretch } = useSettingsContext();
  const scope = useSelector((state) => state.scope);

  const { user } = useAuthContext();

  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(
    async () => {
      setLoading(true);
      try {
        const response = await postService.get({ scope: scope.active._id, _id: id });
        setPost(response);
      } catch (e) {
        enqueueSnackbar(e.message);
      } finally {
        setLoading(false);
      }
    },
    [enqueueSnackbar, id, scope.active._id, setPost] // 注意：去掉 loading 作为依赖
  );

  useEffect(() => {
    console.log('获取');
    if (id) {
      refresh();
    }
  }, [refresh, id]);
  return (
    <Container maxWidth={false}>
      <Scrollbar sx={{ p: 0, pb: 2, height: 'calc(100vh - 120px)' }}>
        {post && <DiscoveryPostDetailItem post={post} user={user} />}
      </Scrollbar>
    </Container>
  );
}
