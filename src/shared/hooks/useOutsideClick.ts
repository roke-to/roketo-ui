import React from 'react';

export const useOutsideClick = (ref: React.RefObject<HTMLElement>, callback: () => void) => {
  const handleClick = (ev: DocumentEventMap['click']) => {
    const {target} = ev;
    if (
      ref.current &&
      target instanceof HTMLElement &&
      document.documentElement.contains(target) &&
      !ref.current.contains(target) &&
      // @ts-expect-error dom typings lacks .path property
      !detectReactModalClicks(ref.current, ev)
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

function detectReactModalClicks(
  refEl: HTMLElement,
  ev: DocumentEventMap['click'] & {path: HTMLElement[]},
) {
  const refPath: ParentNode[] = [refEl];
  let current: ParentNode = refEl;
  while (current.parentNode) {
    current = current.parentNode;
    refPath.push(current);
  }
  const targetPath = [...ev.path];
  /** find part of the path which is different
   * to decide whether referenced element is inside modal itself */
  while (targetPath.length > 0 && refPath.includes(targetPath[0])) {
    targetPath.pop();
  }
  return targetPath.some((el) => el.classList?.contains('ReactModalPortal'));
}
