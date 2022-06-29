import cn from 'classnames';
import {FieldInputProps, FormikState} from 'formik';
import React, {ChangeEvent, Dispatch, SetStateAction, useEffect, useState} from 'react';

import {testIds} from '~/shared/constants';
import {usePrev} from '~/shared/hooks/usePrev';
import {isLikeNumber} from '~/shared/lib/validation';

import {FormField} from '@ui/components/FormField';
import {Input} from '@ui/components/Input';

import {getDurationInSeconds} from '../lib';
import styles from './styles.module.scss';

type DurationInputProps = {
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  testId: string;
};

const DurationInput = ({className, value, onChange, label, testId}: DurationInputProps) => (
  <div className={cn(styles.durationInput, className)}>
    <Input
      placeholder="0"
      value={value}
      onChange={onChange}
      className={styles.input}
      data-testid={testId}
    />
    <label className={styles.label}>{label}</label>
  </div>
);

type StreamDurationCalcFieldProps = {
  onDurationChange: (duration: number) => void;

  field: FieldInputProps<any>;
  form: FormikState<any>;

  label?: React.ReactNode;
  description?: React.ReactNode;

  isRequired?: boolean;
  className?: string;
};

export const StreamDurationCalcField = (props: StreamDurationCalcFieldProps) => {
  const {form, field, label, className, isRequired, description, onDurationChange} = props;

  const error = form.errors[field.name];

  const [months, setMonths] = useState(0);
  const [days, setDays] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);

  const durationInSeconds = getDurationInSeconds(months, days, hours, minutes);
  const prevDuration = usePrev(durationInSeconds);

  useEffect(() => {
    if (prevDuration !== durationInSeconds) {
      onDurationChange(durationInSeconds);
    }
  }, [durationInSeconds, onDurationChange, prevDuration]);

  const handleInputChangeFactory =
    (setValue: Dispatch<SetStateAction<number>>, valueLimit: number) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const {value} = event.target;

      const safeValue = value || '0';

      if (isLikeNumber(safeValue) && Number(safeValue) <= valueLimit) {
        setValue(Number(safeValue));
      }
    };

  return (
    <FormField
      isRequired={isRequired}
      className={cn(styles.formField, className)}
      description={description}
      label={label}
      error={error}
    >
      <div className={styles.wrapper}>
        <DurationInput
          value={months}
          onChange={handleInputChangeFactory(setMonths, 12)}
          label="Months, max: 12"
          testId={testIds.createStreamMonthsInput}
        />
        <DurationInput
          value={days}
          onChange={handleInputChangeFactory(setDays, 31)}
          label="Days, max: 31"
          testId={testIds.createStreamDaysInput}
        />
        <DurationInput
          value={hours}
          onChange={handleInputChangeFactory(setHours, 24)}
          label="Hours, max: 24"
          testId={testIds.createStreamHoursInput}
        />
        <DurationInput
          value={minutes}
          onChange={handleInputChangeFactory(setMinutes, 60)}
          label="Minutes, max: 60"
          testId={testIds.createStreamMinutesInput}
        />
      </div>
    </FormField>
  );
};
