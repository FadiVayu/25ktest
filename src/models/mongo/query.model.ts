import { Filter } from "mongodb";

export const MAX_PAGE_SIZE = 100;

export class QueryPayload<T = any> {
  public filter!: Filter<T> | { [K in keyof T]?: T[K] };
  public page?: number;
  public pageSize?: number;
  public sort?: { [K in keyof T]?: 'asc' | 'desc' };

  public constructor(payload: Partial<QueryPayload<T>>) {
    Object.assign(this, { page: 0, pageSize: MAX_PAGE_SIZE }, payload);
  }

  public static fromAPIQuery<T>(query: Partial<QueryPayload<any>>): QueryPayload<T> {
    query.filter = query.filter || {};

    if (query.filter?.id) {
      query.filter._id = query.filter.id;
      delete query.filter.id;
    }

    return new QueryPayload(query);
  }
}

export interface QueryResult<T> {
  /** 
   * Items 
   * 
   * @isArray
   */
  items: T[];
  /** 
   * Total items found 
   * 
   * @isInt
   */
  totalCount: number;
  /** 
   * There are more items 
   * 
   * @isBool
   */
  hasMore: boolean;
}