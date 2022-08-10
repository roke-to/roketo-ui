import classNames from 'classnames';
import {useStore} from 'effector-react';
import {useEffect, useRef, useState} from 'react';

import {FinancialActivity} from '~/widgets/header/ui/FinancialActivity';
import {InfoIcon} from '~/widgets/profile/ProfileForm/InfoIcon';
import {UserAvatar} from '~/widgets/profile/UserAvatar';

import {$user, logoutFx, resendVerificationEmailFx, updateUserFx} from '~/entities/wallet';

import {Button, ButtonType} from '@ui/components/Button';
import {Checkbox} from '@ui/components/Checkbox';
import {FormField} from '@ui/components/FormField';
import {Input} from '@ui/components/Input';
import {Spinner} from '@ui/components/Spinner';
import {LogoutIcon} from '@ui/icons/LogOut';

import styles from './index.module.scss';

interface ProfileFormProps {
  showFinances?: boolean;
}

export function ProfileForm({showFinances}: ProfileFormProps) {
  const user = useStore($user);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [allowNotifications, setAllowNotifications] = useState(false);
  const isUserUpdating = useStore(updateUserFx.pending);
  const isEmailBeingResent = useStore(resendVerificationEmailFx.pending);
  const [resentVerificationEmail, setResentVerificationEmail] = useState(false);

  const isMutating = isUserUpdating || isEmailBeingResent;

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
          // TODO: do not use fx, rewrite to event ex.: `userFormChanged`
          updateUserFx({
            name,
            email,
            allowNotifications,
          });
        }}
        ref={formRef}
      >
        <Button onClick={() => logoutFx()} className={styles.logout}>
          <LogoutIcon />
          <span>Log Out</span>
        </Button>
        <UserAvatar className={styles.avatar} />

        {showFinances && <FinancialActivity className={styles.finances} />}

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
        {email && email === user.email && !isEmailVerified && (
          <div className={styles.resend}>
            <InfoIcon className={styles.infoIcon} />
            <div>
              <span>
                If you can't find a verification link in your mailbox, please check "Spam" folder
                {!resentVerificationEmail && (
                  <span>
                    {' '}
                    or{' '}
                    <button
                      type="button"
                      className={styles.resendButton}
                      onClick={() => {
                        setResentVerificationEmail(true);
                        // TODO: Rewrite to `resendVerificationEmailButtonPressed` event. Do not use effects directly
                        resendVerificationEmailFx();
                      }}
                    >
                      resend a verification email
                    </button>
                  </span>
                )}
                .
              </span>
            </div>
          </div>
        )}

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
