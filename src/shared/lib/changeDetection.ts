/** Keys of objects might not match */
export function areRecordsDifferent<T>(a: Record<string, T>, b: Record<string, T>) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  return (
    aKeys.length !== bKeys.length ||
    aKeys.some((aKey) => !bKeys.includes(aKey) || a[aKey] !== b[aKey])
  );
}

/** Assumed that objects has exactly same shape */
export function areObjectsDifferent<T>(a: T, b: T) {
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return a !== b;
  // @ts-expect-error
  return Object.keys(a).some((key) => a[key] !== b[key]);
}

export function getChangedFields<F extends Record<string, unknown>, T extends F>(
  fields: F,
  source: T,
): Partial<F> {
  const changedFields: Partial<F> = {...fields};

  Object.keys(changedFields).forEach((key: keyof typeof changedFields) => {
    if (changedFields[key] === source[key]) {
      delete changedFields[key];
    }
  });

  return changedFields;
}

/** comparison with sorting taken into account */
export function areArraysDifferent<T>(a: T[], b: T[]) {
  if (a === b) return false;
  return a.length !== b.length || a.some((e, idx) => e !== b[idx]);
}

/**
 * efficiently updates objects-record maps
 * computed from given array of source items
 * */
export function recordUpdater<T, Src extends {id: string | number}>(
  oldData: Record<string, T>,
  sourceItems: Src[],
  updater: (item: Src, id: string | number) => T | undefined,
): Record<string, T> {
  const result = Object.fromEntries(
    sourceItems
      .map((item) => {
        const {id} = item;
        const update = updater(item, id);
        if (update === undefined) return undefined;
        return [id, areObjectsDifferent(update, oldData[id]) ? update : oldData[id]] as const;
      })
      .filter(Boolean) as Array<[id: string, value: T]>,
  );
  return areRecordsDifferent(oldData, result) ? result : oldData;
}
