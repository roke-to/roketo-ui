import React, { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

import { useRoketoContext } from 'app/roketo-context';
import { usersApiClient, useUser, User } from 'shared/api/roketo-web';

import { Button, ButtonType } from '@ui/components/Button';
import { Input } from '@ui/components/Input';
import {FormField} from '@ui/components/FormField';

import styles from './index.module.scss';

const NAME_INPUT = "nameInput";
const EMAIL_INPUT = "emailInput";

export function ProfileForm() {
  const { auth } = useRoketoContext();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isMutating, setIsMutating] = useState(false);

  const userSWR = useUser();

  useEffect(() => {
    setName(userSWR.data?.name ?? '');
    setEmail(userSWR.data?.email ?? '');
  }, [userSWR.data]);

  const formRef = useRef<HTMLFormElement | null>(null);

  const updateUser = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userSWR.data) {
      return;
    }

    setIsMutating(true);

    const newName = formRef.current?.[NAME_INPUT].value;
    const newEmail = formRef.current?.[EMAIL_INPUT].value;

    const cachedUser = userSWR.data;

    await userSWR.mutate(
      async () => {
        try {
          const updateUserDto = {
            name: newName,
            email: newEmail,
          };

          await usersApiClient.update(auth.accountId, updateUserDto);

          return Object.assign(new User(), cachedUser, updateUserDto);
        } catch (error) {
          return cachedUser;
        }
      },
      { revalidate: false, optimisticData: { ...userSWR.data, name: newName }, rollbackOnError: true }
    );

    setIsMutating(false);
  }, [auth.accountId, userSWR]);

  const busy = userSWR.isValidating || isMutating;

  return (
    <form
      className={classNames(styles.profileForm, busy && styles.busy)}
      onSubmit={updateUser}
      ref={formRef}
    >
      <FormField
        label='User name'
      >
        <Input
          placeholder="Name"
          name={NAME_INPUT}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={busy}
        />
      </FormField>

      <FormField
        label='Email'
        description='Email address is used for notifications'
      >
        <Input
          placeholder="Email"
          name={EMAIL_INPUT}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
        />
      </FormField>

      <Button
        type={ButtonType.submit}
        disabled={busy}
      >
        Save
      </Button>
    </form>
  );
}
