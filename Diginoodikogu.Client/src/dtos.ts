/* Options:
Date: 2024-02-28 19:40:08
Version: 8.13
Tip: To override a DTO option, remove "//" prefix before updating
BaseUrl: https://localhost:5001

//GlobalNamespace: 
//MakePropertiesOptional: False
//AddServiceStackTypes: True
//AddResponseStatus: False
//AddImplicitVersion: 
//AddDescriptionAsComments: True
//IncludeTypes: 
//ExcludeTypes: 
//DefaultImports: 
*/

// @ts-nocheck

export interface IReturn<T> {
  createResponse(): T
}

export interface IReturnVoid {
  createResponse(): void
}

export interface IGet {}

export interface IHasSessionId {
  sessionId?: string
}

export interface IHasBearerToken {
  bearerToken?: string
}

export interface IPost {}

export interface IPut {}

export interface IDelete {}

// @DataContract
export class QueryBase {
  // @DataMember(Order=1)
  public skip?: number

  // @DataMember(Order=2)
  public take?: number

  // @DataMember(Order=3)
  public orderBy: string

  // @DataMember(Order=4)
  public orderByDesc: string

  // @DataMember(Order=5)
  public include: string

  // @DataMember(Order=6)
  public fields: string

  // @DataMember(Order=7)
  public meta: { [index: string]: string }

  public constructor(init?: Partial<QueryBase>) {
    ;(Object as any).assign(this, init)
  }
}

export class QueryData<T> extends QueryBase {
  // @DataMember(Order=1)
  public skip?: number

  // @DataMember(Order=2)
  public take?: number

  // @DataMember(Order=3)
  public orderBy: string

  // @DataMember(Order=4)
  public orderByDesc: string

  // @DataMember(Order=5)
  public include: string

  // @DataMember(Order=6)
  public fields: string

  // @DataMember(Order=7)
  public meta: { [index: string]: string }

  public constructor(init?: Partial<QueryData<T>>) {
    super(init)
    ;(Object as any).assign(this, init)
  }
}

export class QueryDb<T> extends QueryBase {
  // @DataMember(Order=1)
  public skip?: number

  // @DataMember(Order=2)
  public take?: number

  // @DataMember(Order=3)
  public orderBy: string

  // @DataMember(Order=4)
  public orderByDesc: string

  // @DataMember(Order=5)
  public include: string

  // @DataMember(Order=6)
  public fields: string

  // @DataMember(Order=7)
  public meta: { [index: string]: string }

  public constructor(init?: Partial<QueryDb<T>>) {
    super(init)
    ;(Object as any).assign(this, init)
  }
}

// @DataContract
export class QueryResponse<T> {
  // @DataMember(Order=1)
  public offset: number

  // @DataMember(Order=2)
  public total: number

  // @DataMember(Order=3)
  public results: T[]

  // @DataMember(Order=4)
  public meta: { [index: string]: string }

  // @DataMember(Order=5)
  public responseStatus: ResponseStatus

  public constructor(init?: Partial<QueryResponse<T>>) {
    ;(Object as any).assign(this, init)
  }
}

// @DataContract
export class AuditBase {
  // @DataMember(Order=1)
  public createdDate: string

  // @DataMember(Order=2)
  // @Required()
  public createdBy: string

  // @DataMember(Order=3)
  public modifiedDate: string

  // @DataMember(Order=4)
  // @Required()
  public modifiedBy: string

  // @DataMember(Order=5)
  public deletedDate?: string

  // @DataMember(Order=6)
  public deletedBy: string

  public constructor(init?: Partial<AuditBase>) {
    ;(Object as any).assign(this, init)
  }
}

/** @description Kogumikud */
export class Kogumik {
  public nimi: string
}

/** @description Variatsioonid */
export class Variatsioon extends AuditBase {
  public id: string
  // @Required()
  public nimetus: string
  public musicXml?: string
  public chordPro?: string
  // @Required()
  // @ForeignKey("typeof(Diginoodikogu.ServiceModel.Laul)")
  public laulId: number
  // @Required()
  public helistik: string
  // @DataMember(Order=1)
  public createdDate: string

  // @DataMember(Order=2)
  // @Required()
  public createdBy: string

  // @DataMember(Order=3)
  public modifiedDate: string

  // @DataMember(Order=4)
  // @Required()
  public modifiedBy: string

  // @DataMember(Order=5)
  public deletedDate?: string

  // @DataMember(Order=6)
  public deletedBy: string

  public constructor(init?: Partial<Variatsioon>) {
    ;(Object as any).assign(this, init)
  }
}

