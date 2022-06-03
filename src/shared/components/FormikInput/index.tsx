import {FieldInputProps, FormikState} from 'formik';
import React from 'react';

import {FormField} from '@ui/components/FormField';
import {Input} from '@ui/components/Input';

type InputProps = {
  placeholder: string;

  field: FieldInputProps<any>;
  form: FormikState<any>;

  label?: React.ReactNode;
  description?: React.ReactNode;

  isRequired?: boolean;
  className?: string;
};

export const FormikInput = (props: InputProps) => {
  const {placeholder, description, isRequired, className, field, form, label, ...rest} = props;

  const error = form.errors[field.name];

  return (
    <FormField
      isRequired={isRequired}
      className={className}
      description={description}
      label={label}
      error={error}
    >
      <Input
        required={isRequired}
        hasError={Boolean(error)}
        placeholder={placeholder}
        {...field}
        {...rest}
      />
    </FormField>
  );
};
