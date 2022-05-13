import React, {ChangeEvent, Dispatch, SetStateAction, useEffect, useState} from 'react';
import cn from 'classnames';
import {FieldInputProps, FormikState} from 'formik';

import {useRoketoContext} from 'app/roketo-context';

import {FormField} from '@ui/components/FormField';
import {Input} from '@ui/components/Input';

import {usePrev} from 'shared/hooks/usePrev';
import {isLikeNumber} from 'shared/helpers/validation';
import { testIds } from 'shared/constants';

import {getTokensPerSecondCount, getDurationInSeconds, getStreamingSpeed} from '../lib';

import styles from './styles.module.scss';

type SpeedInputProps = {
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  testId: string;
};

const SpeedInput = ({className, value, onChange, label, testId}: SpeedInputProps) => (
  <div className={cn(styles.speedInput, className)}>
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

type StreamSpeedCalcFieldProps = {
  deposit: number,
  tokenAccountId: string,
  onSpeedChange: (speed: string) => void,

  field: FieldInputProps<any>,
  form: FormikState<any>,

  label?: React.ReactNode,
  description?: React.ReactNode,

  isRequired?: boolean,
  className?: string;
};

export const StreamSpeedCalcField = (props: StreamSpeedCalcFieldProps) => {
  const {
    form,
    field,
    label,
    deposit,
    className,
    isRequired,
    description,
    onSpeedChange,
    tokenAccountId,
  } = props;

  const {tokens} = useRoketoContext();
  const token = tokens[tokenAccountId];
  const {formatter} = token;

  const error = form.errors[field.name];
  const {value: currentStreamingSpeed} = field;

  const [months, setMonths] = useState(0);
  const [days, setDays] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);

  const depositInYocto = formatter.toYocto(deposit);
  const durationInSeconds = getDurationInSeconds(months, days, hours, minutes);
  const tokensPerSec = getTokensPerSecondCount(depositInYocto, durationInSeconds);
  const prevSpeed = usePrev(tokensPerSec);

  useEffect(() => {
    if (prevSpeed !== tokensPerSec) {
      onSpeedChange(tokensPerSec);
    }
  }, [tokensPerSec, onSpeedChange, prevSpeed]);

  const handleInputChangeFactory = (
    setValue: Dispatch<SetStateAction<number>>
  ) => (event: ChangeEvent<HTMLInputElement>) => {
    const {value} = event.target;

    const safeValue = value || '0';

    if (isLikeNumber(safeValue)) {
      setValue(Number(safeValue));
    }
  };

  const meaningfulSpeed = getStreamingSpeed(currentStreamingSpeed, token);
  const labelWithStreamingSpeed = (
    <div className={styles.formLabel}>
      {label}
      <span className={cn(styles.speed, styles.label)}>
        {`Streaming speed: ${meaningfulSpeed}`}
      </span>
    </div>
  );

  return (
    <FormField
      isRequired={isRequired}
      className={cn(styles.formField, className)}
      description={description}
      label={labelWithStreamingSpeed}
      error={error}
    >
      <div className={styles.wrapper}>
        <SpeedInput
          value={months}
          onChange={handleInputChangeFactory(setMonths)}
          label="Months"
          testId={testIds.createStreamMonthsInput}
        />
        <SpeedInput
          value={days}
          onChange={handleInputChangeFactory(setDays)}
          label="Days"
          testId={testIds.createStreamDaysInput}
        />
        <SpeedInput
          value={hours}
          onChange={handleInputChangeFactory(setHours)}
          label="Hours"
          testId={testIds.createStreamHoursInput}
        />
        <SpeedInput
          value={minutes}
          onChange={handleInputChangeFactory(setMinutes)}
          label="Minutes"
          testId={testIds.createStreamMinutesInput}
        />
      </div>
    </FormField>
  );
};
