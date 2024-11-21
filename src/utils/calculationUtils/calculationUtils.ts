import { Event, Product } from '../../models'
import { InvoiceProduct } from './calculationUtils.types';

export class CalculationUtils {
  public static calculateEventValue(event: Event, aggregationMethod: string, field?: string) {
    if (aggregationMethod === 'count') {
      return 1
    }

    return field ? event.metadata[field] ?? 0 : 0;
  }

  public static calculateProduct(
    eventsTotal: number | undefined,
    product: Product
  ): InvoiceProduct {
    const pricing = product.pricing

    if (!pricing) { return { id: product._id, price: 0, units: 0 } }

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
}