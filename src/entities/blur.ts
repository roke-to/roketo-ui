import {createEffect, sample} from 'effector';
import {createGate} from 'effector-react';

export const blurGate = createGate({defaultState: false});

const setBlurFx = createEffect((blur: boolean) => {
  const el = document.getElementById('root')!;
  if (blur) {
    el.dataset.blur = 'blur';
  } else {
    delete el.dataset.blur;
  }
});

sample({
  clock: blurGate.state,
  target: setBlurFx,
});
