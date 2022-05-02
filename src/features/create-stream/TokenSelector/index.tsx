import React, {useState} from 'react';
import {FieldInputProps, FormikState} from 'formik';
import cn from 'classnames';

import {FormField} from '@ui/components/FormField';

import type {RichToken} from 'shared/api/ft';

import {DropdownOpener} from 'shared/kit/DropdownOpener';
import {DropdownMenu} from 'shared/kit/DropdownMenu';
import {TokenImage} from 'shared/kit/TokenImage';

import {useRoketoContext} from 'app/roketo-context';

import styles from './styles.module.scss';

type TokenSelectorProps = {
  activeTokenAccountId: string,
  onTokenChoose: (tokenAccountId: string) => void,

  label?: React.ReactNode,
  description?: React.ReactNode,

  field: FieldInputProps<any>,
  form: FormikState<any>,

  isRequired?: boolean,
  className?: string;
};

const TokenOption = ({
  token,
  onClick,
  className,
}: {token: RichToken, className?: string, onClick?: () => void}) => (
  <button type='button' className={cn(styles.tokenOption, className)} onClick={onClick}>
    <TokenImage
      tokenAccountId={token.roketoMeta.account_id}
    />
    <span>{`${token.meta.name}, ${token.meta.symbol}`}</span>
  </button>
);

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

  const {tokens} = useRoketoContext();

  const [isDropdownOpened, setIsDropdownOpened] = useState(false);

  const allAvailableTokens = Object.values(tokens);
  const activeToken = tokens[activeTokenAccountId];

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
          {allAvailableTokens.map(token => (
            <TokenOption
              token={token}
              onClick={() => handleChooseTokenOptions(token)}
              className={styles.withHover}
            />
          ))}
        </DropdownMenu>
      </div>
    </FormField>
  );
};