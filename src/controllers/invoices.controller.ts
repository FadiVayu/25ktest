import { Controller, Route, Get, Path, Example, Tags, SuccessResponse, OperationId, Response, Post, Put, Delete, } from 'tsoa'
import { CalculationService } from '../services/calculation.service'
import { APIInvoice } from '../API'
import { InvoicesService } from '../services'
import { CreateInvoicePayload, UpdateInvoicePayload } from '../models'

@Route('/invoices')
@Tags('Invoices')

export class InvoicesController extends Controller {
  private calculationService: CalculationService
  private invoicesService: InvoicesService

  constructor() {
    super()
    this.calculationService = new CalculationService()
    this.invoicesService = new InvoicesService()
  }

  @Get(':id/Calculate')
  @OperationId('Calculate Invoice')
  @SuccessResponse(200, 'Invoice total calculated')
  @Response(404, 'Invoice not found')
  @Response(404, 'Invoice Products not found')
  public async calculate(@Path('id') id: string): Promise<APIInvoice> {
    const invoice = await this.calculationService.calculateInvoiceTotal(id)

    return APIInvoice.fromEntity(invoice)
  }

  @Get(':id')
  @OperationId('Get Invoice')
  @SuccessResponse(200, 'Invoice found')
  @Response(404, 'Invoice not found')
  public async get(@Path('id') id: string): Promise<APIInvoice> {
    const invoice = await this.invoicesService.get(id)

    return APIInvoice.fromEntity(invoice)
  }

  @Post('/')
  @OperationId('Create Invoice')
  @SuccessResponse(201, 'Invoice created')
  @Response(400, 'Invalid payload')
  public async create(invoice: CreateInvoicePayload): Promise<APIInvoice> {
    const createdInvoice = await this.invoicesService.create(invoice)

    return APIInvoice.fromEntity(createdInvoice)
  }

  @Put(':id')
  @OperationId('Update Invoice')
  @SuccessResponse(200, 'Invoice updated')
  @Response(404, 'Invoice not found')
  @Response(400, 'Invalid payload')
  public async update(@Path('id') id: string, invoice: UpdateInvoicePayload): Promise<APIInvoice> {
    const updatedInvoice = await this.invoicesService.update(id, invoice)

    return APIInvoice.fromEntity(updatedInvoice)
  }

  @Delete(':id')
  @OperationId('Delete Invoice')
  @SuccessResponse(204, 'Invoice deleted')
  public async delete(@Path('id') id: string): Promise<void> {
    await this.invoicesService.delete(id)
  }

}