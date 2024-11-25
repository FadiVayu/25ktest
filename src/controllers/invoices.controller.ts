import { Controller, Route, Get, Path } from 'tsoa'
import { CalculationService } from '../services/calculation.service'
import { Invoice } from '../models'

@Route('/invoices')
export class InvoicesController extends Controller {
  private calculationService: CalculationService

  constructor() {
    super()
    this.calculationService = new CalculationService()
  }

  @Get(':id/Calculate')
  public async calculate(@Path('id') id: string): Promise<Invoice | null> {
    return this.calculationService.calculateInvoiceTotal(id)
  }
}