import React from 'react';

export const useOutsideClick = (ref: React.RefObject<HTMLElement>, callback: () => void) => {
  const handleClick = ({target}: DocumentEventMap['click']) => {
    if (ref.current && target instanceof HTMLElement && !ref.current.contains(target)) {
      callback();
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  });
};
