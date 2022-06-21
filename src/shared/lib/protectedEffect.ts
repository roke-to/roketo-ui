import {attach, Effect, Store} from 'effector';

export function createProtectedEffect<Src, Params, Result>({
  source,
  fn,
}: {
  source: Store<Src>;
  fn: (source: NonNullable<Src>, params: Params) => Promise<Result>;
}): Effect<Params, Result> {
  return attach({
    source,
    async effect(data, params: Params) {
      if (!data) throw Error('');
      return fn(data as NonNullable<Src>, params);
    },
  });
}
