import React from 'react';
import cn from 'classnames';

import {FieldInputProps, FormikState} from 'formik';

import {FormField} from '@ui/components/FormField';
import {TextArea} from '@ui/components/TextArea';

import styles from './styles.module.scss';

type TextAreaProps = {
  placeholder: string,

  field: FieldInputProps<any>,
  form: FormikState<any>,

  label?: React.ReactNode,
  description?: React.ReactNode,

  maxLength?: number,
  isRequired?: boolean,
  className?: string;
  error?: never;
};

export const FormikTextArea = (props: TextAreaProps) => {
  const {
    placeholder,
    description,
    isRequired,
    className,
    maxLength,
    field,
    label,
    form,
    ...rest
  } = props;

  const error = form.errors[field.name];

  return (
    <FormField
      isRequired={isRequired}
      className={cn(styles.formfield, className)}
      description={description}
      label={label}
      error={error}
    >
      <TextArea
        required={isRequired}
        hasError={Boolean(error)}
        placeholder={placeholder}
        maxLength={maxLength}
        {...field}
        {...rest}
      />

      {maxLength &&
        <span className={styles.textLimitCounter}>{`${field?.value?.length || 0}/${maxLength}`}</span>
      }
    </FormField>
  );
};
