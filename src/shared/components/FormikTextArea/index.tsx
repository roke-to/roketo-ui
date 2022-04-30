import React from 'react';

import {FieldInputProps, FormikState} from 'formik';

import {FormField} from '@ui/components/FormField';
import {TextArea} from '@ui/components/TextArea';

type TextAreaProps = {
  placeholder: string,

  field: FieldInputProps<any>,
  form: FormikState<any>,

  label?: React.ReactNode,
  description?: React.ReactNode,

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
    field,
    form,
    label,
    ...rest
  } = props;

  const error = form.errors[field.name];

  return (
    <FormField
      isRequired={isRequired}
      className={className}
      description={description}
      label={label}
      error={error}
    >
      <TextArea
        required={isRequired}
        hasError={Boolean(error)}
        placeholder={placeholder}
        {...field}
        {...rest}
      />
    </FormField>
  );
};
