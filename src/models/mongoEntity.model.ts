import { ObjectId } from "mongodb"

export class MongoEntity {
    public _id!: ObjectId
    public createdAt!: Date
    public updatedAt!: Date

    public assign(entity: Partial<MongoEntity>) {
        Object.assign(this, MongoEntity.validate(entity))
    }

    public static validate(entity: Partial<MongoEntity>) {
        entity._id = entity._id ? new ObjectId(entity._id) : new ObjectId()
        entity.createdAt = entity.createdAt ? new Date(entity.createdAt) : new Date()
        entity.updatedAt = entity.updatedAt ? new Date(entity.updatedAt) : new Date()
    }
}