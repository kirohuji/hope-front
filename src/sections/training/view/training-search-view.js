/* eslint-disable react/no-danger */
import { Box, Container, Divider, Stack, Tab, Tabs, Typography } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types';

// form
import { useForm } from 'react-hook-form';

import { useNavigate } from "react-router-dom";
import TrainingCard from 'src/sections/training/training-card'
// routes
import { paths } from 'src/routes/paths';
// sections
import Search from 'src/sections/training/search'
import Label from "src/components/label";

import { bookService } from 'src/composables/context-provider';

const TABS = [
  {
    value: 'one',
    label: '每日灵修',
  },
  // {
  //   value: 'two',
  //   label: 'Item Two',
  // },
  // {
  //   value: 'three',
  //   label: 'Item Three',
  // }
];

const TAGS = [
  { value: 'children', label: '儿童' },
  { value: 'adolescent', label: '青少年' },
  { value: 'adult', label: '成人' },
  { value: 'newBelievers', label: '初信' },
];

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}
TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default function TrainingSearchPage() {
  const navigate = useNavigate();
  const [scrollable, setScrollable] = useState('one');
  const [tableData, setTableData] = useState([]);
  const [currentTag, setCurrentTag] = useState({
    value: '',
    label: ''
  });
  const getBooks = useCallback(async () => {
    try {
      const response = await bookService.pagination({
        type: currentTag.value
      });
      setTableData(response.data)
    } catch (error) {
      // setLoadingPost(false);
      // setErrorMsg(error.message);
    }
  }, [setTableData, currentTag])

  useEffect(() => {
    getBooks()
  }, [getBooks]);


  const onDetail = (post) => {
    console.log(post)
    navigate(paths.training.searchDetail(post._id));
  }
  return (
    <>
      <Helmet>搜索 | Hope Family</Helmet>
      <Container>
        {
          false && <Stack
            spacing={2}
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Search />

          </Stack>
        }
        <Box>
          <Tabs value={scrollable} onChange={(event, newValue) => setScrollable(newValue)}>
            {TABS.map((tab) => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </Tabs>
        </Box>
        <TabPanel value={scrollable} index="one" key={0}>
          <Box style={{
            display: "flex",
            justifyContent: "space-between",
            margin: '16px  0'
          }}>
            {TAGS.map((tag) => (
              <Label
                onClick={() => setCurrentTag(tag)}
                sx={{
                  backgroundColor: tag.value === currentTag.value ? "black" : "white",
                  color: tag.value === currentTag.value ? "white" : "black",
                }}
                // color={tag.value === currentTag.value ? 'light' : 'default'}
                style={{ width: '70px' }}
                key={tag.value}
                value={tag.value}>
                {tag.label}
              </Label>
            ))}
          </Box>
          <Divider />
          {tableData.map((post, index) =>
            <Box style={{ display: 'flex' }} key={index} onClick={() => onDetail(post)}>
              <div style={{ width: '142px' }}>
                <TrainingCard post={post} index={index} />
              </div>
              <div style={{ margin: "15px 0px", width: 'calc(100% - 142px' }}>
                <Typography variant="h9" style={{ fontWeight: '700' }}>{post.label}</Typography>
                <div style={{ fontSize: '12px' }} dangerouslySetInnerHTML={{ __html: post.description }} />
              </div>
            </Box>
          )}

        </TabPanel>
      </Container>
    </>
  )
}