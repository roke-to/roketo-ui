import classNames from 'classnames';
import {FieldInputProps, FormikState} from 'formik';
import React from 'react';
import DateTimePicker from 'react-datetime-picker';

import {FormField} from '@ui/components/FormField';

import styles from './styles.module.scss';

type FormikDateTimePickerProps = {
  label?: React.ReactNode;

  field: FieldInputProps<any>;
  form: FormikState<any>;

  className?: string;
  isRequired?: boolean;

  onChange: (value: Date | null) => void;
  withSmallFont?: boolean;
};

export const FormikDateTimePicker = ({
  form,
  label,
  field,
  className,
  onChange,
  isRequired,
  withSmallFont = false,
}: FormikDateTimePickerProps) => {
  const error = form.errors[field.name];

  return (
    <FormField className={className} label={label} error={error} isRequired={isRequired}>
      <DateTimePicker
        className={classNames(styles.maxWidth, withSmallFont && styles.smallFont)}
        calendarAriaLabel="Toggle calendar"
        clearAriaLabel="Clear value"
        dayAriaLabel="Day"
        hourAriaLabel="Hour"
        maxDetail="minute"
        minuteAriaLabel="Minute"
        monthAriaLabel="Month"
        nativeInputAriaLabel="Date and time"
        onChange={onChange}
        value={form.values[field.name]}
        yearAriaLabel="Year"
        format="dd/MM/y HH:mm"
      />
    </FormField>
  );
};
