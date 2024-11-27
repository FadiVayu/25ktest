import { FindCursor, AggregationCursor } from 'mongodb';

export type MongoCursor = FindCursor | AggregationCursor;

export const MAX_PAGE_SIZE = 100;

export interface QueryPayload<T> {
  page?: number;
  pageSize?: number;
  sort?: Partial<Record<keyof T, 1 | -1>>;
  filter?: Partial<T>;
}

export interface QueryResult<T> {
  items: T[];
  totalCount: number;
  hasNext: boolean;
}

export class Cursor<T> {
  constructor(private _mongoCursor: MongoCursor, private _materialize: (obj: any) => T) {}

  public async items(): Promise<T[]> {
    const items =  this._mongoCursor.toArray();

    if (this._materialize) {
      return items.then((items) => items.map(this._materialize));
    }

    return items;
  }

  public async totalCount(): Promise<number> {
    if (this._mongoCursor instanceof AggregationCursor) {
      return this._mongoCursor.toArray().then((items) => items.length);
    }

    return this._mongoCursor.count();
  }

  public async hasNext(): Promise<boolean> {
    return this._mongoCursor.hasNext();
  }
}