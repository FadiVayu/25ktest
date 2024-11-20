import { ObjectId } from "mongodb"

export class MongoEntity {
    public _id!: ObjectId
    public createdAt!: Date
    public updatedAt!: Date

    constructor(entity: Partial<MongoEntity>) {
        Object.assign(this, entity)
        this._id = new ObjectId(entity._id)
        this.createdAt = entity.createdAt ?? new Date()
        this.updatedAt = entity.updatedAt ?? new Date()
    }
}