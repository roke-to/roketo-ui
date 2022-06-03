import {FieldInputProps, FormikState} from 'formik';
import React from 'react';

import {Checkbox} from '@ui/components/Checkbox';
import {FormField} from '@ui/components/FormField';

type CheckboxProps = {
  field: FieldInputProps<any>;
  form: FormikState<any>;

  label?: React.ReactNode;
  description?: React.ReactNode;
  isRequired?: boolean;
  className?: string;
};

export const FormikCheckbox = (props: CheckboxProps) => {
  const {description, isRequired, className, label, field, form, ...rest} = props;

  const error = form.errors[field.name];

  return (
    <FormField isRequired={isRequired} className={className} label={label} error={error}>
      <Checkbox
        description={description}
        required={isRequired}
        hasError={Boolean(error)}
        {...field}
        {...rest}
      />
    </FormField>
  );
};
