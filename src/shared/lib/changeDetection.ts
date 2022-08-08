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
export function recordUpdater<T, Src extends {id: string}>(
  oldData: Record<string, T>,
  sourceItems: Src[],
  updater: (item: Src, id: string) => T | undefined,
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

/**
 * If item from `received` exists in `source` updates it, otherwise just append at the end
 * If item exists, there will be no full list search, just check up in `cache`
 * @param source
 * @param received
 * @param cache
 */
export function upsertWithCache<T extends {id: string}>(
  source: T[],
  received: T[],
  cache: Set<string>,
): T[] {
  if (received.length === 0) return source;
  const copy = [...source];
  received.forEach((item) => {
    if (cache.has(item.id)) {
      const index = copy.findIndex((found) => found.id === item.id);
      if (index !== -1) {
        copy.splice(index, 1, item);
      }
    } else {
      copy.push(item);
      cache.add(item.id);
    }
  });
  return copy;
}
