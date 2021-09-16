import {Bullet} from '../../components/kit';
import numbro from 'numbro';
import classNames from 'classnames';

export function StreamProgressPercentage({
  label,
  formattedFloatValue,
  percentageValue,
  colorClass,
  className,
  ...rest
}) {
  return (
    <div className={className} {...rest}>
      <Bullet className={classNames(colorClass, 'twind-mr-1')} />
      <span>
        {label}:{' '}
        <span className="twind-font-semibold">{formattedFloatValue} </span>
        <span className="twind-text-gray">
          {' '}
          (
          {numbro(percentageValue).format({
            output: 'percent',
            mantissa: 1,
          })}
          )
        </span>
      </span>
    </div>
  );
}
