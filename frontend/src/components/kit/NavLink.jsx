import React from 'react';
import classNames from 'classnames';
import { Link, useRouteMatch } from 'react-router-dom';
export function NavLink({ icon, children, className, to, ...rest }) {
  const activeClassname = 'twind-bg-hover';
  const match = useRouteMatch(to);
  const isActive = match && match.isExact;

  return (
    <Link
      to={to}
      className={classNames(
        className,
        'twind-text-white twind-font-semibold',
        'twind-flex twind-items-center twind-px-5 twind-py-4 twind-rounded-xl ',
        'twind-group twind-cursor-pointer twind-whitespace-nowrap',
        isActive ? activeClassname : '',
        'twind-transition-all',
        'hover:twind-bg-hover',
      )}
      {...rest}
    >
      <div
        className={classNames(
          'group-hover:twind-text-blue',
          isActive ? 'twind-text-blue' : '',
        )}
      >
        {icon}
      </div>
      <div className="twind-ml-2">{children}</div>
    </Link>
  );
}
