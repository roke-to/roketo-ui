import type {Store} from 'effector';
import {useStore} from 'effector-react';

export function filler<T, Props extends {[key: string]: any}>({
  source,
  view: View,
  placeholder: Placeholder,
}: {
  source: Store<T | null>;
  view: (props: Props & {data: T}) => JSX.Element;
  placeholder: (props: Props) => JSX.Element;
}) {
  return function Filler(props: Props) {
    const data = useStore(source);
    return data === null ? <Placeholder {...props} /> : <View {...props} data={data} />;
  };
}