/** @description Laulud */
export class Laul extends AuditBase {
  public id: string
  // @Required()
  public nimi: string
  public sonad?: string
  public viis?: string
  public kogumikud: string[]
  public musicXml?: string
  public chordPro?: string
  // @Required()
  public helistik: string
  // @Reference
  public variatsioonid: Variatsioon[]

  // @DataMember(Order=1)
  public createdDate: string

  // @DataMember(Order=2)
  // @Required()
  public createdBy: string

  // @DataMember(Order=3)
  public modifiedDate: string

  // @DataMember(Order=4)
  // @Required()
  public modifiedBy: string

  // @DataMember(Order=5)
  public deletedDate?: string

  // @DataMember(Order=6)
  public deletedBy: string

  public constructor(init?: Partial<Laul>) {
    ;(Object as any).assign(this, init)
  }
}

/** @description Laulude pärimine */
// @Route("/laulud", "GET")
// @Route("/laul/{Id}", "GET")
// @ValidateRequest(Validator="HasRole(`Kasutaja`)")
export class QueryLaulud
  extends QueryDb<Laul>
  implements IReturn<QueryResponse<Laul>>
{
  public id?: string

  public constructor(init?: Partial<QueryLaulud>) {
    super(init)
    ;(Object as any).assign(this, init)
  }
  public getTypeName() {
    return 'QueryLaulud'
  }
  public getMethod() {
    return 'GET'
  }
  public createResponse() {
    return new QueryResponse<Laul>()
  }
}

/** @description Create a new Laul */
// @Route("/laul", "POST")
// @ValidateRequest(Validator="HasRole(`Sisestaja`)")
export class CreateLaul implements IReturn<IdResponse>, ICreateDb<Laul> {
  // @Required()
  public nimi: string
  public sonad?: string
  public viis?: string
  public kogumikud: string[]
  public musicXml?: string
  public chordPro?: string
  public helistik: string

  public constructor(init?: Partial<CreateLaul>) {
    ;(Object as any).assign(this, init)
  }
  public getTypeName() {
    return 'CreateLaul'
  }
  public getMethod() {
    return 'POST'
  }
  public createResponse() {
    return new IdResponse()
  }
}

/** @description Update an existing Laul */
// @Route("/laul/{Id}", "PATCH")
// @ValidateRequest(Validator="HasRole(`Sisestaja`)")
export class UpdateLaul implements IReturn<IdResponse>, IPatchDb<Laul> {
  // @Required()
  public id: string
  // @Required()
  public nimi: string
  public sonad?: string
  public viis?: string
  public kogumikud: string[]
  public musicXml?: string
  public chordPro?: string
  // @Required()
  public helistik: string

  public constructor(init?: Partial<UpdateLaul>) {
    ;(Object as any).assign(this, init)
  }
  public getTypeName() {
    return 'UpdateLaul'
  }
  public getMethod() {
    return 'PATCH'
  }
  public createResponse() {
    return new IdResponse()
  }
}

/** @description Delete Laul */
// @Route("/laul/{Id}", "DELETE")
// @ValidateRequest(Validator="HasRole(`Sisestaja`)")
export class DeleteLaul implements IReturnVoid, IDeleteDb<Laul> {
  public id: string

  public constructor(init?: Partial<DeleteLaul>) {
    ;(Object as any).assign(this, init)
  }
  public getTypeName() {
    return 'DeleteLaul'
  }
  public getMethod() {
    return 'DELETE'
  }
  public createResponse() {}
}

/** @description Variatsioonide pärimine */
// @Route("/variatsioon", "GET")
// @Route("/variatsioon/{Id}", "GET")
// @ValidateRequest(Validator="HasRole(`Kasutaja`)")
export class QueryVariatsioonid
  extends QueryDb<Laul>
  implements IReturn<QueryResponse<Variatsioon>>
{
  public id?: string
  // @Required()
  // @ForeignKey(typeof(Laul))
  public laulId: string

  public constructor(init?: Partial<QueryVariatsioonid>) {
    super(init)
    ;(Object as any).assign(this, init)
  }
  public getTypeName() {
    return 'QueryVariatsioonid'
  }
  public getMethod() {
    return 'GET'
  }
  public createResponse() {
    return new QueryResponse<Laul>()
  }
}

/** @description Create a new variatsioon */
// @Route("/variatsioon", "POST")
// @ValidateRequest(Validator="HasRole(`Sisestaja`)")
export class CreateVariatsioon
  implements IReturn<IdResponse>, ICreateDb<Variatsioon>
{
  // @Required()
  public nimetus: string
  // @Required()
  // @References(typeof(Laul))
  public laulId: string
  public musicXml?: string
  public chordPro?: string
  // @Required()
  public helistik: string

  public constructor(init?: Partial<CreateVariatsioon>) {
    ;(Object as any).assign(this, init)
  }
  public getTypeName() {
    return 'CreateVariatsioon'
  }
  public getMethod() {
    return 'POST'
  }
  public createResponse() {
    return new IdResponse()
  }
}

