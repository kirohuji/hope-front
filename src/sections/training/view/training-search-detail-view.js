import { Box, Container, Divider, List, ListItemAvatar, ListItemButton, Avatar, ListItemIcon, ListItemText, Typography, ButtonGroup, Button } from "@mui/material"
import { Helmet } from "react-helmet-async"
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import TrainingCard from 'src/sections/training/training-card'
import Iconify from 'src/components/iconify'
import { bookService } from 'src/composables/context-provider';
import TrainingCardData from './Untitled-1.json'

export default function TrainingSearchDetailView () {
  const [book, setBook] = useState({});
  const [posts, setPosts] = useState([]);
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const getDetail = useCallback(async () => {
    try {
      await Promise.all([bookService.get({ _id: id }), bookService.paginationWithPostsByBookId({
        selector: {
          book_id: id
        }
      })]).then(([bookData, postsData]) => {
        setBook(bookData);
        setPosts(postsData.data);
        setIsLoading(false);
      })
    } catch (error) {
      // setLoadingPost(false);
      // setErrorMsg(error.message);
      console.log(error)
    }
  }, [id, setBook, setPosts, setIsLoading])

  useEffect(() => {
    if (id) {
      getDetail();
    } else {
      setIsLoading(false);
    }
  }, [getDetail, id])
  const onActive=async ()=>{
    await bookService.addBookCurrentUser({
      book_id: id
    });
    await bookService.activeBookWithCurrentUser({
      book_id: id
    });
  }
  const onSelect=()=>{
    bookService.addBookCurrentUser({
      book_id: id
    });
  }
  return (
    <>
      <Helmet>详情 | Hope Family</Helmet>
      <Container>
        <Box>
          <div style={{ display: 'flex' }}>
            <div style={{ width: '142px' }}>
              <TrainingCard post={TrainingCardData.posts[0]} />
            </div>
            <div style={{ margin: "15px 0px", width: 'calc(100% - 142px' }}>
              <Typography variant="h9" style={{ fontWeight: '700' }}>{book.label}</Typography>
            </div>
          </div>
          <div style={{ fontSize: '12px', margin: '15px' }}>
            {book.description}
          </div>
        </Box>
        <div style={{
          display: 'flex',
          justifyContent: 'space-evenly'
        }}>
          <Button variant="text" onClick={()=> onActive()}>选择为当前</Button>
          <Button variant="text"  onClick={()=> onSelect()}>添加到列表</Button>
        </div>
        <Divider />
        <Box sx={{ margin: '15px 0', color: 'black' }}>
          <List>
            {
              !isLoading && posts.map((item, index) => <ListItemButton key={index}>
                <ListItemText primary={item.title} secondary={item.title} />
                <Iconify icon="ic:outline-remove-red-eye" width={22} />
                <Iconify icon="ic:outline-more-vert" width={22} />
              </ListItemButton>)
            }
          </List>
        </Box>
      </Container>
    </>
  )
}