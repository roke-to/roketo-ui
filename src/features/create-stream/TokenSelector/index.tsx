import cn from 'classnames';
import {useStore} from 'effector-react';
import {FieldInputProps, FormikState} from 'formik';
import React, {useState} from 'react';

import {$tokens} from '~/entities/wallet';

import type {RichToken} from '~/shared/api/ft';
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
  withNameOnly?: boolean;
};

const TokenOption = ({
  token,
  onClick,
  className,
  withNameOnly,
}: {
  token: RichToken;
  className?: string;
  onClick?: () => void;
  withNameOnly: boolean;
}) => {
  const classNames = cn(styles.tokenOption, className);

  const content = (
    <>
      <TokenImage tokenAccountId={token.roketoMeta.account_id} />
      <span>{withNameOnly ? token.meta.symbol : `${token.meta.name}, ${token.meta.symbol}`}</span>
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
    withNameOnly = false,
  } = props;

  const tokens = useStore($tokens);

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
          <TokenOption token={activeToken} withNameOnly={withNameOnly} />
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
              withNameOnly={withNameOnly}
            />
          ))}
        </DropdownMenu>
      </div>
    </FormField>
  );
};