/** @description Update an existing Variatsioon */
// @Route("/variatsioon/{Id}", "PATCH")
// @ValidateRequest(Validator="HasRole(`Sisestaja`)")
export class UpdateVariatsioon
  implements IReturn<IdResponse>, IPatchDb<Variatsioon>
{
  // @Required()
  public id: string
  // @Required()
  public nimetus: string
  // @Required()
  // @References(typeof(Laul))
  public laulId: string
  public musicXml?: string
  public chordPro?: string
  // @Required()
  public helistik: string

  public constructor(init?: Partial<UpdateVariatsioon>) {
    ;(Object as any).assign(this, init)
  }
  public getTypeName() {
    return 'UpdateVariatsioon'
  }
  public getMethod() {
    return 'PATCH'
  }
  public createResponse() {
    return new IdResponse()
  }
}

/** @description Delete Variatsioon */
// @Route("/variatsioon/{Id}", "DELETE")
// @ValidateRequest(Validator="HasRole(`Sisestaja`)")
export class DeleteVariatsioon implements IReturnVoid, IDeleteDb<Variatsioon> {
  public id: string

  public constructor(init?: Partial<DeleteVariatsioon>) {
    ;(Object as any).assign(this, init)
  }
  public getTypeName() {
    return 'DeleteVariatsioon'
  }
  public getMethod() {
    return 'DELETE'
  }
  public createResponse() {}
}

/** @description Laulude pärimine */
// @Route("/kogumik", "GET")
// @ValidateRequest(Validator="HasRole(`Kasutaja`)")
export class QueryKogumikud
  extends QueryDb<Kogumik>
  implements IReturn<QueryResponse<Kogumik>>
{
  public constructor(init?: Partial<QueryKogumikud>) {
    super(init)
    ;(Object as any).assign(this, init)
  }
  public getTypeName() {
    return 'QueryKogumikud'
  }
  public getMethod() {
    return 'GET'
  }
  public createResponse() {
    return new QueryResponse<Kogumik>()
  }
}

/** @description Create a new variatsioon */
// @Route("/variatsioon", "POST")
// @ValidateRequest(Validator="HasRole(`Sisestaja`)")
export class CreateKogumik implements IReturn<IdResponse>, ICreateDb<Kogumik> {
  // @Required()
  public nimi: string

  public constructor(init?: Partial<CreateKogumik>) {
    ;(Object as any).assign(this, init)
  }
  public getTypeName() {
    return 'CreateKogumik'
  }
  public getMethod() {
    return 'POST'
  }
  public createResponse() {
    return new IdResponse()
  }
}

export class PageStats {
  public label: string
  public total: number

  public constructor(init?: Partial<PageStats>) {
    ;(Object as any).assign(this, init)
  }
}

// @DataContract
export class ResponseError {
  // @DataMember(Order=1)
  public errorCode: string

  // @DataMember(Order=2)
  public fieldName: string

  // @DataMember(Order=3)
  public message: string

  // @DataMember(Order=4)
  public meta: { [index: string]: string }

  public constructor(init?: Partial<ResponseError>) {
    ;(Object as any).assign(this, init)
  }
}

// @DataContract
export class ResponseStatus {
  // @DataMember(Order=1)
  public errorCode: string

  // @DataMember(Order=2)
  public message: string

  // @DataMember(Order=3)
  public stackTrace: string

  // @DataMember(Order=4)
  public errors: ResponseError[]

  // @DataMember(Order=5)
  public meta: { [index: string]: string }

  public constructor(init?: Partial<ResponseStatus>) {
    ;(Object as any).assign(this, init)
  }
}

export class AdminDataResponse {
  public pageStats: PageStats[]

  public constructor(init?: Partial<AdminDataResponse>) {
    ;(Object as any).assign(this, init)
  }
}

// @DataContract
export class RegisterResponse implements IHasSessionId, IHasBearerToken {
  // @DataMember(Order=1)
  public userId: string

  // @DataMember(Order=2)
  public sessionId: string

  // @DataMember(Order=3)
  public userName: string

  // @DataMember(Order=4)
  public referrerUrl: string

  // @DataMember(Order=5)
  public bearerToken: string

  // @DataMember(Order=6)
  public refreshToken: string

  // @DataMember(Order=7)
  public refreshTokenExpiry?: string

