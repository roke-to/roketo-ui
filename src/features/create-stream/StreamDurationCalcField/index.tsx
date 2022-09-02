import cn from 'classnames';
import {FieldInputProps, FormikState} from 'formik';
import React, {ChangeEvent, useEffect, useState} from 'react';

import {testIds} from '~/shared/constants';
import {usePrev} from '~/shared/hooks/usePrev';

import {FormField} from '@ui/components/FormField';
import {Input} from '@ui/components/Input';

import {parseDuration} from '../lib';
import {ClearIcon} from './ClearIcon';
import styles from './styles.module.scss';

type DurationInputProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  testId: string;
};

const ClearButton = ({onCLick}: {onCLick: (event: React.SyntheticEvent) => void}) => (
  <button className={styles.clearBtn} type="button" onClick={onCLick}>
    <ClearIcon />
  </button>
);

const DurationInput = ({
  className,
  value,
  onChange,
  label,
  placeholder,
  testId,
}: DurationInputProps) => (
  <div className={cn(styles.durationInput, className)}>
    <Input
      placeholder={placeholder}
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

  const [inputValue, setInputValue] = useState('');
  const durationMs = parseDuration(inputValue);
  const durationInSeconds = Math.floor(durationMs / 1000);
  const prevDuration = usePrev(durationInSeconds);

  useEffect(() => {
    if (prevDuration !== durationInSeconds) {
      onDurationChange(durationInSeconds);
    }
  }, [durationInSeconds, onDurationChange, prevDuration]);

  const handleInputChangeFactory = (event: ChangeEvent<HTMLInputElement>) => {
    const {value} = event.target;
    setInputValue(value);
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
          value={inputValue ?? ''}
          placeholder="2m 7d 1h 10min"
          onChange={handleInputChangeFactory}
          testId={testIds.createStreamDurationInput}
        />
        <ClearButton onCLick={() => setInputValue('')} />
      </div>
    </FormField>
  );
};
