import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
// hooks
import { useDispatch, useSelector } from 'src/redux/store';
// components
import ChatNavItem from 'src/sections/chat/chat-nav-item';
import Scrollbar from 'src/components/scrollbar';

import { getOrganizations } from 'src/redux/slices/chat';
import _ from 'lodash';

export default function ChatOrganization({ handleSelectContact, checkeds = [], isMulti }) {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);

  const [levels, setLevels] = useState([]);

  const { active } = useSelector((state) => state.scope);

  const [currentOrganization, setCurrentOrganization] = useState([]);

  const [currentFirstOrganization, setCurrentFirstOrganization] = useState([]);

  const onRefreshWithOrganization = useCallback(async () => {
    if (active?._id) {
      setLoading(true);
      const organizationData = await dispatch(getOrganizations(active?._id));
      setCurrentFirstOrganization(organizationData);
      setCurrentOrganization(organizationData);
      setLoading(false);
    }
  }, [active?._id, dispatch]);

  const onChildren = (organization) => {
    if (organization.children || organization.users) {
      const level = {
        name: organization.label,
        to: organization._id,
      };
      levels.push(level);
      setCurrentOrganization(
        _.compact([
          ...(organization.children || []),
          ...(organization.users || []).map((item) => ({
            name: item.username,
            photoURL: item.photoURL,
            _id: item._id,
            email: item.email,
            displayName: item.displayName,
            realName: item.realName,
          })),
        ])
      );
      setLevels(levels);
      console.log('currentOrganization', currentOrganization);
    }
  };
  const renderOrganizationsMenuItem = (organization, id) => (
    <ChatNavItem
      key={id}
      onSelect={() => handleSelectContact && handleSelectContact(organization)}
      checked={checkeds.includes(organization._id) > 0}
      onChildren={onChildren}
      conversation={organization}
      multi={isMulti}
      sx={{ height: 'unset' }}
    />
  );

  const styles = {
    typography: 'body2',
    alignItems: 'center',
    color: 'text.primary',
    display: 'inline-flex',
  };

  const onGoTo = async (level) => {
    let index = 0;
    const length = _.findIndex(levels, ['to', level.to]);
    let isChildren = false;
    let currentOrganizations = currentFirstOrganization;
    const levels2 = [];
    while (index < length) {
      isChildren = true;
      const currentLevel = levels[index];
      currentOrganizations = _.find(currentOrganizations, ['_id', currentLevel.to]);
      index += 1;
      levels2.push(currentLevel);
    }
    if (isChildren) {
      await setCurrentOrganization([
        ...currentOrganizations.children,
        ...currentOrganizations.users.map((item) => ({
          _id: item._id,
          name: item.username,
          photoURL: item.photoURL,
          email: item.email,
          displayName: item.displayName,
          realName: item.realName,
        })),
      ]);
    } else {
      await setCurrentOrganization(currentOrganizations);
    }
    setLevels(levels2);
  };

  const renderOrganizations = (
    <Scrollbar sx={{ height: '100%', ml: 1, mr: 1 }}>
      {levels && levels.length > 0 && (
        <Stack direction="row" alignItems="center" justifyContent="flex-start" sx={{ m: 1 }}>
          {levels.map((level, index) => (
            <Box key={index} sx={{ display: 'flex' }}>
              <Link onClick={() => onGoTo(level)} sx={styles}>
                {`${level.name}`}{' '}
              </Link>
              <div style={{ margin: '0 4px' }}> /</div>
            </Box>
          ))}
        </Stack>
      )}
      {currentOrganization.map((item, i) => renderOrganizationsMenuItem(item, i))}
    </Scrollbar>
  );

  useEffect(() => {
    if (loading) {
      onRefreshWithOrganization();
    }
  }, [loading, onRefreshWithOrganization]);

  return renderOrganizations;
}

ChatOrganization.propTypes = {
  checkeds: PropTypes.array,
  handleSelectContact: PropTypes.func,
  isMulti: PropTypes.bool,
};
