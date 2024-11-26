import { Controller, Route, Get, Path, Example, Tags, SuccessResponse, OperationId,  } from 'tsoa'
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
  @OperationId('Calculate Invoice')
  @Tags('Invoices')
  @SuccessResponse(200, 'Invoice total calculated', typeof Invoice)
  public async calculate(@Path('id') id: string): Promise<Invoice | null> {
    return this.calculationService.calculateInvoiceTotal(id)
  }
}