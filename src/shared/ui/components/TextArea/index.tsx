import React, {FC, TextareaHTMLAttributes} from 'react';
import cn from 'classnames';

import styles from './styles.module.scss';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean,
  className?: string,
}

export const TextArea: FC<TextAreaProps> = ({
  className,
  hasError = false,
  maxLength,
  value,
  ...rest
}) => (
  <textarea
    className={cn(styles.textarea, {[styles.error]: hasError}, className)}
    data-character-limit={maxLength}
    data-current-character-count={value && String(value).length || 0}
    {...rest}
  />
);
