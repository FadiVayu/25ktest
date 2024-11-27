import { Controller, Route, Get, Path, Tags, SuccessResponse, OperationId, Response, Post, Put, Delete, Body, } from 'tsoa'
import { ProductsService } from '../../services'
import { APIProduct, CreateProductPayload, Product, UpdateProductPayload, QueryPayload, QueryResult, APIQueryPayload, ReviseProductPayload } from '../../models'

@Route('/products')
@Tags('Products')
export class ProductsController extends Controller {
  private productsService: ProductsService

  constructor() {
    super()
    this.productsService = new ProductsService()
  }

  @Get(':id')
  @OperationId('Get Product')
  @SuccessResponse(200, 'Product found')
  @Response(404, 'Product not found')
  public async get(@Path('id') id: string): Promise<APIProduct> {
    const product = await this.productsService.get(id)

    return APIProduct.fromEntity(product)
  }

  @Post('/')
  @OperationId('Create Product')
  @SuccessResponse(201, 'Product created')
  @Response(400, 'Invalid payload')
  public async create(@Body() product: CreateProductPayload): Promise<APIProduct> {
    const createdProduct = await this.productsService.create(product)

    return APIProduct.fromEntity(createdProduct)
  }

  @Put(':id')
  @OperationId('Update Product')
  @SuccessResponse(200, 'Product updated')
  @Response(404, 'Product not found')
  @Response(400, 'Invalid payload')
  public async update(@Path('id') id: string, @Body() product: UpdateProductPayload): Promise<APIProduct> {
    const updatedProduct = await this.productsService.update(id, product)

    return APIProduct.fromEntity(updatedProduct)
  }

  @Post(':id/revise')
  @OperationId('Revise a Product')
  @SuccessResponse(200, 'Product revised')
  @Response(404, 'Product not found')
  @Response(400, 'Invalid payload')
  public async revise(@Path('id') id: string, @Body() revision: ReviseProductPayload): Promise<APIProduct> {
    const updatedProduct = await this.productsService.revise(id, revision)

    return APIProduct.fromEntity(updatedProduct)
  }

  @Delete(':id')
  @OperationId('Delete Product')
  @SuccessResponse(204, 'Product deleted')
  public async delete(@Path('id') id: string): Promise<void> {
    await this.productsService.delete(id)
  }

  @Post('query')
  @OperationId('Query Products')
  @SuccessResponse(200, 'Products found')
  @Response(400, 'Invalid query')
  public async query(@Body() payload: APIQueryPayload<APIProduct>): Promise<QueryResult<APIProduct>> {
    const parseQuery = APIQueryPayload.toQuery<Product>(payload)

    const cursor = await this.productsService.query(parseQuery)

    const items = await cursor.items();

    return {
      items: items.map(APIProduct.fromEntity),
      hasMore: await cursor.hasNext(),
      totalCount: await cursor.totalCount()
    }
  }

}