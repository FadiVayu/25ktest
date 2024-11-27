import { ObjectId } from 'mongodb'
import { MongoEntity } from '../../mongo'
import { uniq } from 'lodash'

export class Customer extends MongoEntity {
    public name!: string
    public accountId!: ObjectId
    public aliases: string[] = []
    public externalId!: string
    public metadata!: Record<string, any>

    constructor(obj: Partial<Customer>) {
        super()
        this.assign(obj)

        this.accountId = new ObjectId(obj.accountId)
        this.aliases = obj.aliases ? uniq([...obj.aliases, this.externalId]) : [this.externalId]
        this.metadata = obj.metadata ?? {}
    }
}

export interface CreateCustomerPayload {
    name: string
    accountId: string
    externalId: string
    metadata?: Record<string, any>
    aliases?: string[]
}