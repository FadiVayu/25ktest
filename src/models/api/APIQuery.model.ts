import { MAX_PAGE_SIZE, QueryPayload } from "../mongo";

export class APIQueryPayload<T = any> {
  /**
   * Filter by field.
   * 
   * @example { "field": "A" }
   */
  public filter!: { [K in keyof T]?: T[K] };
  /** 
   * Page 
   * @example 0
   * @minimum 0
   * @default 0
   * @isInt
   */
  public page?: number;
  /** 
   * Page Size 
   * @example 10
   * @minimum 0
   * @default 100
   * @isInt
   */
  public pageSize?: number;
  /**
   * Sort by field. Use 1 for ascending and -1 for descending.
   * 
   * @example { "field": 1 }
   */
  public sort?: { [K in keyof T]?: 'asc' | 'desc' };

  public constructor(payload: Partial<APIQueryPayload<T>>) {
    Object.assign(this, { page: 0, pageSize: MAX_PAGE_SIZE }, payload);
  }

  public static toQuery<T>(query: Partial<APIQueryPayload<any>>): QueryPayload<T> {
    query.filter = query.filter || {};

    if (query.filter?.id) {
      query.filter._id = query.filter.id;
      delete query.filter.id;
    }

    return new QueryPayload<T>(query);
  }
}
