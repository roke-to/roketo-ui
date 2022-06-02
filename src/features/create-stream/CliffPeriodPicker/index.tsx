import React from 'react';
import {FieldInputProps, FormikState} from 'formik';
import DateTimePicker from 'react-datetime-picker';

import {FormField} from '@ui/components/FormField';

import styles from './styles.module.scss';

type CliffPeriodPickerProps = {
  label?: React.ReactNode,

  field: FieldInputProps<any>,
  form: FormikState<any>,

  className?: string;

  onCliffDateTimeChange: (value: Date | null) => void;
};

export const CliffPeriodPicker = ({
  form,
  label,
  field,
  className,
  onCliffDateTimeChange,
}: CliffPeriodPickerProps) => {
  const error = form.errors[field.name];

  return (
    <FormField
      className={className}
      label={label}
      error={error}
    >
      <DateTimePicker
        className={styles.maxWidth}
        amPmAriaLabel="Select AM/PM"
        calendarAriaLabel="Toggle calendar"
        clearAriaLabel="Clear value"
        dayAriaLabel="Day"
        hourAriaLabel="Hour"
        maxDetail="second"
        minuteAriaLabel="Minute"
        monthAriaLabel="Month"
        nativeInputAriaLabel="Date and time"
        onChange={onCliffDateTimeChange}
        secondAriaLabel="Second"
        value={form.values[field.name]}
        yearAriaLabel="Year"
      />
    </FormField>
  );
};
