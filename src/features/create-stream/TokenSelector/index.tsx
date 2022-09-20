import type {RichToken} from '@roketo/sdk/dist/types';
import cn from 'classnames';
import {useStore} from 'effector-react';
import {FieldInputProps, FormikState} from 'formik';
import React, {useState} from 'react';

import {$fts, $listedTokens, $tokens} from '~/entities/wallet';

import {Balance, DisplayMode} from '~/shared/components/Balance';
import {DropdownMenu} from '~/shared/kit/DropdownMenu';
import {DropdownOpener} from '~/shared/kit/DropdownOpener';
import {TokenImage} from '~/shared/kit/TokenImage';

import {FormField} from '@ui/components/FormField';

import styles from './styles.module.scss';

type TokenSelectorProps = {
  activeTokenAccountId: string;
  onTokenChoose: (tokenAccountId: string) => void;

  label?: React.ReactNode;
  description?: React.ReactNode;

  field: FieldInputProps<any>;
  form: FormikState<any>;

  isRequired?: boolean;
  className?: string;
};

const TokenOption = ({
  token,
  onClick,
  className,
  isActive,
}: {
  token: RichToken;
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}) => {
  const classNames = cn(styles.tokenOption, className);

  const content = (
    <>
      <TokenImage tokenAccountId={token.roketoMeta.account_id} />
      <div className={cn(styles.tokenWrap, isActive ? styles.tokenActive : '')}>
        <span className={cn(styles.tokenName)}>{`${token.meta.symbol}`}</span>
        <Balance
          className={cn(styles.tokenBalance, isActive ? styles.tokenActive : '')}
          tokenAccountId={token.tokenContract.contractId}
          isShort
          mode={DisplayMode.CRYPTO}
        />
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={classNames} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <div className={classNames}>{content}</div>;
};

export const TokenSelector = (props: TokenSelectorProps) => {
  const {
    form,
    label,
    field,
    className,
    isRequired,
    description,
    onTokenChoose,
    activeTokenAccountId,
  } = props;

  const fts = useStore($fts);
  const allTokens = useStore($tokens);
  const listedTokens = useStore($listedTokens);

  const tokens = fts
    ? (() => {
        const ftsSet = new Set(fts);

        return Object.fromEntries(Object.entries(allTokens).filter(([ft]) => ftsSet.has(ft)));
      })()
    : listedTokens;

  const [isDropdownOpened, setIsDropdownOpened] = useState(false);

  const allAvailableTokens = Object.values(tokens);
  const activeToken = tokens[activeTokenAccountId];
  if (!activeToken) return null;

  const handleChooseTokenOptions = (token: RichToken) => {
    setIsDropdownOpened(false);

    onTokenChoose(token.roketoMeta.account_id);
  };

  const error = form.errors[field.name];

  return (
    <FormField
      isRequired={isRequired}
      className={className}
      description={description}
      label={label}
      error={error}
    >
      <div className={styles.dropdownWrapper}>
        <DropdownOpener
          onChange={setIsDropdownOpened}
          className={styles.dropdownOpener}
          opened={isDropdownOpened}
        >
          <TokenOption token={activeToken} />
        </DropdownOpener>

        <DropdownMenu
          opened={isDropdownOpened}
          onClose={() => setIsDropdownOpened(false)}
          className={styles.dropdownMenu}
        >
          {allAvailableTokens.map((token) => (
            <TokenOption
              key={token.meta.name}
              token={token}
              onClick={() => handleChooseTokenOptions(token)}
              className={styles.withHover}
              isActive={token.tokenContract.contractId === activeTokenAccountId}
            />
          ))}
        </DropdownMenu>
      </div>
    </FormField>
  );
};