  // @DataMember(Order=8)
  public roles: string[]

  // @DataMember(Order=9)
  public permissions: string[]

  // @DataMember(Order=10)
  public redirectUrl: string

  // @DataMember(Order=11)
  public responseStatus: ResponseStatus

  // @DataMember(Order=12)
  public meta: { [index: string]: string }

  public constructor(init?: Partial<RegisterResponse>) {
    ;(Object as any).assign(this, init)
  }
}

// @DataContract
export class AuthenticateResponse implements IHasSessionId, IHasBearerToken {
  // @DataMember(Order=1)
  public userId: string

  // @DataMember(Order=2)
  public sessionId: string

  // @DataMember(Order=3)
  public userName: string

  // @DataMember(Order=4)
  public displayName: string

  // @DataMember(Order=5)
  public referrerUrl: string

  // @DataMember(Order=6)
  public bearerToken: string

  // @DataMember(Order=7)
  public refreshToken: string

  // @DataMember(Order=8)
  public refreshTokenExpiry?: string

  // @DataMember(Order=9)
  public profileUrl: string

  // @DataMember(Order=10)
  public roles: string[]

  // @DataMember(Order=11)
  public permissions: string[]

  // @DataMember(Order=12)
  public responseStatus: ResponseStatus

  // @DataMember(Order=13)
  public meta: { [index: string]: string }

  public constructor(init?: Partial<AuthenticateResponse>) {
    ;(Object as any).assign(this, init)
  }
}

// @DataContract
export class IdResponse {
  // @DataMember(Order=1)
  public id: string

  // @DataMember(Order=2)
  public responseStatus: ResponseStatus

  public constructor(init?: Partial<IdResponse>) {
    ;(Object as any).assign(this, init)
  }
}

export class AdminData implements IReturn<AdminDataResponse>, IGet {
  public constructor(init?: Partial<AdminData>) {
    ;(Object as any).assign(this, init)
  }
  public getTypeName() {
    return 'AdminData'
  }
  public getMethod() {
    return 'GET'
  }
  public createResponse() {
    return new AdminDataResponse()
  }
}

/** @description Sign Up */
// @Api(Description="Sign Up")
// @DataContract
export class Register implements IReturn<RegisterResponse>, IPost {
  // @DataMember(Order=1)
  public userName: string

  // @DataMember(Order=2)
  public firstName: string

  // @DataMember(Order=3)
  public lastName: string

  // @DataMember(Order=4)
  public displayName: string

  // @DataMember(Order=5)
  public email: string

  // @DataMember(Order=6)
  public password: string

  // @DataMember(Order=7)
  public confirmPassword: string

  // @DataMember(Order=8)
  public autoLogin?: boolean

  // @DataMember(Order=10)
  public errorView: string

  // @DataMember(Order=11)
  public meta: { [index: string]: string }

  public constructor(init?: Partial<Register>) {
    ;(Object as any).assign(this, init)
  }
  public getTypeName() {
    return 'Register'
  }
  public getMethod() {
    return 'POST'
  }
  public createResponse() {
    return new RegisterResponse()
  }
}

// @Route("/confirm-email")
export class ConfirmEmail implements IReturnVoid, IGet {
  public userId: string
  public code: string
  public returnUrl?: string

  public constructor(init?: Partial<ConfirmEmail>) {
    ;(Object as any).assign(this, init)
  }
  public getTypeName() {
    return 'ConfirmEmail'
  }
  public getMethod() {
    return 'GET'
  }
  public createResponse() {}
}

/** @description Sign In */
// @Route("/auth", "GET,POST")
// @Route("/auth/{provider}", "POST")
// @Api(Description="Sign In")
// @DataContract
export class Authenticate implements IReturn<AuthenticateResponse>, IPost {
  /** @description AuthProvider, e.g. credentials */
  // @DataMember(Order=1)
  public provider: string

  // @DataMember(Order=2)
  public userName: string

  // @DataMember(Order=3)
  public password: string

  // @DataMember(Order=4)
  public rememberMe?: boolean

  // @DataMember(Order=5)
  public accessToken: string

  // @DataMember(Order=6)
  public accessTokenSecret: string

  // @DataMember(Order=7)
  public returnUrl: string

  // @DataMember(Order=8)
  public errorView: string

  // @DataMember(Order=9)
  public meta: { [index: string]: string }

  public constructor(init?: Partial<Authenticate>) {
    ;(Object as any).assign(this, init)
  }
  public getTypeName() {
    return 'Authenticate'
  }
  public getMethod() {
    return 'POST'
  }
  public createResponse() {
    return new AuthenticateResponse()
  }
}
