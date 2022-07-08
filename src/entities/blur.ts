import {createEffect, createStore, Event, sample} from 'effector';
import {createGate} from 'effector-react';

export const blurGate = createGate({defaultState: {modalId: '', active: false}});

const $blurredModals = createStore<string[]>([]);

// @ts-expect-error Gate.set is not typed yet
const gateUpdated: Event<{modalId: string; active: boolean}> = blurGate.set;

const setBlurFx = createEffect((blur: boolean) => {
  const el = document.getElementById('root')!;
  if (blur) {
    el.classList.add('root-blur');
    document.body.classList.add('body-blur');
  } else {
    el.classList.remove('root-blur');
    document.body.classList.remove('body-blur');
  }
});

sample({
  clock: $blurredModals.map((ids) => ids.length > 0),
  target: setBlurFx,
});

$blurredModals.on([blurGate.open, gateUpdated], (ids, {modalId, active}) => {
  if (active) {
    if (ids.includes(modalId)) return ids;
    return [...ids, modalId];
  }
  return removeItem(ids, modalId);
});

$blurredModals.on(blurGate.close, (ids, {modalId}) => removeItem(ids, modalId));

function removeItem<T>(items: T[], item: T) {
  if (!items.includes(item)) return items;
  const result = [...items];
  result.splice(result.indexOf(item), 1);
  return result;
}
