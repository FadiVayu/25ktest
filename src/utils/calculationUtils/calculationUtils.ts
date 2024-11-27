import { ObjectId } from 'mongodb';
import { Aggregation, AggregationMethods, Condition, Criterion, CriterionOperators, Product } from '../../models'
import { InvoiceProduct } from './calculationUtils.types';
import { Mongo } from '../../shared';

export class CalculationUtils {
  public static async calculateProduct(
    customerId: ObjectId,
    product: Product,
    period: { startTime: Date; endTime: Date }
  ): Promise<InvoiceProduct> {
    const pricing = product.pricing

    if (!pricing) { return { id: product._id, price: 0, units: 0 } }

    const aggregationFilter = product.aggregation

    const eventsTotal = await this.readEventsTotals(
      customerId,
      period,
      product._id,
      product.aggregation
    )

    let remainingValue = eventsTotal ?? 0
    let totalAmount = 0

    for (const { from, to, price, chunkSize } of pricing.tiers) {
      if (remainingValue <= 0) break

      const applicableValue = Math.min(remainingValue, to - from + 1)
      const fullChunks = Math.ceil(applicableValue / chunkSize)

      totalAmount += fullChunks * price
      remainingValue -= applicableValue
    }

    return {
      id: product._id,
      price: totalAmount,
      units: eventsTotal ?? 0
    }
  }

  private static async readEventsTotals(
    customerId: ObjectId,
    period: { startTime: Date; endTime: Date },
    productId: ObjectId,
    aggregation: Aggregation
  ): Promise<number> {

    const aggregationOperation = this.getMongoAggregationOperation(aggregation)
    const pipeline = [
      {
        $match: {
          customerId,
          productId,
          timestamp: { $gte: period.startTime.getTime(), $lte: period.endTime.getTime() }
        }
      },
      ...aggregationOperation,
    ]

    const eventTotals = await Mongo.events.aggregate(pipeline)

    const result = await eventTotals.toArray()

    return result && result.length ? result[0].total ?? 0 : 0
  }

  private static getMongoAggregationOperation(aggregation: Aggregation) {
    const type = aggregation.type
    const field = aggregation.field
    const mongoConditions = this.extractMongoAggregationConditions(aggregation.filter)

    switch (type) {
      case AggregationMethods.COUNT:
        return [
          {
            $group: {
              _id: null,
              count: {
                $sum: {
                  $cond: {
                    if: { $and: mongoConditions && mongoConditions.$or.length ? mongoConditions.$or : [1] },
                    then: 1,
                    else: 0
                  }
                }
              }
            }
          },
          { $project: { total: "$count" } }
        ]
      case AggregationMethods.SUM:
        return [
          {
            $group: {
              _id: null,
              tempSum: {
                $sum: {
                  $cond: {
                    if: { $and: mongoConditions && mongoConditions.$or.length ? mongoConditions.$or : [1] },
                    then: { $ifNull: [`$metadata.${field}`, 0] },
                    else: 0
                  }
                }
              }
            }
          },
          {
            $project: {
              total: "$tempSum"
            }
          }
        ]
      case AggregationMethods.MIN:
        return [
          {
            $group: {
              _id: null,
              tempMin: {
                $min: {
                  $cond: {
                    if: { $and: mongoConditions && mongoConditions.$or.length ? mongoConditions.$or : [1] },
                    then: { $ifNull: [`$metadata.${field}`, 0] },
                    else: null
                  }
                }
              }
            }
          },
          {
            $project: {
              total: "$tempMin"
            }
          }
        ]
      case AggregationMethods.MAX:
        return [
          {
            $group: {
              _id: null,
              tempMax: {
                $max: {
                  $cond: {
                    if: { $and: mongoConditions && mongoConditions.$or.length ? mongoConditions.$or : [1] },
                    then: { $ifNull: [`$metadata.${field}`, 0] },
                    else: null
                  }
                }
              }
            }
          },
          {
            $project: {
              total: "$tempMax"
            }
          }
        ]
      case AggregationMethods.AVERAGE:
        return [
          {
            $group: {
              _id: null,
              tempAvg: {
                $avg: {
                  $cond: {
                    if: { $and: mongoConditions && mongoConditions.$or.length ? mongoConditions.$or : [1] },
                    then: { $ifNull: [`$metadata.${field}`, 0] },
                    else: null
                  }
                }
              },
            },
          },
          {
            $project: {
              total: "$tempAvg"
            }
          }
        ]
      default:
        throw new Error('Unsupported aggregation method')
    }
  }

  private static extractMongoAggregationConditions(conditions?: Condition[]) {
    if (!conditions || !conditions.length) {
      return undefined
    }

    return conditions.reduce<any>((acc, { criterions }) => {
      const mongoConditions = criterions.map((criterion) => ({ $and: this.extractMongoAggregationCriterion(criterion) }))
      if (!mongoConditions.length) {
        return acc
      }

      acc.$or.push(mongoConditions)
      return acc;
    }, { $or: [] })
  }

  private static extractMongoAggregationCriterion(criterion: Criterion) {
    switch (criterion.operator) {
      case CriterionOperators.Equals:
        return { $eq: [`$metadata.${criterion.field}`, criterion.value] }
      case CriterionOperators.NotEquals:
        return { $ne: [`$metadata.${criterion.field}`, criterion.value] }
      case CriterionOperators.Has:
        return { $gt: [`$metadata.${criterion.field}`, 0] }
      case CriterionOperators.In:
        return { $in: [`$metadata.${criterion.field}`, criterion.value] }
      case CriterionOperators.Contains:
        return { $regexMatch: { input: `$metadata.${criterion.field}`, regex: criterion.value } }
      case CriterionOperators.NotContain:
        return { $not: { $regexMatch: { input: `$metadata.${criterion.field}`, regex: criterion.value } } }
      case CriterionOperators.LargerThan:
        return { $gt: [`$metadata.${criterion.field}`, criterion.value] }
      case CriterionOperators.LowerThan:
        return { $lt: [`$metadata.${criterion.field}`, criterion.value] }
      case CriterionOperators.LowerEqualTo:
        return { $lte: [`$metadata.${criterion.field}`, criterion.value] }
      case CriterionOperators.LargerEqualTo:
        return { $gte: [`$metadata.${criterion.field}`, criterion.value] }
    }
  }

}