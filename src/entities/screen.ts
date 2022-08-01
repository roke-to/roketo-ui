import {createEvent, createStore, sample} from 'effector';

const smallScreenMatcher = window.matchMedia('(max-width: 767px)');

const smallScreenMediaChanged = createEvent<boolean>();

export const $isSmallScreen = createStore(smallScreenMatcher.matches);

smallScreenMatcher.addEventListener('change', (ev) => {
  smallScreenMediaChanged(ev.matches);
});

sample({
  clock: smallScreenMediaChanged,
  target: $isSmallScreen,
});
