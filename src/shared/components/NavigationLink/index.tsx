import React from 'react';
import {Link} from 'react-router-dom';

type Props = {
  children?: React.ReactNode;
  className?: string;

  onClick?: () => void;
  to: string;
};

export const NavigationLink = (props: Props) => {
  const {to, className, children, onClick} = props;

  return (
    <Link to={to} className={className} onClick={onClick}>
      {children}
    </Link>
  );
};

export default NavigationLink;
