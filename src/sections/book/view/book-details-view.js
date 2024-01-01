import { useState, useEffect, useCallback } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { Divider, Stack, Backdrop, CircularProgress, Box } from '@mui/material';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// _mock
import { JOB_PUBLISH_OPTIONS } from 'src/_mock';
import { useAuthContext } from 'src/auth/hooks';
// components
import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';
//
import { bookService } from 'src/composables/context-provider';
// redux
import { useDispatch, useSelector } from 'src/redux/store';
import { getData, updateDataPublishedStatus } from 'src/redux/slices/book';
// sections
import { ArticleListView } from 'src/sections/article/view';
import _ from 'lodash';
import { useSnackbar } from 'src/components/snackbar';
import BookDetailsToolbar from '../book-details-toolbar';
import BookDetailsContent from '../book-details-content';
import BookDetailsCandidates from '../book-details-candidates';

// ----------------------------------------------------------------------

const JOB_DETAILS_TABS = [
  { value: 'content', label: '简介' },
  // { value: 'candidates', label: '参与者' },
  { value: 'chapter', label: '内容' },
];

export default function BookDetailsView() {
  const { enqueueSnackbar } = useSnackbar();
  const settings = useSettingsContext();
  const params = useParams();
  const { user } = useAuthContext();
  const { details } = useSelector((state) => state.book);
  const { id, tabId } = params;
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const dispatch = useDispatch();
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      await dispatch(
        getData({
          id,
          user,
        })
      );
      setLoading(false);
    } catch (error) {
      setLoading(false);
      enqueueSnackbar('获取数据失败,请联系管理员');
    }
  }, [dispatch, enqueueSnackbar, id, user]);

  const [publish, setPublish] = useState(details.byId[id]?.publish);

  const [currentTab, setCurrentTab] = useState(tabId || 'content');

  const handlePublish = useCallback(async () => {
    setButtonLoading(true);
    try {
      await bookService.publish({
        book_id: id,
      });
      dispatch(
        updateDataPublishedStatus({
          id,
          published: true,
        })
      );
      enqueueSnackbar('发布成功');
      setButtonLoading(false);
    } catch (e) {
      enqueueSnackbar('发布失败');
      setButtonLoading(false);
    }
  }, [dispatch, enqueueSnackbar, id]);

  const handleCancelPublish = useCallback(async () => {
    setButtonLoading(true);
    try {
      await bookService.unpublish({
        book_id: id,
      });
      dispatch(
        updateDataPublishedStatus({
          id,
          published: false,
        })
      );
      enqueueSnackbar('取消发布成功');
      setButtonLoading(false);
    } catch (e) {
      setButtonLoading(false);
      enqueueSnackbar('取消发布失败');
    }
  }, [dispatch, enqueueSnackbar, id]);

  useEffect(() => {
    if (id) {
      refresh(id);
    }
  }, [refresh, id]);

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const handleChangePublish = useCallback((newValue) => {
    setPublish(newValue);
  }, []);

  const renderTabs = (
    <Tabs
      value={currentTab}
      onChange={handleChangeTab}
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      {JOB_DETAILS_TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label}
          icon={
            tab.value === 'candidates' ? (
              <Label variant="filled">{details.byId[id]?.candidates?.length || 0}</Label>
            ) : (
              ''
            )
          }
        />
      ))}
    </Tabs>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      {/* <Backdrop
        sx={{ background: 'white', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop> */}
      <BookDetailsToolbar
        backLink={paths.dashboard.book.root}
        editLink={paths.dashboard.book.edit(`${details.byId[id]?._id}`)}
        liveLink="#"
        publish={publish || ''}
        onChangePublish={handleChangePublish}
        publishOptions={JOB_PUBLISH_OPTIONS}
      />
      {renderTabs}
      {!details.byId[id] ? (
        <Box
          sx={{
            zIndex: 10,
            backgroundColor: '#ffffffc4',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {currentTab === 'content' && <BookDetailsContent book={details.byId[id]} />}

          {currentTab === 'candidates' && (
            <BookDetailsCandidates candidates={details.byId[id]?.candidates} />
          )}
          {currentTab === 'chapter' && <ArticleListView book={details.byId[id]} />}
          <Divider sx={{ m: 2 }} />
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
            {details.byId[id].isAdmin && !details.byId[id].published && (
              <LoadingButton
                variant="contained"
                color="success"
                onClick={() => handlePublish()}
                loading={buttonLoading}
              >
                发布灵修
              </LoadingButton>
            )}
            {details.byId[id].isAdmin && details.byId[id].published && (
              <LoadingButton
                variant="contained"
                color="error"
                onClick={() => handleCancelPublish()}
                loading={buttonLoading}
              >
                取消发布
              </LoadingButton>
            )}
          </Stack>
        </>
      )}
    </Container>
  );
}
