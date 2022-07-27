import {useStore, useStoreMap} from 'effector-react';
import {useState} from 'react';

import {$accountId, $user} from '~/entities/wallet';

import {env} from '~/shared/config';

export function UserAvatar(props: {className?: string}) {
  const {className} = props;
  const [needFallback, setNeedFallback] = useState(false);
  const accountId = useStore($accountId);
  const email = useStoreMap($user, (user) => user.email ?? '');

  return needFallback || !accountId ? (
    <svg className={className} />
  ) : (
    <img
      className={className}
      src={`${env.WEB_API_URL}/users/${accountId}/avatar?email=${email}`}
      alt=""
      onError={() => setNeedFallback(true)}
    />
  );
}
