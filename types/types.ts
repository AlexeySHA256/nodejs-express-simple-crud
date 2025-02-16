

export interface IPaginatedData<T> {
  page_size: number;
  page_num: number;
  data: T[];
  pages_range: number;
  first_page_num: number;
  last_page_num: number;
  total_records: number
}
