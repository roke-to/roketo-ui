import {FieldInputProps, FormikState} from 'formik';
import React, {ChangeEvent, useEffect, useState} from 'react';

import {usePrev} from '~/shared/hooks/usePrev';

import {FormField} from '@ui/components/FormField';
import {Toggle} from '@ui/components/Toggle';

type ToggleProps = {
  onDelayedChange: (duration: boolean) => void;

  field: FieldInputProps<any>;
  form: FormikState<any>;

  label?: React.ReactNode;
  description?: React.ReactNode;
  hint?: React.ReactNode;
  isRequired?: boolean;
  className?: string;
  disabled: boolean;
  isChecked: boolean;
  testId: string;
};

export const FormikToggle = (props: ToggleProps) => {
  const {
    description,
    hint,
    isRequired,
    className,
    label,
    isChecked,
    disabled,
    testId,
    form,
    field,
    onDelayedChange,
  } = props;

  const error = form.errors[field.name];

  const [toggleValue, setToggleValue] = useState(isChecked);
  const prevValue = usePrev(toggleValue);

  useEffect(() => {
    if (prevValue !== toggleValue) {
      onDelayedChange(toggleValue);
    }
  }, [prevValue, onDelayedChange, toggleValue]);

  const handleInputChangeFactory = (event: ChangeEvent<HTMLInputElement>) => {
    const {checked} = event.target;
    setToggleValue(checked);
  };

  return (
    <FormField isRequired={isRequired} className={className} label={label} error={error}>
      <Toggle
        description={description}
        hint={hint}
        disabled={disabled}
        required={isRequired}
        hasError={Boolean(error)}
        checked={isChecked}
        onChange={handleInputChangeFactory}
        testId={testId}
      />
    </FormField>
  );
};
