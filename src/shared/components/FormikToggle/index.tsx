import {FieldInputProps, FormikState} from 'formik';
import React from 'react';

import {FormField} from '@ui/components/FormField';
import {Toggle} from '@ui/components/Toggle';

type ToggleProps = {
  field: FieldInputProps<any>;
  form: FormikState<any>;

  label?: React.ReactNode;
  description?: React.ReactNode;
  hint?: React.ReactNode;
  isRequired?: boolean;
  className?: string;
};

export const FormikToggle = (props: ToggleProps) => {
  const {description, hint, isRequired, className, label, field, form, ...rest} = props;

  const error = form.errors[field.name];

  return (
    <FormField isRequired={isRequired} className={className} label={label} error={error}>
      <Toggle
        description={description}
        hint={hint}
        required={isRequired}
        hasError={Boolean(error)}
        {...field}
        {...rest}
      />
    </FormField>
  );
};
