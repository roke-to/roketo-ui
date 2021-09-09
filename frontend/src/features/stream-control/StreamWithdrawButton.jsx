import {useSWRConfig} from 'swr';
import {useNear} from '../near-connect/useNear';
import {useStreamControl} from './useStreamControl';
import {Button} from '../../components/kit';

export function StreamWithdrawButton(props) {
  const near = useNear();
  const streamControl = useStreamControl();

  const {mutate} = useSWRConfig();

  async function updateAllAndWithdraw() {
    await streamControl.updateAllAndWithdraw();

    mutate(['account', near.near.accountId]);
  }

  return (
    <Button
      loadingText="Updating account..."
      {...props}
      loading={streamControl.loading}
      onClick={updateAllAndWithdraw}
    ></Button>
  );
}
