export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface PaginatedData<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SearchableState<T> {
  query: string;
  results: T[];
  searching: boolean;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOptions {
  [key: string]: string | number | boolean | string[] | number[] | boolean[] | null | undefined;
}

export interface ListState<T> extends AsyncState<T[]> {
  selectedItems: Set<string>;
  sortOptions?: SortOptions;
  filterOptions?: FilterOptions;
}

export interface ComponentProps {
  testID?: string;
  accessibilityLabel?: string;
}