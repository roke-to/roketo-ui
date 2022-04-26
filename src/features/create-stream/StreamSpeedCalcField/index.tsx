import React, {ChangeEvent, Dispatch, SetStateAction, useEffect, useState} from 'react';
import classNames from 'classnames';
import {FieldInputProps, FormikState} from 'formik';

import {useRoketoContext} from 'app/roketo-context';

import {FormField} from '@ui/components/FormField';
import {Input} from '@ui/components/Input';

import {usePrev} from 'shared/hooks/usePrev';
import {isLikeNumber} from 'shared/helpers/validation';

import {getTokensPerSecondCount, getDurationInSeconds} from '../lib';

import styles from './styles.module.scss';

type SpeedInputProps = {
  label: string;
  value: number;

  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  className?: string;
};

const SpeedInput = ({className, value, onChange, label}: SpeedInputProps) => (
  <div className={classNames(styles.speedInput, className)}>
    <Input
      placeholder="0"
      value={value}
      onChange={onChange}
      className={styles.input}
    />
    <label className={styles.label}>{label}</label>
  </div>
);

type StreamSpeedCalcFieldProps = {
  deposit: number,
  tokenAccountId: string,

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
    tokenAccountId,
  } = props;

  const {tokens} = useRoketoContext();
  const token = tokens[tokenAccountId];
  const {formatter} = token;

  const error = form.errors[field.name];
  const onFiledChange = field.onChange;

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
      onFiledChange(tokensPerSec);
    }
  }, [tokensPerSec, onFiledChange, prevSpeed]);

  const handleInputChangeFactory = (
    setValue: Dispatch<SetStateAction<number>>
  ) => (event: ChangeEvent<HTMLInputElement>) => {
    const {value} = event.target;

    const safeValue = value || '0';

    if (isLikeNumber(safeValue)) {
      setValue(Number(safeValue));
    }
  };

  return (
    <FormField
      isRequired={isRequired}
      className={className}
      description={description}
      label={label}
      error={error}
    >
      <div className={styles.wrapper}>
        <SpeedInput
          value={months}
          onChange={handleInputChangeFactory(setMonths)}
          label="Months"
        />
        <SpeedInput
          value={days}
          onChange={handleInputChangeFactory(setDays)}
          label="Days"
        />
        <SpeedInput
          value={hours}
          onChange={handleInputChangeFactory(setHours)}
          label="Hours"
        />
        <SpeedInput
          value={minutes}
          onChange={handleInputChangeFactory(setMinutes)}
          label="Minutes"
        />
      </div>
    </FormField>
  );
};
