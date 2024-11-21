import { ObjectId } from 'mongodb';
import { Event, Product } from '../../models'
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

    const aggregationMethod = product.aggregation.type
    const aggregationFilter = product.aggregation.field

    const eventsTotal = await this.readEventsTotals(
      customerId,
      period,
      product._id,
      aggregationMethod,
      aggregationFilter
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
    aggregationMethod: string,
    aggregationFilter?: string
  ): Promise<number> {

    const aggregationOperation = this.getMongoAggregationOperation(aggregationMethod, aggregationFilter)
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

  private static getMongoAggregationOperation(aggregationMethod: string, field?: string) {
    switch (aggregationMethod) {
      case 'count':
        return [
          { $count: "count" },
          { $project: { total: "$count" } }
        ]
      case 'sum':
        return [
          {
            $group: {
              _id: null,
              tempSum: { $sum: { $ifNull: [`$metadata.${field}`, 0] } },
            },
          },
          {
            $project: {
              total: "$tempSum"
            }
          }
        ]
      case 'min':
        return [
          {
            $group: {
              _id: null,
              tempMin: { $min: { $ifNull: [`$metadata.${field}`, 0] } },
            },
          },
          {
            $project: {
              total: "$tempMin"
            }
          }
        ]
      case 'max':
        return [
          {
            $group: {
              _id: null,
              tempMax: { $max: { $ifNull: [`$metadata.${field}`, 0] } },
            },
          },
          {
            $project: {
              total: "$tempMax"
            }
          }
        ]
      case 'average':
        return [
          {
            $group: {
              _id: null,
              tempAvg: { $avg: { $ifNull: [`$metadata.${field}`, 0] } },
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

}