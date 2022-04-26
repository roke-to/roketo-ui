import React from 'react';

import {FieldInputProps, FormikState} from 'formik';

import {FormField} from '@ui/components/FormField';
import {Checkbox} from '@ui/components/Checkbox';

type CheckboxProps = {
  field: FieldInputProps<any>,
  form: FormikState<any>,

  label?: React.ReactNode,
  description?: string,
  isRequired?: boolean,
  className?: string;
};

export const FormikCheckbox = (props: CheckboxProps) => {
  const {
    description,
    isRequired,
    className,
    label,
    field,
    form,
    ...rest
  } = props;

  const error = form.errors[field.name];

  return (
    <FormField
      isRequired={isRequired}
      className={className}
      label={label}
      error={error}
    >
      <Checkbox
        description={description}
        required={isRequired}
        hasError={Boolean(error)}
        {...field}
        {...rest}
      />
    </FormField>
  );
}
