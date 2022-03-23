import { useState, useEffect, useMemo } from 'react';

import { RoketoStream } from 'shared/api/roketo/interfaces/entities';

type FilterFn = (stream: RoketoStream) => boolean;

type Option = string | FilterFn;

type Filter<T> = {
  option: string;
  selectOption: (option: string) => void;
  options: Record<string, T>;
  optionsArray: string[];
  currentFilterFunction: T;
};

export function useFilter<T extends Option>({ options }: { options: Record<string, T>}): Filter<T> {
  const keys = useMemo(() => Object.keys(options), [options]);

  const [option, selectOption] = useState(keys[0]);

  const filter = useMemo(
    () => {
      const currentFilterFunction = options[option];

      return {
        option,
        selectOption,
        options,
        optionsArray: keys,
        currentFilterFunction,
      };
    },
    [options, option, keys],
  );

  return filter;
}

export function useFilters({ items, filters }: { items: (RoketoStream[] | undefined), filters: Filter<FilterFn>[] }) {
  const [filteredItems, setFilteredItems] = useState<RoketoStream[] | undefined>(undefined);
  const [filterCounts, setFilterCounts] = useState<Record<string, number>[]>([]);

  useEffect(() => {
    let filteredItemsValue = items;
    const filterCountsValue: Record<string, number>[] = [];

    filters.forEach((filter) => {
      const filterRunResult: Record<string, RoketoStream[] | undefined> = {};

      // run filter for every possible function
      Object.keys(filter.options).forEach((option) => {
        console.assert(option in filter.options, 'Never happens'); // Type guard

        filterRunResult[option] = filteredItemsValue?.filter(filter.options[option]);
      });

      // calc counts for every option in filter
      const currentFilterCount: Record<string, number> = {};
      Object.keys(filterRunResult).forEach(
        (option) => { currentFilterCount[option] = (filterRunResult[option] || []).length; },
      );

      filterCountsValue.push(currentFilterCount);
      // set items to selected filter
      filteredItemsValue = filterRunResult[filter.option];
    });

    setFilterCounts(filterCountsValue);
    setFilteredItems(filteredItemsValue);
  }, [items, filters]);

  return {
    filterCounts,
    filteredItems,
  };
}
