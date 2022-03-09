import { useState, useEffect, useMemo } from 'react';

export function useFilter({ options }) {
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

export function useFilters({ items, filters }) {
  const [filteredItems, setFilteredItems] = useState([]);
  const [filterCounts, setFilterCounts] = useState([]);

  useEffect(() => {
    let filteredItemsValue = items;
    const filterCountsValue = [];

    filters.forEach((filter) => {
      const filterRunResult = {};
      // run filter for every possible function
      Object.keys(filter.options).forEach((option) => {
        const filtered = filteredItemsValue.filter(filter.options[option]);

        filterRunResult[option] = filtered;
      });

      // calc counts for every option in filter
      const currentFilterCount = {};
      Object.keys(filterRunResult).forEach(
        (option) => { currentFilterCount[option] = filterRunResult[option].length; },
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
