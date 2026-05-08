// React glue for Store: useStore() forces re-render on change.
// Components can call window.Store.actions.* to mutate.
window.useStore = function () {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => window.Store.subscribe(force), []);
  return window.Store;
};
