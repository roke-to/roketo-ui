import React from 'react';
import classNames from 'classnames';
import { Link, useRouteMatch } from 'react-router-dom';

export function NavLink({
  icon, children, className, to, ...rest
}) {
  const activeClassname = 'bg-hover';
  const match = useRouteMatch(to);
  const isActive = match && match.isExact;

  return (
    <Link
      to={to}
      className={classNames(
        className,
        'text-white font-semibold',
        'flex items-center px-5 py-4 rounded-xl ',
        'group cursor-pointer whitespace-nowrap',
        isActive ? activeClassname : '',
        'transition-all',
        'hover:bg-hover',
      )}
      {...rest}
    >
      <div
        className={classNames(
          'group-hover:text-blue',
          isActive ? 'text-blue' : '',
        )}
      >
        {icon}
      </div>
      <div className="ml-2">{children}</div>
    </Link>
  );
}
