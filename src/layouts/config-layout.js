// ----------------------------------------------------------------------

export const HEADER = {
  H_MOBILE: 64,
  H_DESKTOP: 80,
  H_DESKTOP_OFFSET: 80 - 16,
};

export const NAV = {
  W_VERTICAL: 280,
  W_MINI: 88,
};

export const SAFE_AREA = {
  TOP: ['constant(safe-area-inset-top)', 'env(safe-area-inset-top)'],
  BOTTOM: ['constant(safe-area-inset-bottom)', 'env(safe-area-inset-bottom)'],
  LEFT: ['constant(safe-area-inset-left)', 'env(safe-area-inset-left)'],
  RIGHT: ['constant(safe-area-inset-right)', 'env(safe-area-inset-right)'],
};
