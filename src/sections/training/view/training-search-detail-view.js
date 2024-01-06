/* eslint-disable react/no-danger */
import {
  Box,
  Container,
  Divider,
  List,
  ListItemButton,
  Stack,
  ListItemIcon,
  ListItemText,
  Typography,
  ButtonGroup,
  Button,
  CircularProgress,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { Helmet } from 'react-helmet-async';
import Markdown from 'src/components/markdown';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import TrainingCard from 'src/sections/training/training-card';
import Iconify from 'src/components/iconify';
import { bookService } from 'src/composables/context-provider';
import { useSnackbar } from 'src/components/snackbar';
import { fDate } from 'src/utils/format-time';

export default function TrainingSearchDetailView() {
  const [book, setBook] = useState({});
  const [bookUser, setBookUser] = useState({});
  const [posts, setPosts] = useState([]);
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const getDetail = useCallback(
    async (flag = true) => {
      try {
        setIsLoading(flag);
        await Promise.all([
          bookService.get({ _id: id }),
          bookService.paginationWithArticleByBookId({
            book_id: id,
          }),
        ]).then(async ([bookData, postsData]) => {
          const bookUsers = await bookService.getBooksWithCurrentUser({
            book_id: bookData._id,
          });
          if (bookUsers.length) {
            setBookUser(bookUsers[0]);
          } else {
            setBookUser({});
          }
          setBook(bookData);
          setPosts(postsData);
          setIsLoading(false);
        });
      } catch (error) {
        enqueueSnackbar('获取信息失败,请重新打开');
        setIsLoading(false);
      }
    },
    [id, enqueueSnackbar]
  );

  useEffect(() => {
    if (id) {
      getDetail();
    }
  }, [getDetail, id]);

  const onActive = async () => {
    try {
      setButtonLoading(true);
      await bookService.addBookCurrentUser({
        book_id: id,
      });
      await bookService.activeBookWithCurrentUser({
        book_id: id,
      });
      const bookUsers = await bookService.getBooksWithCurrentUser({
        book_id: book._id,
      });
      if (bookUsers.length) {
        setBookUser(bookUsers[0]);
      } else {
        setBookUser({});
      }
      setButtonLoading(false);
      enqueueSnackbar('更新成功!');
    } catch (e) {
      setButtonLoading(false);
      enqueueSnackbar('更新失败!');
    }
  };
  const onDeactive = async () => {
    try {
      setButtonLoading(true);
      await bookService.deactiveBookWithCurrentUser({
        book_id: id,
      });
      const bookUsers = await bookService.getBooksWithCurrentUser({
        book_id: book._id,
      });
      if (bookUsers.length) {
        setBookUser(bookUsers[0]);
      } else {
        setBookUser({});
      }
      setButtonLoading(false);
      enqueueSnackbar('退出成功!');
    } catch (e) {
      setButtonLoading(false);
      enqueueSnackbar('退出阅读失败!');
    }
  };
  const onSelect = () => {
    bookService.addBookCurrentUser({
      book_id: id,
    });
    getDetail();
  };
  return (
    <>
      <Helmet>详情 | Hope Family</Helmet>
      <Container>
        {isLoading ? (
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
            <Box>
              <div style={{ display: 'flex' }}>
                <div style={{ width: '142px' }}>
                  <TrainingCard post={book} />
                </div>
                <div
                  style={{ margin: '15px 0px', width: 'calc(100% - 142px', position: 'relative' }}
                >
                  <Typography variant="h9" style={{ fontWeight: '700' }}>
                    {book.label}
                  </Typography>
                  <div
                    style={{ fontSize: '12px' }}
                  >{`发布者:  ${book.createdUser?.displayName}(${book.createdUser?.realName})`}</div>
                  <div style={{ fontSize: '12px' }}>{`发布时间:  ${fDate(book.updatedAt)}`}</div>
                  <LoadingButton
                    variant="soft"
                    loading={buttonLoading}
                    color={bookUser.currentStatus === 'active' ? 'error' : 'inherit'}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      borderRadius: '5%',
                      width: '150px',
                      padding: '8px',
                    }}
                    onClick={() =>
                      bookUser.currentStatus === 'active' ? onDeactive() : onActive()
                    }
                  >
                    <div
                      style={{
                        fontSize: '15px',
                        fontWeight: '700',
                      }}
                    >
                      {bookUser.currentStatus === 'active' ? '退出(正在阅读)' : '开始阅读'}
                    </div>
                  </LoadingButton>
                </div>
              </div>
              <Box sx={{ margin: '15px 0 15px 15px' }}>
                <Typography style={{ fontWeight: '700' }} variant="h9">
                  描述
                </Typography>
                <div
                  style={{ fontSize: '14px' }}
                  dangerouslySetInnerHTML={{ __html: book.description }}
                />
              </Box>
            </Box>
            <Divider />
            <Box sx={{ color: 'black', height: '90%' }}>
              <List>
                {!isLoading &&
                  posts.map(
                    (item, index) =>
                      item && (
                        <ListItemButton key={index}>
                          <ListItemText primary={`${item.title}`} secondary={item.title} />
                          {false && (
                            <>
                              <Iconify icon="ic:outline-remove-red-eye" width={22} />
                              <Iconify icon="ic:outline-more-vert" width={22} />
                            </>
                          )}
                        </ListItemButton>
                      )
                  )}
              </List>
            </Box>
            <Stack
              direction="row"
              flexWrap="wrap"
              justifyContent="space-evenly"
              style={{
                left: '-0px',
                position: 'absolute',
                bottom: '5%',
                width: '100%',
              }}
            >
              {/* <Button
            variant="soft"
            to="/training"
            sx={{
              borderRadius: '5%',
              width: '150px',
              padding: '8px',
            }}
            onClick={onSelect}
          >
            <div style={{
              fontSize: '15px',
              fontWeight: '700',
            }}>
              添加到列表
            </div>
          </Button> */}
            </Stack>
          </>
        )}
      </Container>
    </>
  );
}
