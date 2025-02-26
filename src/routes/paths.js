// utils
import { paramCase } from 'src/utils/change-case';
import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];

const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: '/auth',
  AUTH_DEMO: '/auth-demo',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  reading: (id) => `/reading/${id}`,
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page403: '/403',
  page404: '/404',
  page500: '/500',
  components: '/components',
  docs: 'https://docs.minimals.cc',
  changelog: 'https://docs.minimals.cc/changelog',
  zoneUI: 'https://mui.com/store/items/zone-landing-page/',
  minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  freeUI: 'https://mui.com/store/items/minimal-dashboard-free/',
  figma:
    'https://www.figma.com/file/kAYnYYdib0aQPNKZpgJT6J/%5BPreview%5D-Minimal-Web.v5.0.0?type=design&node-id=0%3A1&t=Al4jScQq97Aly0Mn-1',
  product: {
    root: `/product`,
    checkout: `/product/checkout`,
    details: (id) => `/product/${id}`,
    demo: {
      details: `/product/${MOCK_ID}`,
    },
  },
  post: {
    root: `/post`,
    details: (title) => `/post/${paramCase(title)}`,
    demo: {
      details: `/post/${paramCase(MOCK_TITLE)}`,
    },
  },
  // AUTH
  auth: {
    amplify: {
      login: `${ROOTS.AUTH}/amplify/login`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      register: `${ROOTS.AUTH}/amplify/register`,
      newPassword: `${ROOTS.AUTH}/amplify/new-password`,
      forgotPassword: `${ROOTS.AUTH}/amplify/forgot-password`,
    },
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
    },
    firebase: {
      login: `${ROOTS.AUTH}/firebase/login`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      register: `${ROOTS.AUTH}/firebase/register`,
      forgotPassword: `${ROOTS.AUTH}/firebase/forgot-password`,
    },
    auth0: {
      login: `${ROOTS.AUTH}/auth0/login`,
    },
  },
  chat: '/chat',
  // openai: '/openai',
  training: {
    root: `/training`,
    dashboard: `${ROOTS.DASHBOARD}/training/dashboard`,
    search: `$/training/search`,
    searchDetail: (id) => `/training/search/detail/${id}`,
    detail: `/training/detail/`,
  },
  user: {
    account: `/account`,
  },
  authDemo: {
    classic: {
      login: `${ROOTS.AUTH_DEMO}/classic/login`,
      register: `${ROOTS.AUTH_DEMO}/classic/register`,
      forgotPassword: `${ROOTS.AUTH_DEMO}/classic/forgot-password`,
      newPassword: `${ROOTS.AUTH_DEMO}/classic/new-password`,
      verify: `${ROOTS.AUTH_DEMO}/classic/verify`,
    },
    modern: {
      login: `${ROOTS.AUTH_DEMO}/modern/login`,
      register: `${ROOTS.AUTH_DEMO}/modern/register`,
      forgotPassword: `${ROOTS.AUTH_DEMO}/modern/forgot-password`,
      newPassword: `${ROOTS.AUTH_DEMO}/modern/new-password`,
      verify: `${ROOTS.AUTH_DEMO}/modern/verify`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    mail: `${ROOTS.DASHBOARD}/mail`,
    openai: `${ROOTS.DASHBOARD}/openai`,
    chat: `${ROOTS.DASHBOARD}/chat`,
    blank: `${ROOTS.DASHBOARD}/blank`,
    kanban: `${ROOTS.DASHBOARD}/kanban`,
    calendar: `${ROOTS.DASHBOARD}/calendar`,
    fileManager: `${ROOTS.DASHBOARD}/file-manager`,
    permission: `${ROOTS.DASHBOARD}/permission`,
    general: {
      app: `${ROOTS.DASHBOARD}/app`,
      ecommerce: `${ROOTS.DASHBOARD}/ecommerce`,
      analytics: `${ROOTS.DASHBOARD}/analytics`,
      banking: `${ROOTS.DASHBOARD}/banking`,
      booking: `${ROOTS.DASHBOARD}/booking`,
      file: `${ROOTS.DASHBOARD}/file`,
    },
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      cards: `${ROOTS.DASHBOARD}/user/cards`,
      profile: `${ROOTS.DASHBOARD}/user/profile`,
      account: `${ROOTS.DASHBOARD}/user/account`,
      organization: `${ROOTS.DASHBOARD}/user/organization`,
      permission: `${ROOTS.DASHBOARD}/user/permission`,
      edit: (id) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/user/${MOCK_ID}/edit`,
      },
    },
    product: {
      root: `${ROOTS.DASHBOARD}/product`,
      new: `${ROOTS.DASHBOARD}/product/new`,
      details: (id) => `${ROOTS.DASHBOARD}/product/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/product/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/product/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/product/${MOCK_ID}/edit`,
      },
    },
    invoice: {
      root: `${ROOTS.DASHBOARD}/invoice`,
      new: `${ROOTS.DASHBOARD}/invoice/new`,
      details: (id) => `${ROOTS.DASHBOARD}/invoice/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/invoice/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}/edit`,
      },
    },
    post: {
      root: `${ROOTS.DASHBOARD}/post`,
      new: `${ROOTS.DASHBOARD}/post/new`,
      details: (title) => `${ROOTS.DASHBOARD}/post/${paramCase(title)}`,
      edit: (title) => `${ROOTS.DASHBOARD}/post/${paramCase(title)}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/post/${paramCase(MOCK_TITLE)}`,
        edit: `${ROOTS.DASHBOARD}/post/${paramCase(MOCK_TITLE)}/edit`,
      },
    },
    order: {
      root: `${ROOTS.DASHBOARD}/order`,
      details: (id) => `${ROOTS.DASHBOARD}/order/${id}`,
      demo: {
        details: `${ROOTS.DASHBOARD}/order/${MOCK_ID}`,
      },
    },
    job: {
      root: `${ROOTS.DASHBOARD}/job`,
      new: `${ROOTS.DASHBOARD}/job/new`,
      details: (id) => `${ROOTS.DASHBOARD}/job/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/job/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/job/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/job/${MOCK_ID}/edit`,
      },
    },
    scope: {
      root: `${ROOTS.DASHBOARD}/scope`,
      new: `${ROOTS.DASHBOARD}/scope/new`,
      details: (id) => `${ROOTS.DASHBOARD}/scope/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/scope/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/job/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/job/${MOCK_ID}/edit`,
      },
    },
    version: {
      root: `${ROOTS.DASHBOARD}/version`,
      new: (id) => `${ROOTS.DASHBOARD}/version/${id}/new`,
      newMajor: `${ROOTS.DASHBOARD}/version/major/new`,
      details: {
        root: (id) => `${ROOTS.DASHBOARD}/version/${id}`,
        tab: (id, tabId) => `${ROOTS.DASHBOARD}/version/${id}/tab/${tabId}`,
      },
      edit: (id) => `${ROOTS.DASHBOARD}/version/${id}/edit`,
      editMajor: (id) => `${ROOTS.DASHBOARD}/version/major/${id}/edit`,
    },
    book: {
      root: `${ROOTS.DASHBOARD}/book`,
      new: `${ROOTS.DASHBOARD}/book/new`,
      details: {
        root: (id) => `${ROOTS.DASHBOARD}/book/${id}`,
        tab: (id, tabId) => `${ROOTS.DASHBOARD}/book/${id}/tab/${tabId}`,
      },
      edit: (id) => `${ROOTS.DASHBOARD}/book/${id}/edit`,
      article: {
        new: (id) => `${ROOTS.DASHBOARD}/book/${id}/article/new`,
        edit: (id, articleId) => `${ROOTS.DASHBOARD}/book/${id}/article/${articleId}/edit`,
      },
      demo: {
        details: `${ROOTS.DASHBOARD}/book/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/book/${MOCK_ID}/edit`,
      },
    },
    article: {
      root: `${ROOTS.DASHBOARD}/article`,
      new: `${ROOTS.DASHBOARD}/article/new`,
      details: (id) => `${ROOTS.DASHBOARD}/article/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/article/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/article/${paramCase(MOCK_TITLE)}`,
        edit: `${ROOTS.DASHBOARD}/article/${paramCase(MOCK_TITLE)}/edit`,
      },
    },
    access: {
      root: `${ROOTS.DASHBOARD}/access`,
    },
    dictionary: {
      root: `${ROOTS.DASHBOARD}/dictionary`,
    },
    tour: {
      root: `${ROOTS.DASHBOARD}/tour`,
      new: `${ROOTS.DASHBOARD}/tour/new`,
      details: (id) => `${ROOTS.DASHBOARD}/tour/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/tour/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}/edit`,
      },
    },
    audit: {
      root: `${ROOTS.DASHBOARD}/audit`,
    },
    bpmn: `${ROOTS.DASHBOARD}/bpmn`,
    broadcast: {
      root: `${ROOTS.DASHBOARD}/broadcast`,
      new: `${ROOTS.DASHBOARD}/broadcast/new`,
      details: (id) => `${ROOTS.DASHBOARD}/broadcast/${id}`,
      edit: (id) => `${ROOTS.DASHBOARD}/broadcast/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/broadcast/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/broadcast/${MOCK_ID}/edit`,
      },
    },
  },
};
