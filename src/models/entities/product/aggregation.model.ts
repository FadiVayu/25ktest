export enum AggregationMethods {
  SUM = 'sum',
  AVERAGE = 'avg',
  MAX = 'max',
  MIN = 'min',
  COUNT = 'count'
}

export enum CriterionOperators {
  Equals = 'Equals',
  NotEquals = 'NotEqual',
  Has = 'Has',
  In = 'In',
  Contains = 'Contains',
  NotContain = 'NotContain',
  LargerThan = 'LargerThan',
  LowerThan = 'LowerThan',
  LowerEqualTo = 'LowerEqualTo',
  LargerEqualTo = 'LargerEqualTo',
}

export type Criterion = {
  field: string
  operator: CriterionOperators,
  value: string | number | boolean | Date
}

export type Condition = {
  criterions: Criterion[]
}

export interface Aggregation {
  type: AggregationMethods
  field?: string
  filter?: Condition[]
}