import {useStore} from 'effector-react';
import {useEffect, useRef, useState} from 'react';

import {$user, updateUserFx} from '~/entities/wallet';

import {Button, ButtonType} from '@ui/components/Button';
import {FormField} from '@ui/components/FormField';
import {Input} from '@ui/components/Input';
import {Spinner} from '@ui/components/Spinner';

import styles from './index.module.scss';

const NAME_INPUT = 'nameInput';
const EMAIL_INPUT = 'emailInput';

export function ProfileForm() {
  const user = useStore($user);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const isMutating = useStore(updateUserFx.pending);

  useEffect(() => {
    setName(user.name ?? '');
    setEmail(user.email ?? '');
  }, [user]);

  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <>
      <form
        className={styles.profileForm}
        onSubmit={(e) => {
          e.preventDefault();
          updateUserFx({
            name: formRef.current?.[NAME_INPUT].value,
            email: formRef.current?.[EMAIL_INPUT].value,
          });
        }}
        ref={formRef}
      >
        <FormField label="User name">
          <Input
            placeholder="Name"
            name={NAME_INPUT}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isMutating}
          />
        </FormField>

        <FormField label="Email" description="Email address is used for notifications">
          <Input
            placeholder="Email"
            name={EMAIL_INPUT}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isMutating}
          />
        </FormField>

        <Button type={ButtonType.submit} disabled={isMutating}>
          Save
        </Button>
      </form>
      {isMutating && <Spinner wrapperClassName={styles.loaderWrapper} />}
    </>
  );
}
