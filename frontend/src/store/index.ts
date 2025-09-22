// Simple store placeholder - we'll implement Redux later
export const store = {
  getState: () => ({}),
  dispatch: () => {},
  subscribe: () => () => {},
};

export type RootState = {};
export type AppDispatch = typeof store.dispatch;