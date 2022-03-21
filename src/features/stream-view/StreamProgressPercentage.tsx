import numbro from 'numbro';
import classNames from 'classnames';
import { Bullet } from 'shared/kit/Bullet';

type StreamProgressPercentageProps = {
  label: string;
  formattedFloatValue: string;
  percentageValue: number;
  colorClass: string;
  className?: string;
};

export function StreamProgressPercentage({
  label,
  formattedFloatValue,
  percentageValue,
  colorClass,
  className,
  ...rest
}: StreamProgressPercentageProps) {
  return (
    <div className={className} {...rest}>
      <Bullet className={classNames(colorClass, 'mr-1')} />
      <span>
        {label}:{' '}
        <span className="font-semibold">
          {formattedFloatValue}
          {' '}
        </span>
        <span className="text-gray">
          {' '}
          {numbro(percentageValue).format({
            output: 'percent',
            mantissa: 1,
          })}
        </span>
      </span>
    </div>
  );
}
