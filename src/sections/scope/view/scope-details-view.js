import { useState, useEffect, useCallback } from 'react';
// @mui
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Container from '@mui/material/Container';
// routes
import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hook';
// components
import Label from 'src/components/label';
import { useSnackbar } from 'src/components/snackbar';
import { useSettingsContext } from 'src/components/settings';
//
import { scopeService } from 'src/composables/context-provider';
import ScopeDetailsToolbar from '../scope-details-toolbar';
import ScopeDetailsContent from '../scope-details-content';
// ----------------------------------------------------------------------

const SCOPE_DETAILS_TABS = [{ value: 'content', label: '简介' }];

export default function ScopeDetailsView() {
  const { enqueueSnackbar } = useSnackbar();

  const settings = useSettingsContext();

  const params = useParams();

  const { id } = params;

  const [currentScope, setCurrentScope] = useState(null);

  const getData = useCallback(async () => {
    try {
      const response = await scopeService.get({
        _id: id,
      });
      setCurrentScope(response);
    } catch (error) {
      enqueueSnackbar(error.message);
    }
  }, [id, setCurrentScope, enqueueSnackbar]);

  useEffect(() => {
    getData();
  }, [getData]);

  const [currentTab, setCurrentTab] = useState('content');

  const handleChangeTab = useCallback((event, newValue) => {
    setCurrentTab(newValue);
  }, []);

  const renderTabs = (
    <Tabs
      value={currentTab}
      onChange={handleChangeTab}
      sx={{
        mb: { xs: 3, md: 5 },
      }}
    >
      {SCOPE_DETAILS_TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label}
          icon={
            tab.value === 'candidates' ? (
              <Label variant="filled">{currentScope?.candidates?.length}</Label>
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
      <ScopeDetailsToolbar
        backLink={paths.dashboard.scope.root}
        editLink={paths.dashboard.scope.edit(`${currentScope?._id}`)}
      />
      {renderTabs}

      {currentTab === 'content' && currentScope && <ScopeDetailsContent scope={currentScope} />}
    </Container>
  );
}
