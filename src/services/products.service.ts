import { ObjectId } from "mongodb";
import { Product } from "../models";
import { Mongo, Redis } from "../shared";

export class ProductsService {
    public get collection() {
        return Mongo.db.collection<Product>('products');
    }

    public async getByName(accountId: ObjectId | string, name: string): Promise<Product | null> {
        const key = `products.accountId.${accountId}.name.${name}`
        const cached = await Redis.get(key)
        if (cached) {
            return new Product(JSON.parse(cached))
        }

        const result = await this.collection.findOne({
            accountId: new ObjectId(accountId),
            name
        });

        if (result) {
            await Redis.set(key, JSON.stringify(result))
        }

        return result ? new Product(result) : null;
    }

    public async getById(accountId: ObjectId | string, id: ObjectId | string): Promise<Product | null> {
        const key = `products.accountId.${accountId}.id.${id}`
        const cached = await Redis.get(key)
        if (cached) {
            return new Product(JSON.parse(cached))
        }

        const result = await this.collection.findOne({
            accountId: new ObjectId(accountId),
            _id: new ObjectId(id)
        });

        if (result) {
            await Redis.set(key, JSON.stringify(result))
        }

        return result ? new Product(result) : null;
    }

    public async getManyByIds(accountId: ObjectId | string, ids: (ObjectId | string)[]): Promise<Product[]> {
        const key = `products.accountId.${accountId}.ids.${ids.join(',')}`
        const cached = await Redis.get(key)
        if (cached) {
            return JSON.parse(cached).map((product: any) => new Product(product))
        }

        const result = await this.collection.find({
            accountId: new ObjectId(accountId),
            _id: { $in: ids.map(id => new ObjectId(id)) }
        }).toArray();

        if (result) {
            await Redis.set(key, JSON.stringify(result))
        }

        return result.map(product => new Product(product));
    }
}