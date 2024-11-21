import { ObjectId } from "mongodb";
import { Product } from "../models";
import { Mongo, Redis } from "../shared";

export class ProductsService {

    public async getByName(accountId: ObjectId | string, name: string): Promise<Product | null> {
        const key = `products.accountId.${accountId}.name.${name}`
        const cached = await Redis.get(key, (data) => new Product(data))
        if (cached) {
            return cached
        }

        const result = await Mongo.products.findOne({
            accountId: new ObjectId(accountId),
            name
        });

        if (!result) {
            return null
        }

        await Redis.set(key, result)
        return new Product(result);
    }

    public async getById(accountId: ObjectId | string, id: ObjectId | string): Promise<Product | null> {
        const key = `products.accountId.${accountId}.id.${id}`
        const cached = await Redis.get(key, (data) => new Product(data))
        if (cached) {
            return cached
        }

        const result = await Mongo.products.findOne({
            accountId: new ObjectId(accountId),
            _id: new ObjectId(id)
        });

        if (!result) {
            return null
        }

        await Redis.set(key, result)
        return new Product(result);
    }

    public async getManyByIds(accountId: ObjectId | string, ids: (ObjectId | string)[]): Promise<Product[] | null> {
        const key = `products.accountId.${accountId}.ids.${ids.join(',')}`
        const cached = await Redis.get<Product[]>(key)
        if (cached) {
            return cached.map(product => new Product(product))
        }

        const result = await Mongo.products.find({
            accountId: new ObjectId(accountId),
            _id: { $in: ids.map(id => new ObjectId(id)) }
        }).toArray();

        if (!result) {
            return null;
        }

        await Redis.set(key, result)
        return result.map(product => new Product(product));
    }
}