import PropTypes from 'prop-types';
import { useState, useCallback, useEffect } from 'react';
// @mui
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
// hooks
import { useDispatch, useSelector } from 'src/redux/store';
import { useDebounce } from 'src/hooks/use-debounce';
// components
import ChatNavItem from 'src/sections/chat/chat-nav-item';
import Scrollbar from 'src/components/scrollbar';

import { getOrganizations, getOrganizationsOnlyChildren } from 'src/redux/slices/chat';
import _ from 'lodash';
import SearchNotFound from 'src/components/search-not-found';

const ISCHILDRENONLY = true;
export default function ChatOrganization({
  cascadeCheck = false,
  handleSelectContact,
  searchQuery,
  handleSelectCascadeContacts,
  checkeds = [],
  isMulti,
}) {
  const debouncedFilters = useDebounce(searchQuery);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);

  const { active } = useSelector((state) => state.scope);

  const [currentOrganization, setCurrentOrganization] = useState([]);

  const [currentFirstOrganization, setCurrentFirstOrganization] = useState([]);

  const [levels, setLevels] = useState([
    {
      name: '佳麦',
      to: active?._id,
    },
  ]);
  const notFound = debouncedFilters && !currentOrganization.length;

  const onRefreshWithOrganization = useCallback(
    async (query) => {
      if (active?._id) {
        setLoading(true);
        const organizationData = await dispatch(
          getOrganizationsOnlyChildren(active?._id, active?._id, query)
        );
        setCurrentFirstOrganization(organizationData);
        setCurrentOrganization(organizationData);
        setLoading(false);
      }
    },
    [active?._id, dispatch]
  );

  const onChildren = async (organization) => {
    let selectedOrganization = null;
    if (
      (!ISCHILDRENONLY && organization.children && organization.children.length > 0) ||
      organization.users
    ) {
      selectedOrganization = organization;
    } else if (active?._id) {
      setLoading(true);
      const organizationData = await dispatch(
        getOrganizationsOnlyChildren(active?._id, organization._id)
      );
      selectedOrganization = {
        ...organization,
        ...organizationData,
      };
      setLoading(false);
    }
    const level = {
      name: selectedOrganization.label,
      to: selectedOrganization._id,
    };
    levels.push(level);
    setCurrentOrganization(
      _.compact([
        ...(selectedOrganization.children || []),
        ...(selectedOrganization.users || []).map((item) => ({
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
  };
  const renderOrganizationsMenuItem = (organization, id) => (
    <ChatNavItem
      cascadeCheck={cascadeCheck}
      key={id}
      onSelect={() => handleSelectContact && handleSelectContact(organization)}
      onSelectCascadeCheck={() =>
        handleSelectCascadeContacts && handleSelectCascadeContacts(organization)
      }
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

  // 调用后端接口,需要进行重构
  const onGoTo = async (level) => {
    let index = 0;
    const length = _.findIndex(levels, ['to', level.to]);
    let isChildren = false;
    let currentOrganizations = currentFirstOrganization;
    const levels2 = [];
    while (index <= length) {
      isChildren = true;
      const currentLevel = levels[index];
      index += 1;
      currentOrganizations = _.find(currentOrganizations, ['_id', currentLevel.to]);
      levels2.push(currentLevel);
    }
    setLevels(levels2);
    if (isChildren) {
      let selectedOrganization = null;
      const organizationData = await dispatch(getOrganizationsOnlyChildren(active?._id, level.to));
      selectedOrganization = {
        ...currentOrganizations,
        ...organizationData,
      };
      console.log(active._id);
      if (level.to === active._id) {
        setCurrentOrganization(_.compact(organizationData));
      } else {
        setCurrentOrganization(
          _.compact([
            ...(selectedOrganization.children || []),
            ...(selectedOrganization.users || []).map((item) => ({
              name: item.username,
              photoURL: item.photoURL,
              _id: item._id,
              email: item.email,
              displayName: item.displayName,
              realName: item.realName,
            })),
          ])
        );
      }
    } else {
      await setCurrentOrganization(currentOrganizations);
    }
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
      {loading ? (
        <div
          style={{
            display: 'flex',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          加载中...
        </div>
      ) : (
        currentOrganization.map((item, i) => renderOrganizationsMenuItem(item, i))
      )}
    </Scrollbar>
  );

  useEffect(() => {
    onRefreshWithOrganization(debouncedFilters);
  }, [onRefreshWithOrganization, debouncedFilters]);

  return notFound ? <SearchNotFound query={searchQuery} sx={{ py: 10 }} /> : renderOrganizations;
}

ChatOrganization.propTypes = {
  cascadeCheck: PropTypes.bool,
  checkeds: PropTypes.array,
  searchQuery: PropTypes.any,
  handleSelectContact: PropTypes.func,
  handleSelectCascadeContacts: PropTypes.func,
  isMulti: PropTypes.bool,
};
