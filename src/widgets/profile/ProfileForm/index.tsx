import classNames from 'classnames';
import {useStore} from 'effector-react';
import {useEffect, useRef, useState} from 'react';

import {$user, updateUserFx} from '~/entities/wallet';

import {Button, ButtonType} from '@ui/components/Button';
import {Checkbox} from '@ui/components/Checkbox';
import {FormField} from '@ui/components/FormField';
import {Input} from '@ui/components/Input';
import {Spinner} from '@ui/components/Spinner';

import styles from './index.module.scss';

export function ProfileForm() {
  const user = useStore($user);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [allowNotifications, setAllowNotifications] = useState(false);
  const isMutating = useStore(updateUserFx.pending);

  useEffect(() => {
    setName(user.name ?? '');
    setEmail(user.email ?? '');
    setIsEmailVerified(user.isEmailVerified ?? false);
    setAllowNotifications(user.allowNotifications ?? false);
  }, [user]);

  const formRef = useRef<HTMLFormElement | null>(null);

  const changes =
    name !== user.name || email !== user.email || allowNotifications !== user.allowNotifications;

  return (
    <>
      <form
        className={styles.profileForm}
        onSubmit={(e) => {
          e.preventDefault();
          updateUserFx({
            name,
            email,
            allowNotifications,
          });
        }}
        ref={formRef}
      >
        <FormField label="User name">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isMutating}
          />
        </FormField>

        <FormField
          label="Email"
          rightLabel={
            email &&
            email === user.email && (
              <span className={isEmailVerified ? styles.green : styles.red}>
                {isEmailVerified ? 'verified' : 'unverified'}
              </span>
            )
          }
        >
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isMutating}
          />
        </FormField>

        <Checkbox
          description="Receive notifications"
          checked={allowNotifications}
          onChange={(e) => setAllowNotifications(e.target.checked)}
          disabled={!email || isMutating}
        />

        <Button
          className={classNames((isMutating || !changes) && styles.buttonDisabled)}
          type={ButtonType.submit}
          disabled={isMutating || !changes}
        >
          Save
        </Button>
      </form>
      {isMutating && <Spinner wrapperClassName={styles.loaderWrapper} />}
    </>
  );
}
