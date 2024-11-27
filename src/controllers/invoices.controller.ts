import { Controller, Route, Get, Path, Tags, SuccessResponse, OperationId, Response, Post, Put, Delete, Body, } from 'tsoa'
import { CalculationService } from '../services/calculation.service'
import { InvoicesService } from '../services'
import { APIInvoice, CreateInvoicePayload, Invoice, UpdateInvoicePayload, QueryPayload, QueryResult, APIQueryPayload } from '../models'

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
  public async create(@Body() invoice: CreateInvoicePayload): Promise<APIInvoice> {
    const createdInvoice = await this.invoicesService.create(invoice)

    return APIInvoice.fromEntity(createdInvoice)
  }

  @Put(':id')
  @OperationId('Update Invoice')
  @SuccessResponse(200, 'Invoice updated')
  @Response(404, 'Invoice not found')
  @Response(400, 'Invalid payload')
  public async update(@Path('id') id: string, @Body() invoice: UpdateInvoicePayload): Promise<APIInvoice> {
    const updatedInvoice = await this.invoicesService.update(id, invoice)

    return APIInvoice.fromEntity(updatedInvoice)
  }

  @Delete(':id')
  @OperationId('Delete Invoice')
  @SuccessResponse(204, 'Invoice deleted')
  public async delete(@Path('id') id: string): Promise<void> {
    await this.invoicesService.delete(id)
  }

  @Post('query')
  @OperationId('Query Invoices')
  @SuccessResponse(200, 'Invoices found')
  @Response(400, 'Invalid query')
  public async query(@Body() payload: APIQueryPayload<APIInvoice>): Promise<QueryResult<APIInvoice>> {
    const parseQuery = APIQueryPayload.toQuery<Invoice>(payload)

    const cursor = await this.invoicesService.query(parseQuery)

    const items = await cursor.items();

    return {
      items: items.map(APIInvoice.fromEntity),
      hasMore: await cursor.hasNext(),
      totalCount: await cursor.totalCount()
    }
  }

}