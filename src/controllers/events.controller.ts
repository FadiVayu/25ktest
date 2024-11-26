import { Controller, Route, Get, Path, Example, Tags, SuccessResponse, OperationId, Response, } from 'tsoa'
import { CalculationService } from '../services/calculation.service'
import { APIInvoice } from '../API'

@Route('/events')
@Tags('Events')

export class InvoicesController extends Controller {
  private calculationService: CalculationService

  constructor() {
    super()
    this.calculationService = new CalculationService()
  }

  @Get(':id/Calculate')
  @OperationId('Calculate Invoice')
  @SuccessResponse(200, 'Invoice total calculated')
  @Response(404, 'Invoice not found')
  public async calculate(@Path('id') id: string): Promise<APIInvoice | null> {
    const invoice = await this.calculationService.calculateInvoiceTotal(id)

    if (!invoice) {
      return null
    }

    return APIInvoice.fromEntity(invoice)
  }
}