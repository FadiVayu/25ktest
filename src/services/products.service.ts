import { ObjectId } from "mongodb";
import { Product } from "../models";
import { Mongo, Redis } from "../shared";
import { parse } from "dotenv";

export class ProductsService {
    public async getByName(accountId: ObjectId | string, name: string): Promise<Product | null> {
        const parsedAccountId = new ObjectId(accountId)

        const key = `products:${parsedAccountId.toHexString()}.${name}`
        const cached = await Redis.get<Product>(key, (data) => new Product(data))
        if (cached) {
            return cached
        }

        const result = await Mongo.products.findOne({
            accountId: parsedAccountId,
            name
        });

        if (!result) {
            return null
        }

        await Redis.set(key, result)
        return new Product(result);
    }

    public async getById(accountId: ObjectId | string, id: ObjectId | string): Promise<Product | null> {
        const parsedAccountId = new ObjectId(accountId)
        const parsedId = new ObjectId(id)

        const key = `products:${parsedAccountId.toHexString()}.${parsedId.toHexString()}`
        const cached = await Redis.get<Product>(key, (data) => new Product(data))
        if (cached) {
            return cached
        }

        const result = await Mongo.products.findOne({
            accountId: parsedAccountId,
            _id: parsedId
        });

        if (!result) {
            return null
        }

        await Redis.set(key, result)
        return new Product(result);
    }

    public async getManyByIds(accountId: ObjectId | string, ids: (ObjectId | string)[]): Promise<Product[] | null> {
        const parsedAccountId = new ObjectId(accountId)
        const parsedIds = ids.map(id => new ObjectId(id))

        const key = `products:${parsedAccountId.toHexString()}.${parsedIds.map(id => id.toHexString()).join(',')}`
        const cached = await Redis.get<Product[]>(key, (data) => data.map(product => new Product(product ?? {})));
        if (cached) {
            return cached
        }

        const result = await Mongo.products.find({
            accountId: parsedAccountId,
            _id: { $in: parsedIds }
        }).toArray();

        if (!result) {
            return null;
        }

        await Redis.set(key, result)
        return result.map(product => new Product(product));
    }
}