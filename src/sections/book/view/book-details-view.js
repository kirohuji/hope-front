import { useState, useEffect, useCallback } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// _mock
import { JOB_PUBLISH_OPTIONS } from 'src/_mock';
// components
import Label from 'src/components/label';
import { useSettingsContext } from 'src/components/settings';
//
import { bookService } from 'src/composables/context-provider';
// sections
import { ArticleListView } from 'src/sections/article/view';
import BookDetailsToolbar from '../book-details-toolbar';
import BookDetailsContent from '../book-details-content';
import BookDetailsCandidates from '../book-details-candidates';

// ----------------------------------------------------------------------

const JOB_DETAILS_TABS = [
  { value: 'content', label: '简介' },
  // { value: 'candidates', label: '参与者' },
  { value: 'chapter', label: '内容' },
];


export default function BookDetailsView () {
  const settings = useSettingsContext();
  const [book, setBook] = useState(null)
  const params = useParams();

  const { id, tabId } = params;

  const getData = useCallback(async () => {
    try {
      const response = await bookService.get({
        _id: id
      })
      setBook(response)
    } catch (error) {
      console.log(error)
    }
  }, [id, setBook])

  const [publish, setPublish] = useState(book?.publish);
  
  const [currentTab, setCurrentTab] = useState(tabId || 'content');

  useEffect(() => {
    if (id) {
      getData(id)
    }
  }, [getData, id]);

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
              <Label variant="filled">{book?.candidates?.length || 0}</Label>
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
      <BookDetailsToolbar
        backLink={paths.dashboard.book.root}
        editLink={paths.dashboard.book.edit(`${book?._id}`)}
        liveLink="#"
        publish={publish || ''}
        onChangePublish={handleChangePublish}
        publishOptions={JOB_PUBLISH_OPTIONS}
      />
      {renderTabs}

      {currentTab === 'content' && book && <BookDetailsContent book={book} />}

      {currentTab === 'candidates' && book && <BookDetailsCandidates candidates={book?.candidates} />}
      {currentTab === 'chapter' && book && <ArticleListView book={book} />}
    </Container>
  );
}
