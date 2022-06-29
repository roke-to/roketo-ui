import {createEffect, sample} from 'effector';
import {createGate} from 'effector-react';

export const blurGate = createGate({defaultState: false});

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
  clock: blurGate.state,
  target: setBlurFx,
});
