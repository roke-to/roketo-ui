import React from 'react';
import classNames from 'classnames';
import { Link, useRouteMatch } from 'react-router-dom';

type NavLinkProps = {
  icon: never;
  children: never;
  className: never;
  to: never;
};

export function NavLink({
  icon, children, className, to
}: NavLinkProps) {
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
