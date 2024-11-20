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
}