import React from 'react';

export const useOutsideClick = (ref: React.RefObject<HTMLElement>, callback: () => void) => {
  const handleClick = ({target}: DocumentEventMap['click']) => {
    if (
      ref.current &&
      target instanceof HTMLElement &&
      document.documentElement.contains(target) &&
      !ref.current.contains(target) &&
      !detectReactModalClicks(target)
    ) {
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

function detectReactModalClicks(target: HTMLElement) {
  const modals = Array.from(document.querySelectorAll('.ReactModalPortal'));

  return modals.some((modal) => modal.contains(target));
}
