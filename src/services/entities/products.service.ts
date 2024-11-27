import { ObjectId } from "mongodb";
import { APIError, CreateProductPayload, Cursor, Product, ProductRevision, QueryPayload, ReviseProductPayload, UpdateProductPayload } from "../../models";
import { Mongo, Redis } from "../../shared";

export class ProductsService {
    public async get(id: ObjectId | string): Promise<Product> {
        const parsedId = new ObjectId(id)

        const key = `products:${parsedId.toHexString()}`
        const cached = await Redis.get<Product>(key, (data) => new Product(data))
        if (cached) {
            return cached
        }

        const result = await Mongo.products.findOne({
            _id: parsedId
        });

        if (!result) {
            throw new APIError('Product not found', 404)
        }

        await Redis.set(key, result)
        return new Product(result);
    }

    public async create(product: CreateProductPayload): Promise<Product> {
        const validatedPayload = Product.validateCreate(product)
        const newProduct = new Product(validatedPayload)

        const createdResult = await Mongo.products.insertOne(newProduct)

        return this.get(createdResult.insertedId)
    }

    public async update(id: string | ObjectId, payload: UpdateProductPayload): Promise<Product> {
        const parsedId = new ObjectId(id)
        const validatedPayload = Product.validateUpdate(payload)
        const key = `products:${parsedId.toHexString()}`

        const result = await Mongo.products.findOneAndUpdate(
            { _id: parsedId },
            {
                $set: validatedPayload
            }
        )

        if (!result) {
            throw new APIError('Product not found', 404)
        }

        await Redis.invalidate(key)

        return this.get(parsedId);
    }

    public async revise(id: string | ObjectId, payload: ReviseProductPayload): Promise<Product> {
        const parsedId = new ObjectId(id)
        const key = `products:${parsedId.toHexString()}`

        const result = await Mongo.products.findOneAndUpdate(
            { _id: parsedId },
            {
                $push: {
                    revisions: Object.assign({ revisionId: new ObjectId() }, payload)
                }
            }
        )

        if (!result) {
            throw new APIError('Product not found', 404)
        }

        await Redis.invalidate(key)

        return this.get(parsedId);
    }

    public async delete(id: string | ObjectId): Promise<void> {
        const parsedId = new ObjectId(id)

        const key = `products:${parsedId.toHexString()}`
        const result = await Mongo.products.deleteOne({ _id: parsedId })

        if (result.deletedCount === 0) {
            return // do not indicate errors to not expose internal state
        }

        await Redis.invalidate(key)
    }

    public async query({ filter, page, pageSize, sort }: QueryPayload<Product>): Promise<Cursor<Product>> {
        const query = Mongo.products.find(filter ?? {})

        if (page) {
            query.skip(page)
        }
        if (pageSize) {
            query.limit(pageSize)
        }

        if (sort) {
            query.sort(sort)
        }

        return new Cursor<Product>(query, (data) => new Product(data))
    }
}