import { Customer } from "../../entities"


export class APICustomer {
  /** 
   * ID 
   * @isString
   */
  public id!: string
  /** 
   * Name 
   * @isString
   */
  public name!: string
  /** 
   * Account ID 
   * 
   * @isString
   */
  public accountId!: string
  /** 
   * Aliases 
   * 
   * @isArray
   */
  public aliases: string[] = []
  /** 
   * External ID 
   * 
   * @isString
   */
  public externalId!: string
  public metadata!: Record<string, any>
  /** 
   * Created At 
   * @isDate
   */
  public createdAt!: Date
  /** 
   * Updated At 
   * @isDate
   */
  public updatedAt!: Date

  public static fromEntity(entity: Customer): APICustomer {
    return new APICustomer({
      id: entity._id.toHexString(),
      name: entity.name,
      accountId: entity.accountId.toHexString(),
      aliases: entity.aliases,
      externalId: entity.externalId,
      metadata: entity.metadata,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    })
  }

  constructor(obj: Partial<Customer> | Partial<APICustomer>) {
    Object.assign(this, obj)
  }
}