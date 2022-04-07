import React, { useCallback, useRef, useState } from 'react';
import classNames from 'classnames';

import { useRoketoContext } from 'app/roketo-context';
import { Input } from 'shared/kit/Input';
import { Button } from 'shared/kit/Button';
import { usersApiClient, useUser } from 'shared/api/roketo-web';

import styles from './index.module.scss';

const NAME_INPUT = "nameInput";
const EMAIL_INPUT = "emailInput";

export function ProfilePage() {
  const { auth } = useRoketoContext();

  const [isMutating, setIsMutating] = useState(false);

  const userSWR = useUser();

  const { name = '', email = '' } = userSWR.data ?? {};

  const formRef = useRef<HTMLFormElement | null>(null);

  const updateUser = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userSWR.data) {
      return;
    }

    setIsMutating(true);

    const newName = formRef.current?.[NAME_INPUT].value;
    const newEmail = formRef.current?.[EMAIL_INPUT].value;

    await userSWR.mutate(
      async () => usersApiClient.upsert(auth.accountId, {
        name: newName,
        email: newEmail,
      }),
      { revalidate: false, optimisticData: { ...userSWR.data, name: newName } }
    );

    setIsMutating(false);
  }, [auth.accountId, userSWR]);

  const busy = userSWR.isValidating || isMutating;

  return (
    <div className="container mx-auto p-12">
      <div className="md:flex justify-between items-center mb-10">
        <h1 className="text-3xl">Profile</h1>
      </div>

      <form className={classNames('inline-flex mb-10', busy && styles.profileFormBusy)} onSubmit={updateUser} ref={formRef}>
        <div className="mr-10">
          Name:
          <Input>
            <input
              key={name}
              placeholder="Name"
              name={NAME_INPUT}
              defaultValue={name}
              disabled={busy}
            />
          </Input>
        </div>
        <div className="mr-10">
          Email:
          <Input>
            <input
              key={email}
              placeholder="Email"
              name={EMAIL_INPUT}
              defaultValue={email}
              disabled={busy}
            />
          </Input>
        </div>
        <Button
          type="submit"
          disabled={busy}
          variant="main"
          size="normal"
          className="rounded-lg h-14 self-end mb-0.5"
        >
          Save
        </Button>
      </form>
    </div>
  );
}
