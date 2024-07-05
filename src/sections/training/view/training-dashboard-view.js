import { Helmet } from 'react-helmet-async';
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Markdown from 'src/components/markdown';
// components
import { Box, Button, Typography, Stack } from '@mui/material';
// import { Stack } from '@mui/system';
// routes
import { paths } from 'src/routes/paths';

import { useSettingsContext } from 'src/components/settings';
import { bookService, broadcastService, articleService } from 'src/composables/context-provider';
import { useSnackbar } from 'src/components/snackbar';

// ----------------------------------------------------------------------
export default function TrainingDashboardView() {
  const [article, setArticle] = useState(null);
  const [info, setInfo] = useState(null);
  const [articleUser, setArticleUser] = useState({});
  const { enqueueSnackbar } = useSnackbar();
  const { themeStretch } = useSettingsContext();
  const navigate = useNavigate();

  const getToday = useCallback(async () => {
    const bookArticle = await bookService.startWithCurrentUser();
    const getInfo = await broadcastService.getBook();
    if (getInfo) {
      setInfo(getInfo);
    }
    if (bookArticle) {
      const response = await articleService.getArticleCurrentUser({
        _id: bookArticle.article_id,
      });
      setArticleUser(response);
    }
  }, []);

  const onStart = async () => {
    const response = await bookService.startWithCurrentUser();
    if (response && response.article_id) {
      navigate(paths.reading(response.article_id));
    } else {
      enqueueSnackbar('今日没有阅读!');
    }
  };
  const onSignIn = async () => {
    if (articleUser.article_id) {
      // navigate(paths.reading(response.article_id));
      await bookService.signInWithCurrentUser({
        _id: articleUser.article_id,
      });
      const response = await articleService.getArticleCurrentUser({
        _id: articleUser.article_id,
      });
      setArticleUser(response);
    } else {
      enqueueSnackbar('今日没有阅读!');
    }
  };
  useEffect(() => {
    getToday();
  }, [getToday]);
  return (
    <>
      <Helmet>
        <title>TrainingDashboard: | 希望之家</title>
      </Helmet>
      <Stack
        direction="row"
        spacing={2}
        flexWrap="wrap"
        justifyContent="space-evenly"
        sx={{
          position: 'absolute',
          bottom: '55%',
          width: '100%',
          color: '#007B55',
        }}
      >
        {info && (
          <Box sx={{ margin: '15px', width: '100%' }}>
            <Markdown children={info.content} />
          </Box>
        )}

        {false && (
          <>
            <Box sx={{ margin: '15px', width: '100%' }}>
              <Typography align="left" variant="h5" gutterBottom>
                凡有爱心的，都是由神而生，并且认识神，没有爱心的，就不认识神，因为神就是爱。
              </Typography>
            </Box>
            <Box sx={{ margin: '0 15px', width: '100%' }}>
              <Typography align="right" variant="h5" gutterBottom>
                （约壹4：78）
              </Typography>
            </Box>
          </>
        )}
      </Stack>
      <Stack
        direction="row"
        spacing={2}
        flexWrap="wrap"
        justifyContent="space-evenly"
        style={{
          position: 'absolute',
          bottom: '10%',
          width: '100%',
        }}
      >
        <Button
          variant="soft"
          sx={{
            borderRadius: '5%',
            width: '100px',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={onStart}
        >
          <div
            style={{
              fontSize: '15px',
              fontWeight: '700',
            }}
          >
            今日阅读
          </div>
        </Button>

        {articleUser._id && !articleUser.signIn && (
          <Button
            variant="soft"
            color={articleUser.signIn ? 'success' : 'inherit'}
            sx={{
              borderRadius: '5%',
              width: '100px',
              padding: '15px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={onSignIn}
          >
            <div
              style={{
                fontSize: '15px',
                fontWeight: '700',
              }}
            >
              {articleUser.signIn ? '已签到' : '签到'}
            </div>
          </Button>
        )}

        <Button
          variant="soft"
          component={Link}
          to="/training"
          sx={{
            borderRadius: '5%',
            width: '100px',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: '15px',
              fontWeight: '700',
            }}
          >
            阅读进度
          </div>
        </Button>
      </Stack>
    </>
  );
}
