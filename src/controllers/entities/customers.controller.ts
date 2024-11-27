import { Controller, Route, Get, Path, Tags, SuccessResponse, OperationId, Response, Post, Put, Delete, Body, } from 'tsoa'
import { CustomersService, CalculationService } from '../../services'
import { APICustomer, CreateCustomerPayload, Customer, UpdateCustomerPayload, QueryPayload, QueryResult, APIQueryPayload } from '../../models'

@Route('/customers')
@Tags('Customers')
export class CustomersController extends Controller {
  private customersService: CustomersService

  constructor() {
    super()
    this.customersService = new CustomersService()
  }

  @Get(':id')
  @OperationId('Get Customer')
  @SuccessResponse(200, 'Customer found')
  @Response(404, 'Customer not found')
  public async get(@Path('id') id: string): Promise<APICustomer> {
    const customer = await this.customersService.get(id)

    return APICustomer.fromEntity(customer)
  }

  @Post('/')
  @OperationId('Create Customer')
  @SuccessResponse(201, 'Customer created')
  @Response(400, 'Invalid payload')
  public async create(@Body() customer: CreateCustomerPayload): Promise<APICustomer> {
    const createdCustomer = await this.customersService.create(customer)

    return APICustomer.fromEntity(createdCustomer)
  }

  @Put(':id')
  @OperationId('Update Customer')
  @SuccessResponse(200, 'Customer updated')
  @Response(404, 'Customer not found')
  @Response(400, 'Invalid payload')
  public async update(@Path('id') id: string, @Body() customer: UpdateCustomerPayload): Promise<APICustomer> {
    const updatedCustomer = await this.customersService.update(id, customer)

    return APICustomer.fromEntity(updatedCustomer)
  }

  @Delete(':id')
  @OperationId('Delete Customer')
  @SuccessResponse(204, 'Customer deleted')
  public async delete(@Path('id') id: string): Promise<void> {
    await this.customersService.delete(id)
  }

  @Post('query')
  @OperationId('Query Customers')
  @SuccessResponse(200, 'Customers found')
  @Response(400, 'Invalid query')
  public async query(@Body() payload: APIQueryPayload<APICustomer>): Promise<QueryResult<APICustomer>> {
    const parseQuery = APIQueryPayload.toQuery<Customer>(payload)

    const cursor = await this.customersService.query(parseQuery)

    const items = await cursor.items();

    return {
      items: items.map(APICustomer.fromEntity),
      hasMore: await cursor.hasNext(),
      totalCount: await cursor.totalCount()
    }
  }

}