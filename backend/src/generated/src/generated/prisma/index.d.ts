
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Usuario
 * 
 */
export type Usuario = $Result.DefaultSelection<Prisma.$UsuarioPayload>
/**
 * Model Notificacao
 * 
 */
export type Notificacao = $Result.DefaultSelection<Prisma.$NotificacaoPayload>
/**
 * Model Processo
 * 
 */
export type Processo = $Result.DefaultSelection<Prisma.$ProcessoPayload>
/**
 * Model Dependente
 * 
 */
export type Dependente = $Result.DefaultSelection<Prisma.$DependentePayload>
/**
 * Model Requerimento
 * 
 */
export type Requerimento = $Result.DefaultSelection<Prisma.$RequerimentoPayload>
/**
 * Model Documento
 * 
 */
export type Documento = $Result.DefaultSelection<Prisma.$DocumentoPayload>
/**
 * Model Configuracao
 * 
 */
export type Configuracao = $Result.DefaultSelection<Prisma.$ConfiguracaoPayload>
/**
 * Model Agendamento
 * 
 */
export type Agendamento = $Result.DefaultSelection<Prisma.$AgendamentoPayload>
/**
 * Model CatalogoServico
 * 
 */
export type CatalogoServico = $Result.DefaultSelection<Prisma.$CatalogoServicoPayload>
/**
 * Model ServicoRequisito
 * 
 */
export type ServicoRequisito = $Result.DefaultSelection<Prisma.$ServicoRequisitoPayload>
/**
 * Model AssessoriaJuridica
 * 
 */
export type AssessoriaJuridica = $Result.DefaultSelection<Prisma.$AssessoriaJuridicaPayload>
/**
 * Model Apostilamento
 * 
 */
export type Apostilamento = $Result.DefaultSelection<Prisma.$ApostilamentoPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const TipoUsuario: {
  CLIENTE: 'CLIENTE',
  FINANCEIRO: 'FINANCEIRO',
  JURIDICO: 'JURIDICO',
  SUPER_ADMIN: 'SUPER_ADMIN'
};

export type TipoUsuario = (typeof TipoUsuario)[keyof typeof TipoUsuario]


export const StatusDocumento: {
  PENDING: 'PENDING',
  ANALYZING: 'ANALYZING',
  WAITING_APOSTILLE: 'WAITING_APOSTILLE',
  ANALYZING_APOSTILLE: 'ANALYZING_APOSTILLE',
  WAITING_TRANSLATION: 'WAITING_TRANSLATION',
  ANALYZING_TRANSLATION: 'ANALYZING_TRANSLATION',
  WAITING_TRANSLATION_QUOTE: 'WAITING_TRANSLATION_QUOTE',
  WAITING_QUOTE_APPROVAL: 'WAITING_QUOTE_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

export type StatusDocumento = (typeof StatusDocumento)[keyof typeof StatusDocumento]

}

export type TipoUsuario = $Enums.TipoUsuario

export const TipoUsuario: typeof $Enums.TipoUsuario

export type StatusDocumento = $Enums.StatusDocumento

export const StatusDocumento: typeof $Enums.StatusDocumento

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Usuarios
 * const usuarios = await prisma.usuario.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Usuarios
   * const usuarios = await prisma.usuario.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.usuario`: Exposes CRUD operations for the **Usuario** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Usuarios
    * const usuarios = await prisma.usuario.findMany()
    * ```
    */
  get usuario(): Prisma.UsuarioDelegate<ExtArgs>;

  /**
   * `prisma.notificacao`: Exposes CRUD operations for the **Notificacao** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Notificacaos
    * const notificacaos = await prisma.notificacao.findMany()
    * ```
    */
  get notificacao(): Prisma.NotificacaoDelegate<ExtArgs>;

  /**
   * `prisma.processo`: Exposes CRUD operations for the **Processo** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Processos
    * const processos = await prisma.processo.findMany()
    * ```
    */
  get processo(): Prisma.ProcessoDelegate<ExtArgs>;

  /**
   * `prisma.dependente`: Exposes CRUD operations for the **Dependente** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Dependentes
    * const dependentes = await prisma.dependente.findMany()
    * ```
    */
  get dependente(): Prisma.DependenteDelegate<ExtArgs>;

  /**
   * `prisma.requerimento`: Exposes CRUD operations for the **Requerimento** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Requerimentos
    * const requerimentos = await prisma.requerimento.findMany()
    * ```
    */
  get requerimento(): Prisma.RequerimentoDelegate<ExtArgs>;

  /**
   * `prisma.documento`: Exposes CRUD operations for the **Documento** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Documentos
    * const documentos = await prisma.documento.findMany()
    * ```
    */
  get documento(): Prisma.DocumentoDelegate<ExtArgs>;

  /**
   * `prisma.configuracao`: Exposes CRUD operations for the **Configuracao** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Configuracaos
    * const configuracaos = await prisma.configuracao.findMany()
    * ```
    */
  get configuracao(): Prisma.ConfiguracaoDelegate<ExtArgs>;

  /**
   * `prisma.agendamento`: Exposes CRUD operations for the **Agendamento** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Agendamentos
    * const agendamentos = await prisma.agendamento.findMany()
    * ```
    */
  get agendamento(): Prisma.AgendamentoDelegate<ExtArgs>;

  /**
   * `prisma.catalogoServico`: Exposes CRUD operations for the **CatalogoServico** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more CatalogoServicos
    * const catalogoServicos = await prisma.catalogoServico.findMany()
    * ```
    */
  get catalogoServico(): Prisma.CatalogoServicoDelegate<ExtArgs>;

  /**
   * `prisma.servicoRequisito`: Exposes CRUD operations for the **ServicoRequisito** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ServicoRequisitos
    * const servicoRequisitos = await prisma.servicoRequisito.findMany()
    * ```
    */
  get servicoRequisito(): Prisma.ServicoRequisitoDelegate<ExtArgs>;

  /**
   * `prisma.assessoriaJuridica`: Exposes CRUD operations for the **AssessoriaJuridica** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AssessoriaJuridicas
    * const assessoriaJuridicas = await prisma.assessoriaJuridica.findMany()
    * ```
    */
  get assessoriaJuridica(): Prisma.AssessoriaJuridicaDelegate<ExtArgs>;

  /**
   * `prisma.apostilamento`: Exposes CRUD operations for the **Apostilamento** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Apostilamentos
    * const apostilamentos = await prisma.apostilamento.findMany()
    * ```
    */
  get apostilamento(): Prisma.ApostilamentoDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Usuario: 'Usuario',
    Notificacao: 'Notificacao',
    Processo: 'Processo',
    Dependente: 'Dependente',
    Requerimento: 'Requerimento',
    Documento: 'Documento',
    Configuracao: 'Configuracao',
    Agendamento: 'Agendamento',
    CatalogoServico: 'CatalogoServico',
    ServicoRequisito: 'ServicoRequisito',
    AssessoriaJuridica: 'AssessoriaJuridica',
    Apostilamento: 'Apostilamento'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "usuario" | "notificacao" | "processo" | "dependente" | "requerimento" | "documento" | "configuracao" | "agendamento" | "catalogoServico" | "servicoRequisito" | "assessoriaJuridica" | "apostilamento"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Usuario: {
        payload: Prisma.$UsuarioPayload<ExtArgs>
        fields: Prisma.UsuarioFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UsuarioFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UsuarioFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          findFirst: {
            args: Prisma.UsuarioFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UsuarioFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          findMany: {
            args: Prisma.UsuarioFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>[]
          }
          create: {
            args: Prisma.UsuarioCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          createMany: {
            args: Prisma.UsuarioCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UsuarioCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>[]
          }
          delete: {
            args: Prisma.UsuarioDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          update: {
            args: Prisma.UsuarioUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          deleteMany: {
            args: Prisma.UsuarioDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UsuarioUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UsuarioUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UsuarioPayload>
          }
          aggregate: {
            args: Prisma.UsuarioAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUsuario>
          }
          groupBy: {
            args: Prisma.UsuarioGroupByArgs<ExtArgs>
            result: $Utils.Optional<UsuarioGroupByOutputType>[]
          }
          count: {
            args: Prisma.UsuarioCountArgs<ExtArgs>
            result: $Utils.Optional<UsuarioCountAggregateOutputType> | number
          }
        }
      }
      Notificacao: {
        payload: Prisma.$NotificacaoPayload<ExtArgs>
        fields: Prisma.NotificacaoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NotificacaoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificacaoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NotificacaoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificacaoPayload>
          }
          findFirst: {
            args: Prisma.NotificacaoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificacaoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NotificacaoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificacaoPayload>
          }
          findMany: {
            args: Prisma.NotificacaoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificacaoPayload>[]
          }
          create: {
            args: Prisma.NotificacaoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificacaoPayload>
          }
          createMany: {
            args: Prisma.NotificacaoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NotificacaoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificacaoPayload>[]
          }
          delete: {
            args: Prisma.NotificacaoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificacaoPayload>
          }
          update: {
            args: Prisma.NotificacaoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificacaoPayload>
          }
          deleteMany: {
            args: Prisma.NotificacaoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NotificacaoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.NotificacaoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificacaoPayload>
          }
          aggregate: {
            args: Prisma.NotificacaoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNotificacao>
          }
          groupBy: {
            args: Prisma.NotificacaoGroupByArgs<ExtArgs>
            result: $Utils.Optional<NotificacaoGroupByOutputType>[]
          }
          count: {
            args: Prisma.NotificacaoCountArgs<ExtArgs>
            result: $Utils.Optional<NotificacaoCountAggregateOutputType> | number
          }
        }
      }
      Processo: {
        payload: Prisma.$ProcessoPayload<ExtArgs>
        fields: Prisma.ProcessoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProcessoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProcessoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPayload>
          }
          findFirst: {
            args: Prisma.ProcessoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProcessoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPayload>
          }
          findMany: {
            args: Prisma.ProcessoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPayload>[]
          }
          create: {
            args: Prisma.ProcessoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPayload>
          }
          createMany: {
            args: Prisma.ProcessoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProcessoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPayload>[]
          }
          delete: {
            args: Prisma.ProcessoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPayload>
          }
          update: {
            args: Prisma.ProcessoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPayload>
          }
          deleteMany: {
            args: Prisma.ProcessoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProcessoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProcessoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProcessoPayload>
          }
          aggregate: {
            args: Prisma.ProcessoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProcesso>
          }
          groupBy: {
            args: Prisma.ProcessoGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProcessoGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProcessoCountArgs<ExtArgs>
            result: $Utils.Optional<ProcessoCountAggregateOutputType> | number
          }
        }
      }
      Dependente: {
        payload: Prisma.$DependentePayload<ExtArgs>
        fields: Prisma.DependenteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DependenteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DependentePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DependenteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DependentePayload>
          }
          findFirst: {
            args: Prisma.DependenteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DependentePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DependenteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DependentePayload>
          }
          findMany: {
            args: Prisma.DependenteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DependentePayload>[]
          }
          create: {
            args: Prisma.DependenteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DependentePayload>
          }
          createMany: {
            args: Prisma.DependenteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DependenteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DependentePayload>[]
          }
          delete: {
            args: Prisma.DependenteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DependentePayload>
          }
          update: {
            args: Prisma.DependenteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DependentePayload>
          }
          deleteMany: {
            args: Prisma.DependenteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DependenteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DependenteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DependentePayload>
          }
          aggregate: {
            args: Prisma.DependenteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDependente>
          }
          groupBy: {
            args: Prisma.DependenteGroupByArgs<ExtArgs>
            result: $Utils.Optional<DependenteGroupByOutputType>[]
          }
          count: {
            args: Prisma.DependenteCountArgs<ExtArgs>
            result: $Utils.Optional<DependenteCountAggregateOutputType> | number
          }
        }
      }
      Requerimento: {
        payload: Prisma.$RequerimentoPayload<ExtArgs>
        fields: Prisma.RequerimentoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RequerimentoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequerimentoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RequerimentoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequerimentoPayload>
          }
          findFirst: {
            args: Prisma.RequerimentoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequerimentoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RequerimentoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequerimentoPayload>
          }
          findMany: {
            args: Prisma.RequerimentoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequerimentoPayload>[]
          }
          create: {
            args: Prisma.RequerimentoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequerimentoPayload>
          }
          createMany: {
            args: Prisma.RequerimentoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RequerimentoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequerimentoPayload>[]
          }
          delete: {
            args: Prisma.RequerimentoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequerimentoPayload>
          }
          update: {
            args: Prisma.RequerimentoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequerimentoPayload>
          }
          deleteMany: {
            args: Prisma.RequerimentoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RequerimentoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RequerimentoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequerimentoPayload>
          }
          aggregate: {
            args: Prisma.RequerimentoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRequerimento>
          }
          groupBy: {
            args: Prisma.RequerimentoGroupByArgs<ExtArgs>
            result: $Utils.Optional<RequerimentoGroupByOutputType>[]
          }
          count: {
            args: Prisma.RequerimentoCountArgs<ExtArgs>
            result: $Utils.Optional<RequerimentoCountAggregateOutputType> | number
          }
        }
      }
      Documento: {
        payload: Prisma.$DocumentoPayload<ExtArgs>
        fields: Prisma.DocumentoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DocumentoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DocumentoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>
          }
          findFirst: {
            args: Prisma.DocumentoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DocumentoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>
          }
          findMany: {
            args: Prisma.DocumentoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>[]
          }
          create: {
            args: Prisma.DocumentoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>
          }
          createMany: {
            args: Prisma.DocumentoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DocumentoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>[]
          }
          delete: {
            args: Prisma.DocumentoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>
          }
          update: {
            args: Prisma.DocumentoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>
          }
          deleteMany: {
            args: Prisma.DocumentoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DocumentoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DocumentoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DocumentoPayload>
          }
          aggregate: {
            args: Prisma.DocumentoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDocumento>
          }
          groupBy: {
            args: Prisma.DocumentoGroupByArgs<ExtArgs>
            result: $Utils.Optional<DocumentoGroupByOutputType>[]
          }
          count: {
            args: Prisma.DocumentoCountArgs<ExtArgs>
            result: $Utils.Optional<DocumentoCountAggregateOutputType> | number
          }
        }
      }
      Configuracao: {
        payload: Prisma.$ConfiguracaoPayload<ExtArgs>
        fields: Prisma.ConfiguracaoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConfiguracaoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfiguracaoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConfiguracaoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfiguracaoPayload>
          }
          findFirst: {
            args: Prisma.ConfiguracaoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfiguracaoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConfiguracaoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfiguracaoPayload>
          }
          findMany: {
            args: Prisma.ConfiguracaoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfiguracaoPayload>[]
          }
          create: {
            args: Prisma.ConfiguracaoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfiguracaoPayload>
          }
          createMany: {
            args: Prisma.ConfiguracaoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ConfiguracaoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfiguracaoPayload>[]
          }
          delete: {
            args: Prisma.ConfiguracaoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfiguracaoPayload>
          }
          update: {
            args: Prisma.ConfiguracaoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfiguracaoPayload>
          }
          deleteMany: {
            args: Prisma.ConfiguracaoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConfiguracaoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ConfiguracaoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConfiguracaoPayload>
          }
          aggregate: {
            args: Prisma.ConfiguracaoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConfiguracao>
          }
          groupBy: {
            args: Prisma.ConfiguracaoGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConfiguracaoGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConfiguracaoCountArgs<ExtArgs>
            result: $Utils.Optional<ConfiguracaoCountAggregateOutputType> | number
          }
        }
      }
      Agendamento: {
        payload: Prisma.$AgendamentoPayload<ExtArgs>
        fields: Prisma.AgendamentoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AgendamentoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgendamentoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AgendamentoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgendamentoPayload>
          }
          findFirst: {
            args: Prisma.AgendamentoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgendamentoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AgendamentoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgendamentoPayload>
          }
          findMany: {
            args: Prisma.AgendamentoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgendamentoPayload>[]
          }
          create: {
            args: Prisma.AgendamentoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgendamentoPayload>
          }
          createMany: {
            args: Prisma.AgendamentoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AgendamentoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgendamentoPayload>[]
          }
          delete: {
            args: Prisma.AgendamentoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgendamentoPayload>
          }
          update: {
            args: Prisma.AgendamentoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgendamentoPayload>
          }
          deleteMany: {
            args: Prisma.AgendamentoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AgendamentoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AgendamentoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AgendamentoPayload>
          }
          aggregate: {
            args: Prisma.AgendamentoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAgendamento>
          }
          groupBy: {
            args: Prisma.AgendamentoGroupByArgs<ExtArgs>
            result: $Utils.Optional<AgendamentoGroupByOutputType>[]
          }
          count: {
            args: Prisma.AgendamentoCountArgs<ExtArgs>
            result: $Utils.Optional<AgendamentoCountAggregateOutputType> | number
          }
        }
      }
      CatalogoServico: {
        payload: Prisma.$CatalogoServicoPayload<ExtArgs>
        fields: Prisma.CatalogoServicoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.CatalogoServicoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CatalogoServicoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.CatalogoServicoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CatalogoServicoPayload>
          }
          findFirst: {
            args: Prisma.CatalogoServicoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CatalogoServicoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.CatalogoServicoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CatalogoServicoPayload>
          }
          findMany: {
            args: Prisma.CatalogoServicoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CatalogoServicoPayload>[]
          }
          create: {
            args: Prisma.CatalogoServicoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CatalogoServicoPayload>
          }
          createMany: {
            args: Prisma.CatalogoServicoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.CatalogoServicoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CatalogoServicoPayload>[]
          }
          delete: {
            args: Prisma.CatalogoServicoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CatalogoServicoPayload>
          }
          update: {
            args: Prisma.CatalogoServicoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CatalogoServicoPayload>
          }
          deleteMany: {
            args: Prisma.CatalogoServicoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.CatalogoServicoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.CatalogoServicoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$CatalogoServicoPayload>
          }
          aggregate: {
            args: Prisma.CatalogoServicoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCatalogoServico>
          }
          groupBy: {
            args: Prisma.CatalogoServicoGroupByArgs<ExtArgs>
            result: $Utils.Optional<CatalogoServicoGroupByOutputType>[]
          }
          count: {
            args: Prisma.CatalogoServicoCountArgs<ExtArgs>
            result: $Utils.Optional<CatalogoServicoCountAggregateOutputType> | number
          }
        }
      }
      ServicoRequisito: {
        payload: Prisma.$ServicoRequisitoPayload<ExtArgs>
        fields: Prisma.ServicoRequisitoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ServicoRequisitoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicoRequisitoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ServicoRequisitoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicoRequisitoPayload>
          }
          findFirst: {
            args: Prisma.ServicoRequisitoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicoRequisitoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ServicoRequisitoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicoRequisitoPayload>
          }
          findMany: {
            args: Prisma.ServicoRequisitoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicoRequisitoPayload>[]
          }
          create: {
            args: Prisma.ServicoRequisitoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicoRequisitoPayload>
          }
          createMany: {
            args: Prisma.ServicoRequisitoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ServicoRequisitoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicoRequisitoPayload>[]
          }
          delete: {
            args: Prisma.ServicoRequisitoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicoRequisitoPayload>
          }
          update: {
            args: Prisma.ServicoRequisitoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicoRequisitoPayload>
          }
          deleteMany: {
            args: Prisma.ServicoRequisitoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ServicoRequisitoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ServicoRequisitoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ServicoRequisitoPayload>
          }
          aggregate: {
            args: Prisma.ServicoRequisitoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateServicoRequisito>
          }
          groupBy: {
            args: Prisma.ServicoRequisitoGroupByArgs<ExtArgs>
            result: $Utils.Optional<ServicoRequisitoGroupByOutputType>[]
          }
          count: {
            args: Prisma.ServicoRequisitoCountArgs<ExtArgs>
            result: $Utils.Optional<ServicoRequisitoCountAggregateOutputType> | number
          }
        }
      }
      AssessoriaJuridica: {
        payload: Prisma.$AssessoriaJuridicaPayload<ExtArgs>
        fields: Prisma.AssessoriaJuridicaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AssessoriaJuridicaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessoriaJuridicaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AssessoriaJuridicaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessoriaJuridicaPayload>
          }
          findFirst: {
            args: Prisma.AssessoriaJuridicaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessoriaJuridicaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AssessoriaJuridicaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessoriaJuridicaPayload>
          }
          findMany: {
            args: Prisma.AssessoriaJuridicaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessoriaJuridicaPayload>[]
          }
          create: {
            args: Prisma.AssessoriaJuridicaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessoriaJuridicaPayload>
          }
          createMany: {
            args: Prisma.AssessoriaJuridicaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AssessoriaJuridicaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessoriaJuridicaPayload>[]
          }
          delete: {
            args: Prisma.AssessoriaJuridicaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessoriaJuridicaPayload>
          }
          update: {
            args: Prisma.AssessoriaJuridicaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessoriaJuridicaPayload>
          }
          deleteMany: {
            args: Prisma.AssessoriaJuridicaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AssessoriaJuridicaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AssessoriaJuridicaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AssessoriaJuridicaPayload>
          }
          aggregate: {
            args: Prisma.AssessoriaJuridicaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAssessoriaJuridica>
          }
          groupBy: {
            args: Prisma.AssessoriaJuridicaGroupByArgs<ExtArgs>
            result: $Utils.Optional<AssessoriaJuridicaGroupByOutputType>[]
          }
          count: {
            args: Prisma.AssessoriaJuridicaCountArgs<ExtArgs>
            result: $Utils.Optional<AssessoriaJuridicaCountAggregateOutputType> | number
          }
        }
      }
      Apostilamento: {
        payload: Prisma.$ApostilamentoPayload<ExtArgs>
        fields: Prisma.ApostilamentoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ApostilamentoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApostilamentoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ApostilamentoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApostilamentoPayload>
          }
          findFirst: {
            args: Prisma.ApostilamentoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApostilamentoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ApostilamentoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApostilamentoPayload>
          }
          findMany: {
            args: Prisma.ApostilamentoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApostilamentoPayload>[]
          }
          create: {
            args: Prisma.ApostilamentoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApostilamentoPayload>
          }
          createMany: {
            args: Prisma.ApostilamentoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ApostilamentoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApostilamentoPayload>[]
          }
          delete: {
            args: Prisma.ApostilamentoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApostilamentoPayload>
          }
          update: {
            args: Prisma.ApostilamentoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApostilamentoPayload>
          }
          deleteMany: {
            args: Prisma.ApostilamentoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ApostilamentoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ApostilamentoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApostilamentoPayload>
          }
          aggregate: {
            args: Prisma.ApostilamentoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateApostilamento>
          }
          groupBy: {
            args: Prisma.ApostilamentoGroupByArgs<ExtArgs>
            result: $Utils.Optional<ApostilamentoGroupByOutputType>[]
          }
          count: {
            args: Prisma.ApostilamentoCountArgs<ExtArgs>
            result: $Utils.Optional<ApostilamentoCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UsuarioCountOutputType
   */

  export type UsuarioCountOutputType = {
    notificacoes: number
    agendamentos: number
  }

  export type UsuarioCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    notificacoes?: boolean | UsuarioCountOutputTypeCountNotificacoesArgs
    agendamentos?: boolean | UsuarioCountOutputTypeCountAgendamentosArgs
  }

  // Custom InputTypes
  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsuarioCountOutputType
     */
    select?: UsuarioCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountNotificacoesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificacaoWhereInput
  }

  /**
   * UsuarioCountOutputType without action
   */
  export type UsuarioCountOutputTypeCountAgendamentosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgendamentoWhereInput
  }


  /**
   * Count Type ProcessoCountOutputType
   */

  export type ProcessoCountOutputType = {
    documentos: number
  }

  export type ProcessoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    documentos?: boolean | ProcessoCountOutputTypeCountDocumentosArgs
  }

  // Custom InputTypes
  /**
   * ProcessoCountOutputType without action
   */
  export type ProcessoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProcessoCountOutputType
     */
    select?: ProcessoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProcessoCountOutputType without action
   */
  export type ProcessoCountOutputTypeCountDocumentosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DocumentoWhereInput
  }


  /**
   * Count Type DependenteCountOutputType
   */

  export type DependenteCountOutputType = {
    documentos: number
  }

  export type DependenteCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    documentos?: boolean | DependenteCountOutputTypeCountDocumentosArgs
  }

  // Custom InputTypes
  /**
   * DependenteCountOutputType without action
   */
  export type DependenteCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DependenteCountOutputType
     */
    select?: DependenteCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DependenteCountOutputType without action
   */
  export type DependenteCountOutputTypeCountDocumentosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DocumentoWhereInput
  }


  /**
   * Count Type RequerimentoCountOutputType
   */

  export type RequerimentoCountOutputType = {
    documentos: number
  }

  export type RequerimentoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    documentos?: boolean | RequerimentoCountOutputTypeCountDocumentosArgs
  }

  // Custom InputTypes
  /**
   * RequerimentoCountOutputType without action
   */
  export type RequerimentoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequerimentoCountOutputType
     */
    select?: RequerimentoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RequerimentoCountOutputType without action
   */
  export type RequerimentoCountOutputTypeCountDocumentosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DocumentoWhereInput
  }


  /**
   * Count Type CatalogoServicoCountOutputType
   */

  export type CatalogoServicoCountOutputType = {
    requisitos: number
  }

  export type CatalogoServicoCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    requisitos?: boolean | CatalogoServicoCountOutputTypeCountRequisitosArgs
  }

  // Custom InputTypes
  /**
   * CatalogoServicoCountOutputType without action
   */
  export type CatalogoServicoCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CatalogoServicoCountOutputType
     */
    select?: CatalogoServicoCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * CatalogoServicoCountOutputType without action
   */
  export type CatalogoServicoCountOutputTypeCountRequisitosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ServicoRequisitoWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Usuario
   */

  export type AggregateUsuario = {
    _count: UsuarioCountAggregateOutputType | null
    _min: UsuarioMinAggregateOutputType | null
    _max: UsuarioMaxAggregateOutputType | null
  }

  export type UsuarioMinAggregateOutputType = {
    id: string | null
    email: string | null
    nome: string | null
    tipo: $Enums.TipoUsuario | null
    bucketRootPath: string | null
    criadoEm: Date | null
    atualizadoEm: Date | null
  }

  export type UsuarioMaxAggregateOutputType = {
    id: string | null
    email: string | null
    nome: string | null
    tipo: $Enums.TipoUsuario | null
    bucketRootPath: string | null
    criadoEm: Date | null
    atualizadoEm: Date | null
  }

  export type UsuarioCountAggregateOutputType = {
    id: number
    email: number
    nome: number
    tipo: number
    bucketRootPath: number
    criadoEm: number
    atualizadoEm: number
    _all: number
  }


  export type UsuarioMinAggregateInputType = {
    id?: true
    email?: true
    nome?: true
    tipo?: true
    bucketRootPath?: true
    criadoEm?: true
    atualizadoEm?: true
  }

  export type UsuarioMaxAggregateInputType = {
    id?: true
    email?: true
    nome?: true
    tipo?: true
    bucketRootPath?: true
    criadoEm?: true
    atualizadoEm?: true
  }

  export type UsuarioCountAggregateInputType = {
    id?: true
    email?: true
    nome?: true
    tipo?: true
    bucketRootPath?: true
    criadoEm?: true
    atualizadoEm?: true
    _all?: true
  }

  export type UsuarioAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Usuario to aggregate.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Usuarios
    **/
    _count?: true | UsuarioCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UsuarioMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UsuarioMaxAggregateInputType
  }

  export type GetUsuarioAggregateType<T extends UsuarioAggregateArgs> = {
        [P in keyof T & keyof AggregateUsuario]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUsuario[P]>
      : GetScalarType<T[P], AggregateUsuario[P]>
  }




  export type UsuarioGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UsuarioWhereInput
    orderBy?: UsuarioOrderByWithAggregationInput | UsuarioOrderByWithAggregationInput[]
    by: UsuarioScalarFieldEnum[] | UsuarioScalarFieldEnum
    having?: UsuarioScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UsuarioCountAggregateInputType | true
    _min?: UsuarioMinAggregateInputType
    _max?: UsuarioMaxAggregateInputType
  }

  export type UsuarioGroupByOutputType = {
    id: string
    email: string
    nome: string | null
    tipo: $Enums.TipoUsuario
    bucketRootPath: string | null
    criadoEm: Date
    atualizadoEm: Date
    _count: UsuarioCountAggregateOutputType | null
    _min: UsuarioMinAggregateOutputType | null
    _max: UsuarioMaxAggregateOutputType | null
  }

  type GetUsuarioGroupByPayload<T extends UsuarioGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UsuarioGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UsuarioGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UsuarioGroupByOutputType[P]>
            : GetScalarType<T[P], UsuarioGroupByOutputType[P]>
        }
      >
    >


  export type UsuarioSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    nome?: boolean
    tipo?: boolean
    bucketRootPath?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
    notificacoes?: boolean | Usuario$notificacoesArgs<ExtArgs>
    agendamentos?: boolean | Usuario$agendamentosArgs<ExtArgs>
    _count?: boolean | UsuarioCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["usuario"]>

  export type UsuarioSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    nome?: boolean
    tipo?: boolean
    bucketRootPath?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
  }, ExtArgs["result"]["usuario"]>

  export type UsuarioSelectScalar = {
    id?: boolean
    email?: boolean
    nome?: boolean
    tipo?: boolean
    bucketRootPath?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
  }

  export type UsuarioInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    notificacoes?: boolean | Usuario$notificacoesArgs<ExtArgs>
    agendamentos?: boolean | Usuario$agendamentosArgs<ExtArgs>
    _count?: boolean | UsuarioCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UsuarioIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UsuarioPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Usuario"
    objects: {
      notificacoes: Prisma.$NotificacaoPayload<ExtArgs>[]
      agendamentos: Prisma.$AgendamentoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      nome: string | null
      tipo: $Enums.TipoUsuario
      bucketRootPath: string | null
      criadoEm: Date
      atualizadoEm: Date
    }, ExtArgs["result"]["usuario"]>
    composites: {}
  }

  type UsuarioGetPayload<S extends boolean | null | undefined | UsuarioDefaultArgs> = $Result.GetResult<Prisma.$UsuarioPayload, S>

  type UsuarioCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UsuarioFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UsuarioCountAggregateInputType | true
    }

  export interface UsuarioDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Usuario'], meta: { name: 'Usuario' } }
    /**
     * Find zero or one Usuario that matches the filter.
     * @param {UsuarioFindUniqueArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UsuarioFindUniqueArgs>(args: SelectSubset<T, UsuarioFindUniqueArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Usuario that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UsuarioFindUniqueOrThrowArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UsuarioFindUniqueOrThrowArgs>(args: SelectSubset<T, UsuarioFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Usuario that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioFindFirstArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UsuarioFindFirstArgs>(args?: SelectSubset<T, UsuarioFindFirstArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Usuario that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioFindFirstOrThrowArgs} args - Arguments to find a Usuario
     * @example
     * // Get one Usuario
     * const usuario = await prisma.usuario.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UsuarioFindFirstOrThrowArgs>(args?: SelectSubset<T, UsuarioFindFirstOrThrowArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Usuarios that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Usuarios
     * const usuarios = await prisma.usuario.findMany()
     * 
     * // Get first 10 Usuarios
     * const usuarios = await prisma.usuario.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const usuarioWithIdOnly = await prisma.usuario.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UsuarioFindManyArgs>(args?: SelectSubset<T, UsuarioFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Usuario.
     * @param {UsuarioCreateArgs} args - Arguments to create a Usuario.
     * @example
     * // Create one Usuario
     * const Usuario = await prisma.usuario.create({
     *   data: {
     *     // ... data to create a Usuario
     *   }
     * })
     * 
     */
    create<T extends UsuarioCreateArgs>(args: SelectSubset<T, UsuarioCreateArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Usuarios.
     * @param {UsuarioCreateManyArgs} args - Arguments to create many Usuarios.
     * @example
     * // Create many Usuarios
     * const usuario = await prisma.usuario.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UsuarioCreateManyArgs>(args?: SelectSubset<T, UsuarioCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Usuarios and returns the data saved in the database.
     * @param {UsuarioCreateManyAndReturnArgs} args - Arguments to create many Usuarios.
     * @example
     * // Create many Usuarios
     * const usuario = await prisma.usuario.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Usuarios and only return the `id`
     * const usuarioWithIdOnly = await prisma.usuario.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UsuarioCreateManyAndReturnArgs>(args?: SelectSubset<T, UsuarioCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Usuario.
     * @param {UsuarioDeleteArgs} args - Arguments to delete one Usuario.
     * @example
     * // Delete one Usuario
     * const Usuario = await prisma.usuario.delete({
     *   where: {
     *     // ... filter to delete one Usuario
     *   }
     * })
     * 
     */
    delete<T extends UsuarioDeleteArgs>(args: SelectSubset<T, UsuarioDeleteArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Usuario.
     * @param {UsuarioUpdateArgs} args - Arguments to update one Usuario.
     * @example
     * // Update one Usuario
     * const usuario = await prisma.usuario.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UsuarioUpdateArgs>(args: SelectSubset<T, UsuarioUpdateArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Usuarios.
     * @param {UsuarioDeleteManyArgs} args - Arguments to filter Usuarios to delete.
     * @example
     * // Delete a few Usuarios
     * const { count } = await prisma.usuario.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UsuarioDeleteManyArgs>(args?: SelectSubset<T, UsuarioDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Usuarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Usuarios
     * const usuario = await prisma.usuario.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UsuarioUpdateManyArgs>(args: SelectSubset<T, UsuarioUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Usuario.
     * @param {UsuarioUpsertArgs} args - Arguments to update or create a Usuario.
     * @example
     * // Update or create a Usuario
     * const usuario = await prisma.usuario.upsert({
     *   create: {
     *     // ... data to create a Usuario
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Usuario we want to update
     *   }
     * })
     */
    upsert<T extends UsuarioUpsertArgs>(args: SelectSubset<T, UsuarioUpsertArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Usuarios.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioCountArgs} args - Arguments to filter Usuarios to count.
     * @example
     * // Count the number of Usuarios
     * const count = await prisma.usuario.count({
     *   where: {
     *     // ... the filter for the Usuarios we want to count
     *   }
     * })
    **/
    count<T extends UsuarioCountArgs>(
      args?: Subset<T, UsuarioCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UsuarioCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Usuario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UsuarioAggregateArgs>(args: Subset<T, UsuarioAggregateArgs>): Prisma.PrismaPromise<GetUsuarioAggregateType<T>>

    /**
     * Group by Usuario.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsuarioGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UsuarioGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UsuarioGroupByArgs['orderBy'] }
        : { orderBy?: UsuarioGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UsuarioGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsuarioGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Usuario model
   */
  readonly fields: UsuarioFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Usuario.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UsuarioClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    notificacoes<T extends Usuario$notificacoesArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$notificacoesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificacaoPayload<ExtArgs>, T, "findMany"> | Null>
    agendamentos<T extends Usuario$agendamentosArgs<ExtArgs> = {}>(args?: Subset<T, Usuario$agendamentosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgendamentoPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Usuario model
   */ 
  interface UsuarioFieldRefs {
    readonly id: FieldRef<"Usuario", 'String'>
    readonly email: FieldRef<"Usuario", 'String'>
    readonly nome: FieldRef<"Usuario", 'String'>
    readonly tipo: FieldRef<"Usuario", 'TipoUsuario'>
    readonly bucketRootPath: FieldRef<"Usuario", 'String'>
    readonly criadoEm: FieldRef<"Usuario", 'DateTime'>
    readonly atualizadoEm: FieldRef<"Usuario", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Usuario findUnique
   */
  export type UsuarioFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario findUniqueOrThrow
   */
  export type UsuarioFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario findFirst
   */
  export type UsuarioFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Usuarios.
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Usuarios.
     */
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * Usuario findFirstOrThrow
   */
  export type UsuarioFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuario to fetch.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Usuarios.
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Usuarios.
     */
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * Usuario findMany
   */
  export type UsuarioFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter, which Usuarios to fetch.
     */
    where?: UsuarioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Usuarios to fetch.
     */
    orderBy?: UsuarioOrderByWithRelationInput | UsuarioOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Usuarios.
     */
    cursor?: UsuarioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Usuarios from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Usuarios.
     */
    skip?: number
    distinct?: UsuarioScalarFieldEnum | UsuarioScalarFieldEnum[]
  }

  /**
   * Usuario create
   */
  export type UsuarioCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * The data needed to create a Usuario.
     */
    data: XOR<UsuarioCreateInput, UsuarioUncheckedCreateInput>
  }

  /**
   * Usuario createMany
   */
  export type UsuarioCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Usuarios.
     */
    data: UsuarioCreateManyInput | UsuarioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Usuario createManyAndReturn
   */
  export type UsuarioCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Usuarios.
     */
    data: UsuarioCreateManyInput | UsuarioCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Usuario update
   */
  export type UsuarioUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * The data needed to update a Usuario.
     */
    data: XOR<UsuarioUpdateInput, UsuarioUncheckedUpdateInput>
    /**
     * Choose, which Usuario to update.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario updateMany
   */
  export type UsuarioUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Usuarios.
     */
    data: XOR<UsuarioUpdateManyMutationInput, UsuarioUncheckedUpdateManyInput>
    /**
     * Filter which Usuarios to update
     */
    where?: UsuarioWhereInput
  }

  /**
   * Usuario upsert
   */
  export type UsuarioUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * The filter to search for the Usuario to update in case it exists.
     */
    where: UsuarioWhereUniqueInput
    /**
     * In case the Usuario found by the `where` argument doesn't exist, create a new Usuario with this data.
     */
    create: XOR<UsuarioCreateInput, UsuarioUncheckedCreateInput>
    /**
     * In case the Usuario was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UsuarioUpdateInput, UsuarioUncheckedUpdateInput>
  }

  /**
   * Usuario delete
   */
  export type UsuarioDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    /**
     * Filter which Usuario to delete.
     */
    where: UsuarioWhereUniqueInput
  }

  /**
   * Usuario deleteMany
   */
  export type UsuarioDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Usuarios to delete
     */
    where?: UsuarioWhereInput
  }

  /**
   * Usuario.notificacoes
   */
  export type Usuario$notificacoesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notificacao
     */
    select?: NotificacaoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificacaoInclude<ExtArgs> | null
    where?: NotificacaoWhereInput
    orderBy?: NotificacaoOrderByWithRelationInput | NotificacaoOrderByWithRelationInput[]
    cursor?: NotificacaoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: NotificacaoScalarFieldEnum | NotificacaoScalarFieldEnum[]
  }

  /**
   * Usuario.agendamentos
   */
  export type Usuario$agendamentosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agendamento
     */
    select?: AgendamentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgendamentoInclude<ExtArgs> | null
    where?: AgendamentoWhereInput
    orderBy?: AgendamentoOrderByWithRelationInput | AgendamentoOrderByWithRelationInput[]
    cursor?: AgendamentoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AgendamentoScalarFieldEnum | AgendamentoScalarFieldEnum[]
  }

  /**
   * Usuario without action
   */
  export type UsuarioDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
  }


  /**
   * Model Notificacao
   */

  export type AggregateNotificacao = {
    _count: NotificacaoCountAggregateOutputType | null
    _min: NotificacaoMinAggregateOutputType | null
    _max: NotificacaoMaxAggregateOutputType | null
  }

  export type NotificacaoMinAggregateOutputType = {
    id: string | null
    titulo: string | null
    mensagem: string | null
    lida: boolean | null
    tipo: string | null
    dataPrazo: Date | null
    criadoEm: Date | null
    clienteId: string | null
    criadorId: string | null
    usuarioId: string | null
  }

  export type NotificacaoMaxAggregateOutputType = {
    id: string | null
    titulo: string | null
    mensagem: string | null
    lida: boolean | null
    tipo: string | null
    dataPrazo: Date | null
    criadoEm: Date | null
    clienteId: string | null
    criadorId: string | null
    usuarioId: string | null
  }

  export type NotificacaoCountAggregateOutputType = {
    id: number
    titulo: number
    mensagem: number
    lida: number
    tipo: number
    dataPrazo: number
    criadoEm: number
    clienteId: number
    criadorId: number
    usuarioId: number
    _all: number
  }


  export type NotificacaoMinAggregateInputType = {
    id?: true
    titulo?: true
    mensagem?: true
    lida?: true
    tipo?: true
    dataPrazo?: true
    criadoEm?: true
    clienteId?: true
    criadorId?: true
    usuarioId?: true
  }

  export type NotificacaoMaxAggregateInputType = {
    id?: true
    titulo?: true
    mensagem?: true
    lida?: true
    tipo?: true
    dataPrazo?: true
    criadoEm?: true
    clienteId?: true
    criadorId?: true
    usuarioId?: true
  }

  export type NotificacaoCountAggregateInputType = {
    id?: true
    titulo?: true
    mensagem?: true
    lida?: true
    tipo?: true
    dataPrazo?: true
    criadoEm?: true
    clienteId?: true
    criadorId?: true
    usuarioId?: true
    _all?: true
  }

  export type NotificacaoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notificacao to aggregate.
     */
    where?: NotificacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notificacaos to fetch.
     */
    orderBy?: NotificacaoOrderByWithRelationInput | NotificacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NotificacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notificacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notificacaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Notificacaos
    **/
    _count?: true | NotificacaoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NotificacaoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NotificacaoMaxAggregateInputType
  }

  export type GetNotificacaoAggregateType<T extends NotificacaoAggregateArgs> = {
        [P in keyof T & keyof AggregateNotificacao]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNotificacao[P]>
      : GetScalarType<T[P], AggregateNotificacao[P]>
  }




  export type NotificacaoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificacaoWhereInput
    orderBy?: NotificacaoOrderByWithAggregationInput | NotificacaoOrderByWithAggregationInput[]
    by: NotificacaoScalarFieldEnum[] | NotificacaoScalarFieldEnum
    having?: NotificacaoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NotificacaoCountAggregateInputType | true
    _min?: NotificacaoMinAggregateInputType
    _max?: NotificacaoMaxAggregateInputType
  }

  export type NotificacaoGroupByOutputType = {
    id: string
    titulo: string
    mensagem: string
    lida: boolean
    tipo: string
    dataPrazo: Date | null
    criadoEm: Date
    clienteId: string | null
    criadorId: string | null
    usuarioId: string | null
    _count: NotificacaoCountAggregateOutputType | null
    _min: NotificacaoMinAggregateOutputType | null
    _max: NotificacaoMaxAggregateOutputType | null
  }

  type GetNotificacaoGroupByPayload<T extends NotificacaoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NotificacaoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NotificacaoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NotificacaoGroupByOutputType[P]>
            : GetScalarType<T[P], NotificacaoGroupByOutputType[P]>
        }
      >
    >


  export type NotificacaoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    titulo?: boolean
    mensagem?: boolean
    lida?: boolean
    tipo?: boolean
    dataPrazo?: boolean
    criadoEm?: boolean
    clienteId?: boolean
    criadorId?: boolean
    usuarioId?: boolean
    usuario?: boolean | Notificacao$usuarioArgs<ExtArgs>
  }, ExtArgs["result"]["notificacao"]>

  export type NotificacaoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    titulo?: boolean
    mensagem?: boolean
    lida?: boolean
    tipo?: boolean
    dataPrazo?: boolean
    criadoEm?: boolean
    clienteId?: boolean
    criadorId?: boolean
    usuarioId?: boolean
    usuario?: boolean | Notificacao$usuarioArgs<ExtArgs>
  }, ExtArgs["result"]["notificacao"]>

  export type NotificacaoSelectScalar = {
    id?: boolean
    titulo?: boolean
    mensagem?: boolean
    lida?: boolean
    tipo?: boolean
    dataPrazo?: boolean
    criadoEm?: boolean
    clienteId?: boolean
    criadorId?: boolean
    usuarioId?: boolean
  }

  export type NotificacaoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | Notificacao$usuarioArgs<ExtArgs>
  }
  export type NotificacaoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | Notificacao$usuarioArgs<ExtArgs>
  }

  export type $NotificacaoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Notificacao"
    objects: {
      usuario: Prisma.$UsuarioPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      titulo: string
      mensagem: string
      lida: boolean
      tipo: string
      dataPrazo: Date | null
      criadoEm: Date
      clienteId: string | null
      criadorId: string | null
      usuarioId: string | null
    }, ExtArgs["result"]["notificacao"]>
    composites: {}
  }

  type NotificacaoGetPayload<S extends boolean | null | undefined | NotificacaoDefaultArgs> = $Result.GetResult<Prisma.$NotificacaoPayload, S>

  type NotificacaoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<NotificacaoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: NotificacaoCountAggregateInputType | true
    }

  export interface NotificacaoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Notificacao'], meta: { name: 'Notificacao' } }
    /**
     * Find zero or one Notificacao that matches the filter.
     * @param {NotificacaoFindUniqueArgs} args - Arguments to find a Notificacao
     * @example
     * // Get one Notificacao
     * const notificacao = await prisma.notificacao.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NotificacaoFindUniqueArgs>(args: SelectSubset<T, NotificacaoFindUniqueArgs<ExtArgs>>): Prisma__NotificacaoClient<$Result.GetResult<Prisma.$NotificacaoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Notificacao that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {NotificacaoFindUniqueOrThrowArgs} args - Arguments to find a Notificacao
     * @example
     * // Get one Notificacao
     * const notificacao = await prisma.notificacao.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NotificacaoFindUniqueOrThrowArgs>(args: SelectSubset<T, NotificacaoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NotificacaoClient<$Result.GetResult<Prisma.$NotificacaoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Notificacao that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificacaoFindFirstArgs} args - Arguments to find a Notificacao
     * @example
     * // Get one Notificacao
     * const notificacao = await prisma.notificacao.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NotificacaoFindFirstArgs>(args?: SelectSubset<T, NotificacaoFindFirstArgs<ExtArgs>>): Prisma__NotificacaoClient<$Result.GetResult<Prisma.$NotificacaoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Notificacao that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificacaoFindFirstOrThrowArgs} args - Arguments to find a Notificacao
     * @example
     * // Get one Notificacao
     * const notificacao = await prisma.notificacao.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NotificacaoFindFirstOrThrowArgs>(args?: SelectSubset<T, NotificacaoFindFirstOrThrowArgs<ExtArgs>>): Prisma__NotificacaoClient<$Result.GetResult<Prisma.$NotificacaoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Notificacaos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificacaoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Notificacaos
     * const notificacaos = await prisma.notificacao.findMany()
     * 
     * // Get first 10 Notificacaos
     * const notificacaos = await prisma.notificacao.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const notificacaoWithIdOnly = await prisma.notificacao.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NotificacaoFindManyArgs>(args?: SelectSubset<T, NotificacaoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificacaoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Notificacao.
     * @param {NotificacaoCreateArgs} args - Arguments to create a Notificacao.
     * @example
     * // Create one Notificacao
     * const Notificacao = await prisma.notificacao.create({
     *   data: {
     *     // ... data to create a Notificacao
     *   }
     * })
     * 
     */
    create<T extends NotificacaoCreateArgs>(args: SelectSubset<T, NotificacaoCreateArgs<ExtArgs>>): Prisma__NotificacaoClient<$Result.GetResult<Prisma.$NotificacaoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Notificacaos.
     * @param {NotificacaoCreateManyArgs} args - Arguments to create many Notificacaos.
     * @example
     * // Create many Notificacaos
     * const notificacao = await prisma.notificacao.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NotificacaoCreateManyArgs>(args?: SelectSubset<T, NotificacaoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Notificacaos and returns the data saved in the database.
     * @param {NotificacaoCreateManyAndReturnArgs} args - Arguments to create many Notificacaos.
     * @example
     * // Create many Notificacaos
     * const notificacao = await prisma.notificacao.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Notificacaos and only return the `id`
     * const notificacaoWithIdOnly = await prisma.notificacao.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NotificacaoCreateManyAndReturnArgs>(args?: SelectSubset<T, NotificacaoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificacaoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Notificacao.
     * @param {NotificacaoDeleteArgs} args - Arguments to delete one Notificacao.
     * @example
     * // Delete one Notificacao
     * const Notificacao = await prisma.notificacao.delete({
     *   where: {
     *     // ... filter to delete one Notificacao
     *   }
     * })
     * 
     */
    delete<T extends NotificacaoDeleteArgs>(args: SelectSubset<T, NotificacaoDeleteArgs<ExtArgs>>): Prisma__NotificacaoClient<$Result.GetResult<Prisma.$NotificacaoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Notificacao.
     * @param {NotificacaoUpdateArgs} args - Arguments to update one Notificacao.
     * @example
     * // Update one Notificacao
     * const notificacao = await prisma.notificacao.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NotificacaoUpdateArgs>(args: SelectSubset<T, NotificacaoUpdateArgs<ExtArgs>>): Prisma__NotificacaoClient<$Result.GetResult<Prisma.$NotificacaoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Notificacaos.
     * @param {NotificacaoDeleteManyArgs} args - Arguments to filter Notificacaos to delete.
     * @example
     * // Delete a few Notificacaos
     * const { count } = await prisma.notificacao.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NotificacaoDeleteManyArgs>(args?: SelectSubset<T, NotificacaoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notificacaos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificacaoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Notificacaos
     * const notificacao = await prisma.notificacao.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NotificacaoUpdateManyArgs>(args: SelectSubset<T, NotificacaoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Notificacao.
     * @param {NotificacaoUpsertArgs} args - Arguments to update or create a Notificacao.
     * @example
     * // Update or create a Notificacao
     * const notificacao = await prisma.notificacao.upsert({
     *   create: {
     *     // ... data to create a Notificacao
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Notificacao we want to update
     *   }
     * })
     */
    upsert<T extends NotificacaoUpsertArgs>(args: SelectSubset<T, NotificacaoUpsertArgs<ExtArgs>>): Prisma__NotificacaoClient<$Result.GetResult<Prisma.$NotificacaoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Notificacaos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificacaoCountArgs} args - Arguments to filter Notificacaos to count.
     * @example
     * // Count the number of Notificacaos
     * const count = await prisma.notificacao.count({
     *   where: {
     *     // ... the filter for the Notificacaos we want to count
     *   }
     * })
    **/
    count<T extends NotificacaoCountArgs>(
      args?: Subset<T, NotificacaoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NotificacaoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Notificacao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificacaoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends NotificacaoAggregateArgs>(args: Subset<T, NotificacaoAggregateArgs>): Prisma.PrismaPromise<GetNotificacaoAggregateType<T>>

    /**
     * Group by Notificacao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificacaoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends NotificacaoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NotificacaoGroupByArgs['orderBy'] }
        : { orderBy?: NotificacaoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NotificacaoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNotificacaoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Notificacao model
   */
  readonly fields: NotificacaoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Notificacao.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NotificacaoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    usuario<T extends Notificacao$usuarioArgs<ExtArgs> = {}>(args?: Subset<T, Notificacao$usuarioArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Notificacao model
   */ 
  interface NotificacaoFieldRefs {
    readonly id: FieldRef<"Notificacao", 'String'>
    readonly titulo: FieldRef<"Notificacao", 'String'>
    readonly mensagem: FieldRef<"Notificacao", 'String'>
    readonly lida: FieldRef<"Notificacao", 'Boolean'>
    readonly tipo: FieldRef<"Notificacao", 'String'>
    readonly dataPrazo: FieldRef<"Notificacao", 'DateTime'>
    readonly criadoEm: FieldRef<"Notificacao", 'DateTime'>
    readonly clienteId: FieldRef<"Notificacao", 'String'>
    readonly criadorId: FieldRef<"Notificacao", 'String'>
    readonly usuarioId: FieldRef<"Notificacao", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Notificacao findUnique
   */
  export type NotificacaoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notificacao
     */
    select?: NotificacaoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificacaoInclude<ExtArgs> | null
    /**
     * Filter, which Notificacao to fetch.
     */
    where: NotificacaoWhereUniqueInput
  }

  /**
   * Notificacao findUniqueOrThrow
   */
  export type NotificacaoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notificacao
     */
    select?: NotificacaoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificacaoInclude<ExtArgs> | null
    /**
     * Filter, which Notificacao to fetch.
     */
    where: NotificacaoWhereUniqueInput
  }

  /**
   * Notificacao findFirst
   */
  export type NotificacaoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notificacao
     */
    select?: NotificacaoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificacaoInclude<ExtArgs> | null
    /**
     * Filter, which Notificacao to fetch.
     */
    where?: NotificacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notificacaos to fetch.
     */
    orderBy?: NotificacaoOrderByWithRelationInput | NotificacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notificacaos.
     */
    cursor?: NotificacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notificacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notificacaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notificacaos.
     */
    distinct?: NotificacaoScalarFieldEnum | NotificacaoScalarFieldEnum[]
  }

  /**
   * Notificacao findFirstOrThrow
   */
  export type NotificacaoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notificacao
     */
    select?: NotificacaoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificacaoInclude<ExtArgs> | null
    /**
     * Filter, which Notificacao to fetch.
     */
    where?: NotificacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notificacaos to fetch.
     */
    orderBy?: NotificacaoOrderByWithRelationInput | NotificacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notificacaos.
     */
    cursor?: NotificacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notificacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notificacaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notificacaos.
     */
    distinct?: NotificacaoScalarFieldEnum | NotificacaoScalarFieldEnum[]
  }

  /**
   * Notificacao findMany
   */
  export type NotificacaoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notificacao
     */
    select?: NotificacaoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificacaoInclude<ExtArgs> | null
    /**
     * Filter, which Notificacaos to fetch.
     */
    where?: NotificacaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notificacaos to fetch.
     */
    orderBy?: NotificacaoOrderByWithRelationInput | NotificacaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Notificacaos.
     */
    cursor?: NotificacaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notificacaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notificacaos.
     */
    skip?: number
    distinct?: NotificacaoScalarFieldEnum | NotificacaoScalarFieldEnum[]
  }

  /**
   * Notificacao create
   */
  export type NotificacaoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notificacao
     */
    select?: NotificacaoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificacaoInclude<ExtArgs> | null
    /**
     * The data needed to create a Notificacao.
     */
    data: XOR<NotificacaoCreateInput, NotificacaoUncheckedCreateInput>
  }

  /**
   * Notificacao createMany
   */
  export type NotificacaoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Notificacaos.
     */
    data: NotificacaoCreateManyInput | NotificacaoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Notificacao createManyAndReturn
   */
  export type NotificacaoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notificacao
     */
    select?: NotificacaoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Notificacaos.
     */
    data: NotificacaoCreateManyInput | NotificacaoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificacaoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Notificacao update
   */
  export type NotificacaoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notificacao
     */
    select?: NotificacaoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificacaoInclude<ExtArgs> | null
    /**
     * The data needed to update a Notificacao.
     */
    data: XOR<NotificacaoUpdateInput, NotificacaoUncheckedUpdateInput>
    /**
     * Choose, which Notificacao to update.
     */
    where: NotificacaoWhereUniqueInput
  }

  /**
   * Notificacao updateMany
   */
  export type NotificacaoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Notificacaos.
     */
    data: XOR<NotificacaoUpdateManyMutationInput, NotificacaoUncheckedUpdateManyInput>
    /**
     * Filter which Notificacaos to update
     */
    where?: NotificacaoWhereInput
  }

  /**
   * Notificacao upsert
   */
  export type NotificacaoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notificacao
     */
    select?: NotificacaoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificacaoInclude<ExtArgs> | null
    /**
     * The filter to search for the Notificacao to update in case it exists.
     */
    where: NotificacaoWhereUniqueInput
    /**
     * In case the Notificacao found by the `where` argument doesn't exist, create a new Notificacao with this data.
     */
    create: XOR<NotificacaoCreateInput, NotificacaoUncheckedCreateInput>
    /**
     * In case the Notificacao was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NotificacaoUpdateInput, NotificacaoUncheckedUpdateInput>
  }

  /**
   * Notificacao delete
   */
  export type NotificacaoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notificacao
     */
    select?: NotificacaoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificacaoInclude<ExtArgs> | null
    /**
     * Filter which Notificacao to delete.
     */
    where: NotificacaoWhereUniqueInput
  }

  /**
   * Notificacao deleteMany
   */
  export type NotificacaoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notificacaos to delete
     */
    where?: NotificacaoWhereInput
  }

  /**
   * Notificacao.usuario
   */
  export type Notificacao$usuarioArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    where?: UsuarioWhereInput
  }

  /**
   * Notificacao without action
   */
  export type NotificacaoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notificacao
     */
    select?: NotificacaoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificacaoInclude<ExtArgs> | null
  }


  /**
   * Model Processo
   */

  export type AggregateProcesso = {
    _count: ProcessoCountAggregateOutputType | null
    _min: ProcessoMinAggregateOutputType | null
    _max: ProcessoMaxAggregateOutputType | null
  }

  export type ProcessoMinAggregateOutputType = {
    id: string | null
  }

  export type ProcessoMaxAggregateOutputType = {
    id: string | null
  }

  export type ProcessoCountAggregateOutputType = {
    id: number
    _all: number
  }


  export type ProcessoMinAggregateInputType = {
    id?: true
  }

  export type ProcessoMaxAggregateInputType = {
    id?: true
  }

  export type ProcessoCountAggregateInputType = {
    id?: true
    _all?: true
  }

  export type ProcessoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Processo to aggregate.
     */
    where?: ProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Processos to fetch.
     */
    orderBy?: ProcessoOrderByWithRelationInput | ProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Processos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Processos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Processos
    **/
    _count?: true | ProcessoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProcessoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProcessoMaxAggregateInputType
  }

  export type GetProcessoAggregateType<T extends ProcessoAggregateArgs> = {
        [P in keyof T & keyof AggregateProcesso]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProcesso[P]>
      : GetScalarType<T[P], AggregateProcesso[P]>
  }




  export type ProcessoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProcessoWhereInput
    orderBy?: ProcessoOrderByWithAggregationInput | ProcessoOrderByWithAggregationInput[]
    by: ProcessoScalarFieldEnum[] | ProcessoScalarFieldEnum
    having?: ProcessoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProcessoCountAggregateInputType | true
    _min?: ProcessoMinAggregateInputType
    _max?: ProcessoMaxAggregateInputType
  }

  export type ProcessoGroupByOutputType = {
    id: string
    _count: ProcessoCountAggregateOutputType | null
    _min: ProcessoMinAggregateOutputType | null
    _max: ProcessoMaxAggregateOutputType | null
  }

  type GetProcessoGroupByPayload<T extends ProcessoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProcessoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProcessoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProcessoGroupByOutputType[P]>
            : GetScalarType<T[P], ProcessoGroupByOutputType[P]>
        }
      >
    >


  export type ProcessoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    documentos?: boolean | Processo$documentosArgs<ExtArgs>
    _count?: boolean | ProcessoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["processo"]>

  export type ProcessoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
  }, ExtArgs["result"]["processo"]>

  export type ProcessoSelectScalar = {
    id?: boolean
  }

  export type ProcessoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    documentos?: boolean | Processo$documentosArgs<ExtArgs>
    _count?: boolean | ProcessoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProcessoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ProcessoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Processo"
    objects: {
      documentos: Prisma.$DocumentoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
    }, ExtArgs["result"]["processo"]>
    composites: {}
  }

  type ProcessoGetPayload<S extends boolean | null | undefined | ProcessoDefaultArgs> = $Result.GetResult<Prisma.$ProcessoPayload, S>

  type ProcessoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProcessoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProcessoCountAggregateInputType | true
    }

  export interface ProcessoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Processo'], meta: { name: 'Processo' } }
    /**
     * Find zero or one Processo that matches the filter.
     * @param {ProcessoFindUniqueArgs} args - Arguments to find a Processo
     * @example
     * // Get one Processo
     * const processo = await prisma.processo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProcessoFindUniqueArgs>(args: SelectSubset<T, ProcessoFindUniqueArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Processo that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProcessoFindUniqueOrThrowArgs} args - Arguments to find a Processo
     * @example
     * // Get one Processo
     * const processo = await prisma.processo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProcessoFindUniqueOrThrowArgs>(args: SelectSubset<T, ProcessoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Processo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoFindFirstArgs} args - Arguments to find a Processo
     * @example
     * // Get one Processo
     * const processo = await prisma.processo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProcessoFindFirstArgs>(args?: SelectSubset<T, ProcessoFindFirstArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Processo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoFindFirstOrThrowArgs} args - Arguments to find a Processo
     * @example
     * // Get one Processo
     * const processo = await prisma.processo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProcessoFindFirstOrThrowArgs>(args?: SelectSubset<T, ProcessoFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Processos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Processos
     * const processos = await prisma.processo.findMany()
     * 
     * // Get first 10 Processos
     * const processos = await prisma.processo.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const processoWithIdOnly = await prisma.processo.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProcessoFindManyArgs>(args?: SelectSubset<T, ProcessoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Processo.
     * @param {ProcessoCreateArgs} args - Arguments to create a Processo.
     * @example
     * // Create one Processo
     * const Processo = await prisma.processo.create({
     *   data: {
     *     // ... data to create a Processo
     *   }
     * })
     * 
     */
    create<T extends ProcessoCreateArgs>(args: SelectSubset<T, ProcessoCreateArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Processos.
     * @param {ProcessoCreateManyArgs} args - Arguments to create many Processos.
     * @example
     * // Create many Processos
     * const processo = await prisma.processo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProcessoCreateManyArgs>(args?: SelectSubset<T, ProcessoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Processos and returns the data saved in the database.
     * @param {ProcessoCreateManyAndReturnArgs} args - Arguments to create many Processos.
     * @example
     * // Create many Processos
     * const processo = await prisma.processo.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Processos and only return the `id`
     * const processoWithIdOnly = await prisma.processo.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProcessoCreateManyAndReturnArgs>(args?: SelectSubset<T, ProcessoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Processo.
     * @param {ProcessoDeleteArgs} args - Arguments to delete one Processo.
     * @example
     * // Delete one Processo
     * const Processo = await prisma.processo.delete({
     *   where: {
     *     // ... filter to delete one Processo
     *   }
     * })
     * 
     */
    delete<T extends ProcessoDeleteArgs>(args: SelectSubset<T, ProcessoDeleteArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Processo.
     * @param {ProcessoUpdateArgs} args - Arguments to update one Processo.
     * @example
     * // Update one Processo
     * const processo = await prisma.processo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProcessoUpdateArgs>(args: SelectSubset<T, ProcessoUpdateArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Processos.
     * @param {ProcessoDeleteManyArgs} args - Arguments to filter Processos to delete.
     * @example
     * // Delete a few Processos
     * const { count } = await prisma.processo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProcessoDeleteManyArgs>(args?: SelectSubset<T, ProcessoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Processos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Processos
     * const processo = await prisma.processo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProcessoUpdateManyArgs>(args: SelectSubset<T, ProcessoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Processo.
     * @param {ProcessoUpsertArgs} args - Arguments to update or create a Processo.
     * @example
     * // Update or create a Processo
     * const processo = await prisma.processo.upsert({
     *   create: {
     *     // ... data to create a Processo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Processo we want to update
     *   }
     * })
     */
    upsert<T extends ProcessoUpsertArgs>(args: SelectSubset<T, ProcessoUpsertArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Processos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoCountArgs} args - Arguments to filter Processos to count.
     * @example
     * // Count the number of Processos
     * const count = await prisma.processo.count({
     *   where: {
     *     // ... the filter for the Processos we want to count
     *   }
     * })
    **/
    count<T extends ProcessoCountArgs>(
      args?: Subset<T, ProcessoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProcessoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Processo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProcessoAggregateArgs>(args: Subset<T, ProcessoAggregateArgs>): Prisma.PrismaPromise<GetProcessoAggregateType<T>>

    /**
     * Group by Processo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProcessoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProcessoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProcessoGroupByArgs['orderBy'] }
        : { orderBy?: ProcessoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProcessoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProcessoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Processo model
   */
  readonly fields: ProcessoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Processo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProcessoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    documentos<T extends Processo$documentosArgs<ExtArgs> = {}>(args?: Subset<T, Processo$documentosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Processo model
   */ 
  interface ProcessoFieldRefs {
    readonly id: FieldRef<"Processo", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Processo findUnique
   */
  export type ProcessoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoInclude<ExtArgs> | null
    /**
     * Filter, which Processo to fetch.
     */
    where: ProcessoWhereUniqueInput
  }

  /**
   * Processo findUniqueOrThrow
   */
  export type ProcessoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoInclude<ExtArgs> | null
    /**
     * Filter, which Processo to fetch.
     */
    where: ProcessoWhereUniqueInput
  }

  /**
   * Processo findFirst
   */
  export type ProcessoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoInclude<ExtArgs> | null
    /**
     * Filter, which Processo to fetch.
     */
    where?: ProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Processos to fetch.
     */
    orderBy?: ProcessoOrderByWithRelationInput | ProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Processos.
     */
    cursor?: ProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Processos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Processos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Processos.
     */
    distinct?: ProcessoScalarFieldEnum | ProcessoScalarFieldEnum[]
  }

  /**
   * Processo findFirstOrThrow
   */
  export type ProcessoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoInclude<ExtArgs> | null
    /**
     * Filter, which Processo to fetch.
     */
    where?: ProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Processos to fetch.
     */
    orderBy?: ProcessoOrderByWithRelationInput | ProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Processos.
     */
    cursor?: ProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Processos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Processos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Processos.
     */
    distinct?: ProcessoScalarFieldEnum | ProcessoScalarFieldEnum[]
  }

  /**
   * Processo findMany
   */
  export type ProcessoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoInclude<ExtArgs> | null
    /**
     * Filter, which Processos to fetch.
     */
    where?: ProcessoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Processos to fetch.
     */
    orderBy?: ProcessoOrderByWithRelationInput | ProcessoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Processos.
     */
    cursor?: ProcessoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Processos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Processos.
     */
    skip?: number
    distinct?: ProcessoScalarFieldEnum | ProcessoScalarFieldEnum[]
  }

  /**
   * Processo create
   */
  export type ProcessoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoInclude<ExtArgs> | null
    /**
     * The data needed to create a Processo.
     */
    data?: XOR<ProcessoCreateInput, ProcessoUncheckedCreateInput>
  }

  /**
   * Processo createMany
   */
  export type ProcessoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Processos.
     */
    data: ProcessoCreateManyInput | ProcessoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Processo createManyAndReturn
   */
  export type ProcessoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Processos.
     */
    data: ProcessoCreateManyInput | ProcessoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Processo update
   */
  export type ProcessoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoInclude<ExtArgs> | null
    /**
     * The data needed to update a Processo.
     */
    data: XOR<ProcessoUpdateInput, ProcessoUncheckedUpdateInput>
    /**
     * Choose, which Processo to update.
     */
    where: ProcessoWhereUniqueInput
  }

  /**
   * Processo updateMany
   */
  export type ProcessoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Processos.
     */
    data: XOR<ProcessoUpdateManyMutationInput, ProcessoUncheckedUpdateManyInput>
    /**
     * Filter which Processos to update
     */
    where?: ProcessoWhereInput
  }

  /**
   * Processo upsert
   */
  export type ProcessoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoInclude<ExtArgs> | null
    /**
     * The filter to search for the Processo to update in case it exists.
     */
    where: ProcessoWhereUniqueInput
    /**
     * In case the Processo found by the `where` argument doesn't exist, create a new Processo with this data.
     */
    create: XOR<ProcessoCreateInput, ProcessoUncheckedCreateInput>
    /**
     * In case the Processo was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProcessoUpdateInput, ProcessoUncheckedUpdateInput>
  }

  /**
   * Processo delete
   */
  export type ProcessoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoInclude<ExtArgs> | null
    /**
     * Filter which Processo to delete.
     */
    where: ProcessoWhereUniqueInput
  }

  /**
   * Processo deleteMany
   */
  export type ProcessoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Processos to delete
     */
    where?: ProcessoWhereInput
  }

  /**
   * Processo.documentos
   */
  export type Processo$documentosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    where?: DocumentoWhereInput
    orderBy?: DocumentoOrderByWithRelationInput | DocumentoOrderByWithRelationInput[]
    cursor?: DocumentoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DocumentoScalarFieldEnum | DocumentoScalarFieldEnum[]
  }

  /**
   * Processo without action
   */
  export type ProcessoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoInclude<ExtArgs> | null
  }


  /**
   * Model Dependente
   */

  export type AggregateDependente = {
    _count: DependenteCountAggregateOutputType | null
    _min: DependenteMinAggregateOutputType | null
    _max: DependenteMaxAggregateOutputType | null
  }

  export type DependenteMinAggregateOutputType = {
    id: string | null
  }

  export type DependenteMaxAggregateOutputType = {
    id: string | null
  }

  export type DependenteCountAggregateOutputType = {
    id: number
    _all: number
  }


  export type DependenteMinAggregateInputType = {
    id?: true
  }

  export type DependenteMaxAggregateInputType = {
    id?: true
  }

  export type DependenteCountAggregateInputType = {
    id?: true
    _all?: true
  }

  export type DependenteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Dependente to aggregate.
     */
    where?: DependenteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Dependentes to fetch.
     */
    orderBy?: DependenteOrderByWithRelationInput | DependenteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DependenteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Dependentes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Dependentes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Dependentes
    **/
    _count?: true | DependenteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DependenteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DependenteMaxAggregateInputType
  }

  export type GetDependenteAggregateType<T extends DependenteAggregateArgs> = {
        [P in keyof T & keyof AggregateDependente]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDependente[P]>
      : GetScalarType<T[P], AggregateDependente[P]>
  }




  export type DependenteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DependenteWhereInput
    orderBy?: DependenteOrderByWithAggregationInput | DependenteOrderByWithAggregationInput[]
    by: DependenteScalarFieldEnum[] | DependenteScalarFieldEnum
    having?: DependenteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DependenteCountAggregateInputType | true
    _min?: DependenteMinAggregateInputType
    _max?: DependenteMaxAggregateInputType
  }

  export type DependenteGroupByOutputType = {
    id: string
    _count: DependenteCountAggregateOutputType | null
    _min: DependenteMinAggregateOutputType | null
    _max: DependenteMaxAggregateOutputType | null
  }

  type GetDependenteGroupByPayload<T extends DependenteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DependenteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DependenteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DependenteGroupByOutputType[P]>
            : GetScalarType<T[P], DependenteGroupByOutputType[P]>
        }
      >
    >


  export type DependenteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    documentos?: boolean | Dependente$documentosArgs<ExtArgs>
    _count?: boolean | DependenteCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["dependente"]>

  export type DependenteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
  }, ExtArgs["result"]["dependente"]>

  export type DependenteSelectScalar = {
    id?: boolean
  }

  export type DependenteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    documentos?: boolean | Dependente$documentosArgs<ExtArgs>
    _count?: boolean | DependenteCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DependenteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $DependentePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Dependente"
    objects: {
      documentos: Prisma.$DocumentoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
    }, ExtArgs["result"]["dependente"]>
    composites: {}
  }

  type DependenteGetPayload<S extends boolean | null | undefined | DependenteDefaultArgs> = $Result.GetResult<Prisma.$DependentePayload, S>

  type DependenteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DependenteFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DependenteCountAggregateInputType | true
    }

  export interface DependenteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Dependente'], meta: { name: 'Dependente' } }
    /**
     * Find zero or one Dependente that matches the filter.
     * @param {DependenteFindUniqueArgs} args - Arguments to find a Dependente
     * @example
     * // Get one Dependente
     * const dependente = await prisma.dependente.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DependenteFindUniqueArgs>(args: SelectSubset<T, DependenteFindUniqueArgs<ExtArgs>>): Prisma__DependenteClient<$Result.GetResult<Prisma.$DependentePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Dependente that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DependenteFindUniqueOrThrowArgs} args - Arguments to find a Dependente
     * @example
     * // Get one Dependente
     * const dependente = await prisma.dependente.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DependenteFindUniqueOrThrowArgs>(args: SelectSubset<T, DependenteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DependenteClient<$Result.GetResult<Prisma.$DependentePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Dependente that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DependenteFindFirstArgs} args - Arguments to find a Dependente
     * @example
     * // Get one Dependente
     * const dependente = await prisma.dependente.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DependenteFindFirstArgs>(args?: SelectSubset<T, DependenteFindFirstArgs<ExtArgs>>): Prisma__DependenteClient<$Result.GetResult<Prisma.$DependentePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Dependente that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DependenteFindFirstOrThrowArgs} args - Arguments to find a Dependente
     * @example
     * // Get one Dependente
     * const dependente = await prisma.dependente.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DependenteFindFirstOrThrowArgs>(args?: SelectSubset<T, DependenteFindFirstOrThrowArgs<ExtArgs>>): Prisma__DependenteClient<$Result.GetResult<Prisma.$DependentePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Dependentes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DependenteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Dependentes
     * const dependentes = await prisma.dependente.findMany()
     * 
     * // Get first 10 Dependentes
     * const dependentes = await prisma.dependente.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dependenteWithIdOnly = await prisma.dependente.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DependenteFindManyArgs>(args?: SelectSubset<T, DependenteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DependentePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Dependente.
     * @param {DependenteCreateArgs} args - Arguments to create a Dependente.
     * @example
     * // Create one Dependente
     * const Dependente = await prisma.dependente.create({
     *   data: {
     *     // ... data to create a Dependente
     *   }
     * })
     * 
     */
    create<T extends DependenteCreateArgs>(args: SelectSubset<T, DependenteCreateArgs<ExtArgs>>): Prisma__DependenteClient<$Result.GetResult<Prisma.$DependentePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Dependentes.
     * @param {DependenteCreateManyArgs} args - Arguments to create many Dependentes.
     * @example
     * // Create many Dependentes
     * const dependente = await prisma.dependente.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DependenteCreateManyArgs>(args?: SelectSubset<T, DependenteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Dependentes and returns the data saved in the database.
     * @param {DependenteCreateManyAndReturnArgs} args - Arguments to create many Dependentes.
     * @example
     * // Create many Dependentes
     * const dependente = await prisma.dependente.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Dependentes and only return the `id`
     * const dependenteWithIdOnly = await prisma.dependente.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DependenteCreateManyAndReturnArgs>(args?: SelectSubset<T, DependenteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DependentePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Dependente.
     * @param {DependenteDeleteArgs} args - Arguments to delete one Dependente.
     * @example
     * // Delete one Dependente
     * const Dependente = await prisma.dependente.delete({
     *   where: {
     *     // ... filter to delete one Dependente
     *   }
     * })
     * 
     */
    delete<T extends DependenteDeleteArgs>(args: SelectSubset<T, DependenteDeleteArgs<ExtArgs>>): Prisma__DependenteClient<$Result.GetResult<Prisma.$DependentePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Dependente.
     * @param {DependenteUpdateArgs} args - Arguments to update one Dependente.
     * @example
     * // Update one Dependente
     * const dependente = await prisma.dependente.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DependenteUpdateArgs>(args: SelectSubset<T, DependenteUpdateArgs<ExtArgs>>): Prisma__DependenteClient<$Result.GetResult<Prisma.$DependentePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Dependentes.
     * @param {DependenteDeleteManyArgs} args - Arguments to filter Dependentes to delete.
     * @example
     * // Delete a few Dependentes
     * const { count } = await prisma.dependente.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DependenteDeleteManyArgs>(args?: SelectSubset<T, DependenteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Dependentes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DependenteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Dependentes
     * const dependente = await prisma.dependente.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DependenteUpdateManyArgs>(args: SelectSubset<T, DependenteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Dependente.
     * @param {DependenteUpsertArgs} args - Arguments to update or create a Dependente.
     * @example
     * // Update or create a Dependente
     * const dependente = await prisma.dependente.upsert({
     *   create: {
     *     // ... data to create a Dependente
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Dependente we want to update
     *   }
     * })
     */
    upsert<T extends DependenteUpsertArgs>(args: SelectSubset<T, DependenteUpsertArgs<ExtArgs>>): Prisma__DependenteClient<$Result.GetResult<Prisma.$DependentePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Dependentes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DependenteCountArgs} args - Arguments to filter Dependentes to count.
     * @example
     * // Count the number of Dependentes
     * const count = await prisma.dependente.count({
     *   where: {
     *     // ... the filter for the Dependentes we want to count
     *   }
     * })
    **/
    count<T extends DependenteCountArgs>(
      args?: Subset<T, DependenteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DependenteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Dependente.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DependenteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DependenteAggregateArgs>(args: Subset<T, DependenteAggregateArgs>): Prisma.PrismaPromise<GetDependenteAggregateType<T>>

    /**
     * Group by Dependente.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DependenteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DependenteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DependenteGroupByArgs['orderBy'] }
        : { orderBy?: DependenteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DependenteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDependenteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Dependente model
   */
  readonly fields: DependenteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Dependente.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DependenteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    documentos<T extends Dependente$documentosArgs<ExtArgs> = {}>(args?: Subset<T, Dependente$documentosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Dependente model
   */ 
  interface DependenteFieldRefs {
    readonly id: FieldRef<"Dependente", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Dependente findUnique
   */
  export type DependenteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dependente
     */
    select?: DependenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DependenteInclude<ExtArgs> | null
    /**
     * Filter, which Dependente to fetch.
     */
    where: DependenteWhereUniqueInput
  }

  /**
   * Dependente findUniqueOrThrow
   */
  export type DependenteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dependente
     */
    select?: DependenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DependenteInclude<ExtArgs> | null
    /**
     * Filter, which Dependente to fetch.
     */
    where: DependenteWhereUniqueInput
  }

  /**
   * Dependente findFirst
   */
  export type DependenteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dependente
     */
    select?: DependenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DependenteInclude<ExtArgs> | null
    /**
     * Filter, which Dependente to fetch.
     */
    where?: DependenteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Dependentes to fetch.
     */
    orderBy?: DependenteOrderByWithRelationInput | DependenteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Dependentes.
     */
    cursor?: DependenteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Dependentes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Dependentes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Dependentes.
     */
    distinct?: DependenteScalarFieldEnum | DependenteScalarFieldEnum[]
  }

  /**
   * Dependente findFirstOrThrow
   */
  export type DependenteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dependente
     */
    select?: DependenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DependenteInclude<ExtArgs> | null
    /**
     * Filter, which Dependente to fetch.
     */
    where?: DependenteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Dependentes to fetch.
     */
    orderBy?: DependenteOrderByWithRelationInput | DependenteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Dependentes.
     */
    cursor?: DependenteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Dependentes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Dependentes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Dependentes.
     */
    distinct?: DependenteScalarFieldEnum | DependenteScalarFieldEnum[]
  }

  /**
   * Dependente findMany
   */
  export type DependenteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dependente
     */
    select?: DependenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DependenteInclude<ExtArgs> | null
    /**
     * Filter, which Dependentes to fetch.
     */
    where?: DependenteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Dependentes to fetch.
     */
    orderBy?: DependenteOrderByWithRelationInput | DependenteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Dependentes.
     */
    cursor?: DependenteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Dependentes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Dependentes.
     */
    skip?: number
    distinct?: DependenteScalarFieldEnum | DependenteScalarFieldEnum[]
  }

  /**
   * Dependente create
   */
  export type DependenteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dependente
     */
    select?: DependenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DependenteInclude<ExtArgs> | null
    /**
     * The data needed to create a Dependente.
     */
    data?: XOR<DependenteCreateInput, DependenteUncheckedCreateInput>
  }

  /**
   * Dependente createMany
   */
  export type DependenteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Dependentes.
     */
    data: DependenteCreateManyInput | DependenteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Dependente createManyAndReturn
   */
  export type DependenteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dependente
     */
    select?: DependenteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Dependentes.
     */
    data: DependenteCreateManyInput | DependenteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Dependente update
   */
  export type DependenteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dependente
     */
    select?: DependenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DependenteInclude<ExtArgs> | null
    /**
     * The data needed to update a Dependente.
     */
    data: XOR<DependenteUpdateInput, DependenteUncheckedUpdateInput>
    /**
     * Choose, which Dependente to update.
     */
    where: DependenteWhereUniqueInput
  }

  /**
   * Dependente updateMany
   */
  export type DependenteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Dependentes.
     */
    data: XOR<DependenteUpdateManyMutationInput, DependenteUncheckedUpdateManyInput>
    /**
     * Filter which Dependentes to update
     */
    where?: DependenteWhereInput
  }

  /**
   * Dependente upsert
   */
  export type DependenteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dependente
     */
    select?: DependenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DependenteInclude<ExtArgs> | null
    /**
     * The filter to search for the Dependente to update in case it exists.
     */
    where: DependenteWhereUniqueInput
    /**
     * In case the Dependente found by the `where` argument doesn't exist, create a new Dependente with this data.
     */
    create: XOR<DependenteCreateInput, DependenteUncheckedCreateInput>
    /**
     * In case the Dependente was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DependenteUpdateInput, DependenteUncheckedUpdateInput>
  }

  /**
   * Dependente delete
   */
  export type DependenteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dependente
     */
    select?: DependenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DependenteInclude<ExtArgs> | null
    /**
     * Filter which Dependente to delete.
     */
    where: DependenteWhereUniqueInput
  }

  /**
   * Dependente deleteMany
   */
  export type DependenteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Dependentes to delete
     */
    where?: DependenteWhereInput
  }

  /**
   * Dependente.documentos
   */
  export type Dependente$documentosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    where?: DocumentoWhereInput
    orderBy?: DocumentoOrderByWithRelationInput | DocumentoOrderByWithRelationInput[]
    cursor?: DocumentoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DocumentoScalarFieldEnum | DocumentoScalarFieldEnum[]
  }

  /**
   * Dependente without action
   */
  export type DependenteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dependente
     */
    select?: DependenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DependenteInclude<ExtArgs> | null
  }


  /**
   * Model Requerimento
   */

  export type AggregateRequerimento = {
    _count: RequerimentoCountAggregateOutputType | null
    _min: RequerimentoMinAggregateOutputType | null
    _max: RequerimentoMaxAggregateOutputType | null
  }

  export type RequerimentoMinAggregateOutputType = {
    id: string | null
    clienteId: string | null
    processoId: string | null
    tipo: string | null
    status: string | null
    observacoes: string | null
    criadorId: string | null
    createdAt: Date | null
    updated_at: Date | null
  }

  export type RequerimentoMaxAggregateOutputType = {
    id: string | null
    clienteId: string | null
    processoId: string | null
    tipo: string | null
    status: string | null
    observacoes: string | null
    criadorId: string | null
    createdAt: Date | null
    updated_at: Date | null
  }

  export type RequerimentoCountAggregateOutputType = {
    id: number
    clienteId: number
    processoId: number
    tipo: number
    status: number
    observacoes: number
    criadorId: number
    createdAt: number
    updated_at: number
    _all: number
  }


  export type RequerimentoMinAggregateInputType = {
    id?: true
    clienteId?: true
    processoId?: true
    tipo?: true
    status?: true
    observacoes?: true
    criadorId?: true
    createdAt?: true
    updated_at?: true
  }

  export type RequerimentoMaxAggregateInputType = {
    id?: true
    clienteId?: true
    processoId?: true
    tipo?: true
    status?: true
    observacoes?: true
    criadorId?: true
    createdAt?: true
    updated_at?: true
  }

  export type RequerimentoCountAggregateInputType = {
    id?: true
    clienteId?: true
    processoId?: true
    tipo?: true
    status?: true
    observacoes?: true
    criadorId?: true
    createdAt?: true
    updated_at?: true
    _all?: true
  }

  export type RequerimentoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Requerimento to aggregate.
     */
    where?: RequerimentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Requerimentos to fetch.
     */
    orderBy?: RequerimentoOrderByWithRelationInput | RequerimentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RequerimentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Requerimentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Requerimentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Requerimentos
    **/
    _count?: true | RequerimentoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RequerimentoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RequerimentoMaxAggregateInputType
  }

  export type GetRequerimentoAggregateType<T extends RequerimentoAggregateArgs> = {
        [P in keyof T & keyof AggregateRequerimento]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRequerimento[P]>
      : GetScalarType<T[P], AggregateRequerimento[P]>
  }




  export type RequerimentoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RequerimentoWhereInput
    orderBy?: RequerimentoOrderByWithAggregationInput | RequerimentoOrderByWithAggregationInput[]
    by: RequerimentoScalarFieldEnum[] | RequerimentoScalarFieldEnum
    having?: RequerimentoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RequerimentoCountAggregateInputType | true
    _min?: RequerimentoMinAggregateInputType
    _max?: RequerimentoMaxAggregateInputType
  }

  export type RequerimentoGroupByOutputType = {
    id: string
    clienteId: string
    processoId: string | null
    tipo: string
    status: string
    observacoes: string | null
    criadorId: string | null
    createdAt: Date
    updated_at: Date
    _count: RequerimentoCountAggregateOutputType | null
    _min: RequerimentoMinAggregateOutputType | null
    _max: RequerimentoMaxAggregateOutputType | null
  }

  type GetRequerimentoGroupByPayload<T extends RequerimentoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RequerimentoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RequerimentoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RequerimentoGroupByOutputType[P]>
            : GetScalarType<T[P], RequerimentoGroupByOutputType[P]>
        }
      >
    >


  export type RequerimentoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clienteId?: boolean
    processoId?: boolean
    tipo?: boolean
    status?: boolean
    observacoes?: boolean
    criadorId?: boolean
    createdAt?: boolean
    updated_at?: boolean
    documentos?: boolean | Requerimento$documentosArgs<ExtArgs>
    _count?: boolean | RequerimentoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["requerimento"]>

  export type RequerimentoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clienteId?: boolean
    processoId?: boolean
    tipo?: boolean
    status?: boolean
    observacoes?: boolean
    criadorId?: boolean
    createdAt?: boolean
    updated_at?: boolean
  }, ExtArgs["result"]["requerimento"]>

  export type RequerimentoSelectScalar = {
    id?: boolean
    clienteId?: boolean
    processoId?: boolean
    tipo?: boolean
    status?: boolean
    observacoes?: boolean
    criadorId?: boolean
    createdAt?: boolean
    updated_at?: boolean
  }

  export type RequerimentoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    documentos?: boolean | Requerimento$documentosArgs<ExtArgs>
    _count?: boolean | RequerimentoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RequerimentoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $RequerimentoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Requerimento"
    objects: {
      documentos: Prisma.$DocumentoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      clienteId: string
      processoId: string | null
      tipo: string
      status: string
      observacoes: string | null
      criadorId: string | null
      createdAt: Date
      updated_at: Date
    }, ExtArgs["result"]["requerimento"]>
    composites: {}
  }

  type RequerimentoGetPayload<S extends boolean | null | undefined | RequerimentoDefaultArgs> = $Result.GetResult<Prisma.$RequerimentoPayload, S>

  type RequerimentoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RequerimentoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RequerimentoCountAggregateInputType | true
    }

  export interface RequerimentoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Requerimento'], meta: { name: 'Requerimento' } }
    /**
     * Find zero or one Requerimento that matches the filter.
     * @param {RequerimentoFindUniqueArgs} args - Arguments to find a Requerimento
     * @example
     * // Get one Requerimento
     * const requerimento = await prisma.requerimento.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RequerimentoFindUniqueArgs>(args: SelectSubset<T, RequerimentoFindUniqueArgs<ExtArgs>>): Prisma__RequerimentoClient<$Result.GetResult<Prisma.$RequerimentoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Requerimento that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {RequerimentoFindUniqueOrThrowArgs} args - Arguments to find a Requerimento
     * @example
     * // Get one Requerimento
     * const requerimento = await prisma.requerimento.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RequerimentoFindUniqueOrThrowArgs>(args: SelectSubset<T, RequerimentoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RequerimentoClient<$Result.GetResult<Prisma.$RequerimentoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Requerimento that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequerimentoFindFirstArgs} args - Arguments to find a Requerimento
     * @example
     * // Get one Requerimento
     * const requerimento = await prisma.requerimento.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RequerimentoFindFirstArgs>(args?: SelectSubset<T, RequerimentoFindFirstArgs<ExtArgs>>): Prisma__RequerimentoClient<$Result.GetResult<Prisma.$RequerimentoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Requerimento that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequerimentoFindFirstOrThrowArgs} args - Arguments to find a Requerimento
     * @example
     * // Get one Requerimento
     * const requerimento = await prisma.requerimento.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RequerimentoFindFirstOrThrowArgs>(args?: SelectSubset<T, RequerimentoFindFirstOrThrowArgs<ExtArgs>>): Prisma__RequerimentoClient<$Result.GetResult<Prisma.$RequerimentoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Requerimentos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequerimentoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Requerimentos
     * const requerimentos = await prisma.requerimento.findMany()
     * 
     * // Get first 10 Requerimentos
     * const requerimentos = await prisma.requerimento.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const requerimentoWithIdOnly = await prisma.requerimento.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RequerimentoFindManyArgs>(args?: SelectSubset<T, RequerimentoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequerimentoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Requerimento.
     * @param {RequerimentoCreateArgs} args - Arguments to create a Requerimento.
     * @example
     * // Create one Requerimento
     * const Requerimento = await prisma.requerimento.create({
     *   data: {
     *     // ... data to create a Requerimento
     *   }
     * })
     * 
     */
    create<T extends RequerimentoCreateArgs>(args: SelectSubset<T, RequerimentoCreateArgs<ExtArgs>>): Prisma__RequerimentoClient<$Result.GetResult<Prisma.$RequerimentoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Requerimentos.
     * @param {RequerimentoCreateManyArgs} args - Arguments to create many Requerimentos.
     * @example
     * // Create many Requerimentos
     * const requerimento = await prisma.requerimento.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RequerimentoCreateManyArgs>(args?: SelectSubset<T, RequerimentoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Requerimentos and returns the data saved in the database.
     * @param {RequerimentoCreateManyAndReturnArgs} args - Arguments to create many Requerimentos.
     * @example
     * // Create many Requerimentos
     * const requerimento = await prisma.requerimento.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Requerimentos and only return the `id`
     * const requerimentoWithIdOnly = await prisma.requerimento.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RequerimentoCreateManyAndReturnArgs>(args?: SelectSubset<T, RequerimentoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequerimentoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Requerimento.
     * @param {RequerimentoDeleteArgs} args - Arguments to delete one Requerimento.
     * @example
     * // Delete one Requerimento
     * const Requerimento = await prisma.requerimento.delete({
     *   where: {
     *     // ... filter to delete one Requerimento
     *   }
     * })
     * 
     */
    delete<T extends RequerimentoDeleteArgs>(args: SelectSubset<T, RequerimentoDeleteArgs<ExtArgs>>): Prisma__RequerimentoClient<$Result.GetResult<Prisma.$RequerimentoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Requerimento.
     * @param {RequerimentoUpdateArgs} args - Arguments to update one Requerimento.
     * @example
     * // Update one Requerimento
     * const requerimento = await prisma.requerimento.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RequerimentoUpdateArgs>(args: SelectSubset<T, RequerimentoUpdateArgs<ExtArgs>>): Prisma__RequerimentoClient<$Result.GetResult<Prisma.$RequerimentoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Requerimentos.
     * @param {RequerimentoDeleteManyArgs} args - Arguments to filter Requerimentos to delete.
     * @example
     * // Delete a few Requerimentos
     * const { count } = await prisma.requerimento.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RequerimentoDeleteManyArgs>(args?: SelectSubset<T, RequerimentoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Requerimentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequerimentoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Requerimentos
     * const requerimento = await prisma.requerimento.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RequerimentoUpdateManyArgs>(args: SelectSubset<T, RequerimentoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Requerimento.
     * @param {RequerimentoUpsertArgs} args - Arguments to update or create a Requerimento.
     * @example
     * // Update or create a Requerimento
     * const requerimento = await prisma.requerimento.upsert({
     *   create: {
     *     // ... data to create a Requerimento
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Requerimento we want to update
     *   }
     * })
     */
    upsert<T extends RequerimentoUpsertArgs>(args: SelectSubset<T, RequerimentoUpsertArgs<ExtArgs>>): Prisma__RequerimentoClient<$Result.GetResult<Prisma.$RequerimentoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Requerimentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequerimentoCountArgs} args - Arguments to filter Requerimentos to count.
     * @example
     * // Count the number of Requerimentos
     * const count = await prisma.requerimento.count({
     *   where: {
     *     // ... the filter for the Requerimentos we want to count
     *   }
     * })
    **/
    count<T extends RequerimentoCountArgs>(
      args?: Subset<T, RequerimentoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RequerimentoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Requerimento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequerimentoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RequerimentoAggregateArgs>(args: Subset<T, RequerimentoAggregateArgs>): Prisma.PrismaPromise<GetRequerimentoAggregateType<T>>

    /**
     * Group by Requerimento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequerimentoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RequerimentoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RequerimentoGroupByArgs['orderBy'] }
        : { orderBy?: RequerimentoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RequerimentoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRequerimentoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Requerimento model
   */
  readonly fields: RequerimentoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Requerimento.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RequerimentoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    documentos<T extends Requerimento$documentosArgs<ExtArgs> = {}>(args?: Subset<T, Requerimento$documentosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Requerimento model
   */ 
  interface RequerimentoFieldRefs {
    readonly id: FieldRef<"Requerimento", 'String'>
    readonly clienteId: FieldRef<"Requerimento", 'String'>
    readonly processoId: FieldRef<"Requerimento", 'String'>
    readonly tipo: FieldRef<"Requerimento", 'String'>
    readonly status: FieldRef<"Requerimento", 'String'>
    readonly observacoes: FieldRef<"Requerimento", 'String'>
    readonly criadorId: FieldRef<"Requerimento", 'String'>
    readonly createdAt: FieldRef<"Requerimento", 'DateTime'>
    readonly updated_at: FieldRef<"Requerimento", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Requerimento findUnique
   */
  export type RequerimentoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requerimento
     */
    select?: RequerimentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequerimentoInclude<ExtArgs> | null
    /**
     * Filter, which Requerimento to fetch.
     */
    where: RequerimentoWhereUniqueInput
  }

  /**
   * Requerimento findUniqueOrThrow
   */
  export type RequerimentoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requerimento
     */
    select?: RequerimentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequerimentoInclude<ExtArgs> | null
    /**
     * Filter, which Requerimento to fetch.
     */
    where: RequerimentoWhereUniqueInput
  }

  /**
   * Requerimento findFirst
   */
  export type RequerimentoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requerimento
     */
    select?: RequerimentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequerimentoInclude<ExtArgs> | null
    /**
     * Filter, which Requerimento to fetch.
     */
    where?: RequerimentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Requerimentos to fetch.
     */
    orderBy?: RequerimentoOrderByWithRelationInput | RequerimentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Requerimentos.
     */
    cursor?: RequerimentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Requerimentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Requerimentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Requerimentos.
     */
    distinct?: RequerimentoScalarFieldEnum | RequerimentoScalarFieldEnum[]
  }

  /**
   * Requerimento findFirstOrThrow
   */
  export type RequerimentoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requerimento
     */
    select?: RequerimentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequerimentoInclude<ExtArgs> | null
    /**
     * Filter, which Requerimento to fetch.
     */
    where?: RequerimentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Requerimentos to fetch.
     */
    orderBy?: RequerimentoOrderByWithRelationInput | RequerimentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Requerimentos.
     */
    cursor?: RequerimentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Requerimentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Requerimentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Requerimentos.
     */
    distinct?: RequerimentoScalarFieldEnum | RequerimentoScalarFieldEnum[]
  }

  /**
   * Requerimento findMany
   */
  export type RequerimentoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requerimento
     */
    select?: RequerimentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequerimentoInclude<ExtArgs> | null
    /**
     * Filter, which Requerimentos to fetch.
     */
    where?: RequerimentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Requerimentos to fetch.
     */
    orderBy?: RequerimentoOrderByWithRelationInput | RequerimentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Requerimentos.
     */
    cursor?: RequerimentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Requerimentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Requerimentos.
     */
    skip?: number
    distinct?: RequerimentoScalarFieldEnum | RequerimentoScalarFieldEnum[]
  }

  /**
   * Requerimento create
   */
  export type RequerimentoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requerimento
     */
    select?: RequerimentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequerimentoInclude<ExtArgs> | null
    /**
     * The data needed to create a Requerimento.
     */
    data: XOR<RequerimentoCreateInput, RequerimentoUncheckedCreateInput>
  }

  /**
   * Requerimento createMany
   */
  export type RequerimentoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Requerimentos.
     */
    data: RequerimentoCreateManyInput | RequerimentoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Requerimento createManyAndReturn
   */
  export type RequerimentoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requerimento
     */
    select?: RequerimentoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Requerimentos.
     */
    data: RequerimentoCreateManyInput | RequerimentoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Requerimento update
   */
  export type RequerimentoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requerimento
     */
    select?: RequerimentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequerimentoInclude<ExtArgs> | null
    /**
     * The data needed to update a Requerimento.
     */
    data: XOR<RequerimentoUpdateInput, RequerimentoUncheckedUpdateInput>
    /**
     * Choose, which Requerimento to update.
     */
    where: RequerimentoWhereUniqueInput
  }

  /**
   * Requerimento updateMany
   */
  export type RequerimentoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Requerimentos.
     */
    data: XOR<RequerimentoUpdateManyMutationInput, RequerimentoUncheckedUpdateManyInput>
    /**
     * Filter which Requerimentos to update
     */
    where?: RequerimentoWhereInput
  }

  /**
   * Requerimento upsert
   */
  export type RequerimentoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requerimento
     */
    select?: RequerimentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequerimentoInclude<ExtArgs> | null
    /**
     * The filter to search for the Requerimento to update in case it exists.
     */
    where: RequerimentoWhereUniqueInput
    /**
     * In case the Requerimento found by the `where` argument doesn't exist, create a new Requerimento with this data.
     */
    create: XOR<RequerimentoCreateInput, RequerimentoUncheckedCreateInput>
    /**
     * In case the Requerimento was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RequerimentoUpdateInput, RequerimentoUncheckedUpdateInput>
  }

  /**
   * Requerimento delete
   */
  export type RequerimentoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requerimento
     */
    select?: RequerimentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequerimentoInclude<ExtArgs> | null
    /**
     * Filter which Requerimento to delete.
     */
    where: RequerimentoWhereUniqueInput
  }

  /**
   * Requerimento deleteMany
   */
  export type RequerimentoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Requerimentos to delete
     */
    where?: RequerimentoWhereInput
  }

  /**
   * Requerimento.documentos
   */
  export type Requerimento$documentosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    where?: DocumentoWhereInput
    orderBy?: DocumentoOrderByWithRelationInput | DocumentoOrderByWithRelationInput[]
    cursor?: DocumentoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: DocumentoScalarFieldEnum | DocumentoScalarFieldEnum[]
  }

  /**
   * Requerimento without action
   */
  export type RequerimentoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requerimento
     */
    select?: RequerimentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequerimentoInclude<ExtArgs> | null
  }


  /**
   * Model Documento
   */

  export type AggregateDocumento = {
    _count: DocumentoCountAggregateOutputType | null
    _avg: DocumentoAvgAggregateOutputType | null
    _sum: DocumentoSumAggregateOutputType | null
    _min: DocumentoMinAggregateOutputType | null
    _max: DocumentoMaxAggregateOutputType | null
  }

  export type DocumentoAvgAggregateOutputType = {
    tamanho: number | null
  }

  export type DocumentoSumAggregateOutputType = {
    tamanho: number | null
  }

  export type DocumentoMinAggregateOutputType = {
    id: string | null
    clienteId: string | null
    processoId: string | null
    dependenteId: string | null
    requerimentoId: string | null
    tipo: string | null
    nomeOriginal: string | null
    nomeArquivo: string | null
    storagePath: string | null
    publicUrl: string | null
    contentType: string | null
    tamanho: number | null
    status: $Enums.StatusDocumento | null
    apostilado: boolean | null
    traduzido: boolean | null
    motivoRejeicao: string | null
    analisadoPor: string | null
    analisadoEm: Date | null
    solicitadoPeloJuridico: boolean | null
    dataSolicitacaoJuridico: Date | null
    criadoEm: Date | null
    atualizadoEm: Date | null
  }

  export type DocumentoMaxAggregateOutputType = {
    id: string | null
    clienteId: string | null
    processoId: string | null
    dependenteId: string | null
    requerimentoId: string | null
    tipo: string | null
    nomeOriginal: string | null
    nomeArquivo: string | null
    storagePath: string | null
    publicUrl: string | null
    contentType: string | null
    tamanho: number | null
    status: $Enums.StatusDocumento | null
    apostilado: boolean | null
    traduzido: boolean | null
    motivoRejeicao: string | null
    analisadoPor: string | null
    analisadoEm: Date | null
    solicitadoPeloJuridico: boolean | null
    dataSolicitacaoJuridico: Date | null
    criadoEm: Date | null
    atualizadoEm: Date | null
  }

  export type DocumentoCountAggregateOutputType = {
    id: number
    clienteId: number
    processoId: number
    dependenteId: number
    requerimentoId: number
    tipo: number
    nomeOriginal: number
    nomeArquivo: number
    storagePath: number
    publicUrl: number
    contentType: number
    tamanho: number
    status: number
    apostilado: number
    traduzido: number
    motivoRejeicao: number
    analisadoPor: number
    analisadoEm: number
    solicitadoPeloJuridico: number
    dataSolicitacaoJuridico: number
    criadoEm: number
    atualizadoEm: number
    _all: number
  }


  export type DocumentoAvgAggregateInputType = {
    tamanho?: true
  }

  export type DocumentoSumAggregateInputType = {
    tamanho?: true
  }

  export type DocumentoMinAggregateInputType = {
    id?: true
    clienteId?: true
    processoId?: true
    dependenteId?: true
    requerimentoId?: true
    tipo?: true
    nomeOriginal?: true
    nomeArquivo?: true
    storagePath?: true
    publicUrl?: true
    contentType?: true
    tamanho?: true
    status?: true
    apostilado?: true
    traduzido?: true
    motivoRejeicao?: true
    analisadoPor?: true
    analisadoEm?: true
    solicitadoPeloJuridico?: true
    dataSolicitacaoJuridico?: true
    criadoEm?: true
    atualizadoEm?: true
  }

  export type DocumentoMaxAggregateInputType = {
    id?: true
    clienteId?: true
    processoId?: true
    dependenteId?: true
    requerimentoId?: true
    tipo?: true
    nomeOriginal?: true
    nomeArquivo?: true
    storagePath?: true
    publicUrl?: true
    contentType?: true
    tamanho?: true
    status?: true
    apostilado?: true
    traduzido?: true
    motivoRejeicao?: true
    analisadoPor?: true
    analisadoEm?: true
    solicitadoPeloJuridico?: true
    dataSolicitacaoJuridico?: true
    criadoEm?: true
    atualizadoEm?: true
  }

  export type DocumentoCountAggregateInputType = {
    id?: true
    clienteId?: true
    processoId?: true
    dependenteId?: true
    requerimentoId?: true
    tipo?: true
    nomeOriginal?: true
    nomeArquivo?: true
    storagePath?: true
    publicUrl?: true
    contentType?: true
    tamanho?: true
    status?: true
    apostilado?: true
    traduzido?: true
    motivoRejeicao?: true
    analisadoPor?: true
    analisadoEm?: true
    solicitadoPeloJuridico?: true
    dataSolicitacaoJuridico?: true
    criadoEm?: true
    atualizadoEm?: true
    _all?: true
  }

  export type DocumentoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Documento to aggregate.
     */
    where?: DocumentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Documentos to fetch.
     */
    orderBy?: DocumentoOrderByWithRelationInput | DocumentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DocumentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Documentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Documentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Documentos
    **/
    _count?: true | DocumentoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DocumentoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DocumentoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DocumentoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DocumentoMaxAggregateInputType
  }

  export type GetDocumentoAggregateType<T extends DocumentoAggregateArgs> = {
        [P in keyof T & keyof AggregateDocumento]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDocumento[P]>
      : GetScalarType<T[P], AggregateDocumento[P]>
  }




  export type DocumentoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DocumentoWhereInput
    orderBy?: DocumentoOrderByWithAggregationInput | DocumentoOrderByWithAggregationInput[]
    by: DocumentoScalarFieldEnum[] | DocumentoScalarFieldEnum
    having?: DocumentoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DocumentoCountAggregateInputType | true
    _avg?: DocumentoAvgAggregateInputType
    _sum?: DocumentoSumAggregateInputType
    _min?: DocumentoMinAggregateInputType
    _max?: DocumentoMaxAggregateInputType
  }

  export type DocumentoGroupByOutputType = {
    id: string
    clienteId: string
    processoId: string | null
    dependenteId: string | null
    requerimentoId: string | null
    tipo: string
    nomeOriginal: string
    nomeArquivo: string
    storagePath: string
    publicUrl: string | null
    contentType: string | null
    tamanho: number | null
    status: $Enums.StatusDocumento
    apostilado: boolean
    traduzido: boolean
    motivoRejeicao: string | null
    analisadoPor: string | null
    analisadoEm: Date | null
    solicitadoPeloJuridico: boolean
    dataSolicitacaoJuridico: Date | null
    criadoEm: Date
    atualizadoEm: Date
    _count: DocumentoCountAggregateOutputType | null
    _avg: DocumentoAvgAggregateOutputType | null
    _sum: DocumentoSumAggregateOutputType | null
    _min: DocumentoMinAggregateOutputType | null
    _max: DocumentoMaxAggregateOutputType | null
  }

  type GetDocumentoGroupByPayload<T extends DocumentoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DocumentoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DocumentoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DocumentoGroupByOutputType[P]>
            : GetScalarType<T[P], DocumentoGroupByOutputType[P]>
        }
      >
    >


  export type DocumentoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clienteId?: boolean
    processoId?: boolean
    dependenteId?: boolean
    requerimentoId?: boolean
    tipo?: boolean
    nomeOriginal?: boolean
    nomeArquivo?: boolean
    storagePath?: boolean
    publicUrl?: boolean
    contentType?: boolean
    tamanho?: boolean
    status?: boolean
    apostilado?: boolean
    traduzido?: boolean
    motivoRejeicao?: boolean
    analisadoPor?: boolean
    analisadoEm?: boolean
    solicitadoPeloJuridico?: boolean
    dataSolicitacaoJuridico?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
    processo?: boolean | Documento$processoArgs<ExtArgs>
    dependente?: boolean | Documento$dependenteArgs<ExtArgs>
    requerimento?: boolean | Documento$requerimentoArgs<ExtArgs>
    apostilamento?: boolean | Documento$apostilamentoArgs<ExtArgs>
  }, ExtArgs["result"]["documento"]>

  export type DocumentoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clienteId?: boolean
    processoId?: boolean
    dependenteId?: boolean
    requerimentoId?: boolean
    tipo?: boolean
    nomeOriginal?: boolean
    nomeArquivo?: boolean
    storagePath?: boolean
    publicUrl?: boolean
    contentType?: boolean
    tamanho?: boolean
    status?: boolean
    apostilado?: boolean
    traduzido?: boolean
    motivoRejeicao?: boolean
    analisadoPor?: boolean
    analisadoEm?: boolean
    solicitadoPeloJuridico?: boolean
    dataSolicitacaoJuridico?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
    processo?: boolean | Documento$processoArgs<ExtArgs>
    dependente?: boolean | Documento$dependenteArgs<ExtArgs>
    requerimento?: boolean | Documento$requerimentoArgs<ExtArgs>
  }, ExtArgs["result"]["documento"]>

  export type DocumentoSelectScalar = {
    id?: boolean
    clienteId?: boolean
    processoId?: boolean
    dependenteId?: boolean
    requerimentoId?: boolean
    tipo?: boolean
    nomeOriginal?: boolean
    nomeArquivo?: boolean
    storagePath?: boolean
    publicUrl?: boolean
    contentType?: boolean
    tamanho?: boolean
    status?: boolean
    apostilado?: boolean
    traduzido?: boolean
    motivoRejeicao?: boolean
    analisadoPor?: boolean
    analisadoEm?: boolean
    solicitadoPeloJuridico?: boolean
    dataSolicitacaoJuridico?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
  }

  export type DocumentoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | Documento$processoArgs<ExtArgs>
    dependente?: boolean | Documento$dependenteArgs<ExtArgs>
    requerimento?: boolean | Documento$requerimentoArgs<ExtArgs>
    apostilamento?: boolean | Documento$apostilamentoArgs<ExtArgs>
  }
  export type DocumentoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    processo?: boolean | Documento$processoArgs<ExtArgs>
    dependente?: boolean | Documento$dependenteArgs<ExtArgs>
    requerimento?: boolean | Documento$requerimentoArgs<ExtArgs>
  }

  export type $DocumentoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Documento"
    objects: {
      processo: Prisma.$ProcessoPayload<ExtArgs> | null
      dependente: Prisma.$DependentePayload<ExtArgs> | null
      requerimento: Prisma.$RequerimentoPayload<ExtArgs> | null
      apostilamento: Prisma.$ApostilamentoPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      clienteId: string
      processoId: string | null
      dependenteId: string | null
      requerimentoId: string | null
      tipo: string
      nomeOriginal: string
      nomeArquivo: string
      storagePath: string
      publicUrl: string | null
      contentType: string | null
      tamanho: number | null
      status: $Enums.StatusDocumento
      apostilado: boolean
      traduzido: boolean
      motivoRejeicao: string | null
      analisadoPor: string | null
      analisadoEm: Date | null
      solicitadoPeloJuridico: boolean
      dataSolicitacaoJuridico: Date | null
      criadoEm: Date
      atualizadoEm: Date
    }, ExtArgs["result"]["documento"]>
    composites: {}
  }

  type DocumentoGetPayload<S extends boolean | null | undefined | DocumentoDefaultArgs> = $Result.GetResult<Prisma.$DocumentoPayload, S>

  type DocumentoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DocumentoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DocumentoCountAggregateInputType | true
    }

  export interface DocumentoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Documento'], meta: { name: 'Documento' } }
    /**
     * Find zero or one Documento that matches the filter.
     * @param {DocumentoFindUniqueArgs} args - Arguments to find a Documento
     * @example
     * // Get one Documento
     * const documento = await prisma.documento.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DocumentoFindUniqueArgs>(args: SelectSubset<T, DocumentoFindUniqueArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Documento that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DocumentoFindUniqueOrThrowArgs} args - Arguments to find a Documento
     * @example
     * // Get one Documento
     * const documento = await prisma.documento.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DocumentoFindUniqueOrThrowArgs>(args: SelectSubset<T, DocumentoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Documento that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoFindFirstArgs} args - Arguments to find a Documento
     * @example
     * // Get one Documento
     * const documento = await prisma.documento.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DocumentoFindFirstArgs>(args?: SelectSubset<T, DocumentoFindFirstArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Documento that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoFindFirstOrThrowArgs} args - Arguments to find a Documento
     * @example
     * // Get one Documento
     * const documento = await prisma.documento.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DocumentoFindFirstOrThrowArgs>(args?: SelectSubset<T, DocumentoFindFirstOrThrowArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Documentos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Documentos
     * const documentos = await prisma.documento.findMany()
     * 
     * // Get first 10 Documentos
     * const documentos = await prisma.documento.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const documentoWithIdOnly = await prisma.documento.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DocumentoFindManyArgs>(args?: SelectSubset<T, DocumentoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Documento.
     * @param {DocumentoCreateArgs} args - Arguments to create a Documento.
     * @example
     * // Create one Documento
     * const Documento = await prisma.documento.create({
     *   data: {
     *     // ... data to create a Documento
     *   }
     * })
     * 
     */
    create<T extends DocumentoCreateArgs>(args: SelectSubset<T, DocumentoCreateArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Documentos.
     * @param {DocumentoCreateManyArgs} args - Arguments to create many Documentos.
     * @example
     * // Create many Documentos
     * const documento = await prisma.documento.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DocumentoCreateManyArgs>(args?: SelectSubset<T, DocumentoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Documentos and returns the data saved in the database.
     * @param {DocumentoCreateManyAndReturnArgs} args - Arguments to create many Documentos.
     * @example
     * // Create many Documentos
     * const documento = await prisma.documento.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Documentos and only return the `id`
     * const documentoWithIdOnly = await prisma.documento.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DocumentoCreateManyAndReturnArgs>(args?: SelectSubset<T, DocumentoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Documento.
     * @param {DocumentoDeleteArgs} args - Arguments to delete one Documento.
     * @example
     * // Delete one Documento
     * const Documento = await prisma.documento.delete({
     *   where: {
     *     // ... filter to delete one Documento
     *   }
     * })
     * 
     */
    delete<T extends DocumentoDeleteArgs>(args: SelectSubset<T, DocumentoDeleteArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Documento.
     * @param {DocumentoUpdateArgs} args - Arguments to update one Documento.
     * @example
     * // Update one Documento
     * const documento = await prisma.documento.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DocumentoUpdateArgs>(args: SelectSubset<T, DocumentoUpdateArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Documentos.
     * @param {DocumentoDeleteManyArgs} args - Arguments to filter Documentos to delete.
     * @example
     * // Delete a few Documentos
     * const { count } = await prisma.documento.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DocumentoDeleteManyArgs>(args?: SelectSubset<T, DocumentoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Documentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Documentos
     * const documento = await prisma.documento.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DocumentoUpdateManyArgs>(args: SelectSubset<T, DocumentoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Documento.
     * @param {DocumentoUpsertArgs} args - Arguments to update or create a Documento.
     * @example
     * // Update or create a Documento
     * const documento = await prisma.documento.upsert({
     *   create: {
     *     // ... data to create a Documento
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Documento we want to update
     *   }
     * })
     */
    upsert<T extends DocumentoUpsertArgs>(args: SelectSubset<T, DocumentoUpsertArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Documentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoCountArgs} args - Arguments to filter Documentos to count.
     * @example
     * // Count the number of Documentos
     * const count = await prisma.documento.count({
     *   where: {
     *     // ... the filter for the Documentos we want to count
     *   }
     * })
    **/
    count<T extends DocumentoCountArgs>(
      args?: Subset<T, DocumentoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DocumentoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Documento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DocumentoAggregateArgs>(args: Subset<T, DocumentoAggregateArgs>): Prisma.PrismaPromise<GetDocumentoAggregateType<T>>

    /**
     * Group by Documento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DocumentoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DocumentoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DocumentoGroupByArgs['orderBy'] }
        : { orderBy?: DocumentoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DocumentoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDocumentoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Documento model
   */
  readonly fields: DocumentoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Documento.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DocumentoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    processo<T extends Documento$processoArgs<ExtArgs> = {}>(args?: Subset<T, Documento$processoArgs<ExtArgs>>): Prisma__ProcessoClient<$Result.GetResult<Prisma.$ProcessoPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    dependente<T extends Documento$dependenteArgs<ExtArgs> = {}>(args?: Subset<T, Documento$dependenteArgs<ExtArgs>>): Prisma__DependenteClient<$Result.GetResult<Prisma.$DependentePayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    requerimento<T extends Documento$requerimentoArgs<ExtArgs> = {}>(args?: Subset<T, Documento$requerimentoArgs<ExtArgs>>): Prisma__RequerimentoClient<$Result.GetResult<Prisma.$RequerimentoPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    apostilamento<T extends Documento$apostilamentoArgs<ExtArgs> = {}>(args?: Subset<T, Documento$apostilamentoArgs<ExtArgs>>): Prisma__ApostilamentoClient<$Result.GetResult<Prisma.$ApostilamentoPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Documento model
   */ 
  interface DocumentoFieldRefs {
    readonly id: FieldRef<"Documento", 'String'>
    readonly clienteId: FieldRef<"Documento", 'String'>
    readonly processoId: FieldRef<"Documento", 'String'>
    readonly dependenteId: FieldRef<"Documento", 'String'>
    readonly requerimentoId: FieldRef<"Documento", 'String'>
    readonly tipo: FieldRef<"Documento", 'String'>
    readonly nomeOriginal: FieldRef<"Documento", 'String'>
    readonly nomeArquivo: FieldRef<"Documento", 'String'>
    readonly storagePath: FieldRef<"Documento", 'String'>
    readonly publicUrl: FieldRef<"Documento", 'String'>
    readonly contentType: FieldRef<"Documento", 'String'>
    readonly tamanho: FieldRef<"Documento", 'Int'>
    readonly status: FieldRef<"Documento", 'StatusDocumento'>
    readonly apostilado: FieldRef<"Documento", 'Boolean'>
    readonly traduzido: FieldRef<"Documento", 'Boolean'>
    readonly motivoRejeicao: FieldRef<"Documento", 'String'>
    readonly analisadoPor: FieldRef<"Documento", 'String'>
    readonly analisadoEm: FieldRef<"Documento", 'DateTime'>
    readonly solicitadoPeloJuridico: FieldRef<"Documento", 'Boolean'>
    readonly dataSolicitacaoJuridico: FieldRef<"Documento", 'DateTime'>
    readonly criadoEm: FieldRef<"Documento", 'DateTime'>
    readonly atualizadoEm: FieldRef<"Documento", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Documento findUnique
   */
  export type DocumentoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * Filter, which Documento to fetch.
     */
    where: DocumentoWhereUniqueInput
  }

  /**
   * Documento findUniqueOrThrow
   */
  export type DocumentoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * Filter, which Documento to fetch.
     */
    where: DocumentoWhereUniqueInput
  }

  /**
   * Documento findFirst
   */
  export type DocumentoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * Filter, which Documento to fetch.
     */
    where?: DocumentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Documentos to fetch.
     */
    orderBy?: DocumentoOrderByWithRelationInput | DocumentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Documentos.
     */
    cursor?: DocumentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Documentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Documentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Documentos.
     */
    distinct?: DocumentoScalarFieldEnum | DocumentoScalarFieldEnum[]
  }

  /**
   * Documento findFirstOrThrow
   */
  export type DocumentoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * Filter, which Documento to fetch.
     */
    where?: DocumentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Documentos to fetch.
     */
    orderBy?: DocumentoOrderByWithRelationInput | DocumentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Documentos.
     */
    cursor?: DocumentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Documentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Documentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Documentos.
     */
    distinct?: DocumentoScalarFieldEnum | DocumentoScalarFieldEnum[]
  }

  /**
   * Documento findMany
   */
  export type DocumentoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * Filter, which Documentos to fetch.
     */
    where?: DocumentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Documentos to fetch.
     */
    orderBy?: DocumentoOrderByWithRelationInput | DocumentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Documentos.
     */
    cursor?: DocumentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Documentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Documentos.
     */
    skip?: number
    distinct?: DocumentoScalarFieldEnum | DocumentoScalarFieldEnum[]
  }

  /**
   * Documento create
   */
  export type DocumentoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * The data needed to create a Documento.
     */
    data: XOR<DocumentoCreateInput, DocumentoUncheckedCreateInput>
  }

  /**
   * Documento createMany
   */
  export type DocumentoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Documentos.
     */
    data: DocumentoCreateManyInput | DocumentoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Documento createManyAndReturn
   */
  export type DocumentoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Documentos.
     */
    data: DocumentoCreateManyInput | DocumentoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Documento update
   */
  export type DocumentoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * The data needed to update a Documento.
     */
    data: XOR<DocumentoUpdateInput, DocumentoUncheckedUpdateInput>
    /**
     * Choose, which Documento to update.
     */
    where: DocumentoWhereUniqueInput
  }

  /**
   * Documento updateMany
   */
  export type DocumentoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Documentos.
     */
    data: XOR<DocumentoUpdateManyMutationInput, DocumentoUncheckedUpdateManyInput>
    /**
     * Filter which Documentos to update
     */
    where?: DocumentoWhereInput
  }

  /**
   * Documento upsert
   */
  export type DocumentoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * The filter to search for the Documento to update in case it exists.
     */
    where: DocumentoWhereUniqueInput
    /**
     * In case the Documento found by the `where` argument doesn't exist, create a new Documento with this data.
     */
    create: XOR<DocumentoCreateInput, DocumentoUncheckedCreateInput>
    /**
     * In case the Documento was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DocumentoUpdateInput, DocumentoUncheckedUpdateInput>
  }

  /**
   * Documento delete
   */
  export type DocumentoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
    /**
     * Filter which Documento to delete.
     */
    where: DocumentoWhereUniqueInput
  }

  /**
   * Documento deleteMany
   */
  export type DocumentoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Documentos to delete
     */
    where?: DocumentoWhereInput
  }

  /**
   * Documento.processo
   */
  export type Documento$processoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Processo
     */
    select?: ProcessoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProcessoInclude<ExtArgs> | null
    where?: ProcessoWhereInput
  }

  /**
   * Documento.dependente
   */
  export type Documento$dependenteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Dependente
     */
    select?: DependenteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DependenteInclude<ExtArgs> | null
    where?: DependenteWhereInput
  }

  /**
   * Documento.requerimento
   */
  export type Documento$requerimentoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Requerimento
     */
    select?: RequerimentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequerimentoInclude<ExtArgs> | null
    where?: RequerimentoWhereInput
  }

  /**
   * Documento.apostilamento
   */
  export type Documento$apostilamentoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apostilamento
     */
    select?: ApostilamentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApostilamentoInclude<ExtArgs> | null
    where?: ApostilamentoWhereInput
  }

  /**
   * Documento without action
   */
  export type DocumentoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Documento
     */
    select?: DocumentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DocumentoInclude<ExtArgs> | null
  }


  /**
   * Model Configuracao
   */

  export type AggregateConfiguracao = {
    _count: ConfiguracaoCountAggregateOutputType | null
    _min: ConfiguracaoMinAggregateOutputType | null
    _max: ConfiguracaoMaxAggregateOutputType | null
  }

  export type ConfiguracaoMinAggregateOutputType = {
    chave: string | null
    valor: string | null
    criadoEm: Date | null
    atualizadoEm: Date | null
  }

  export type ConfiguracaoMaxAggregateOutputType = {
    chave: string | null
    valor: string | null
    criadoEm: Date | null
    atualizadoEm: Date | null
  }

  export type ConfiguracaoCountAggregateOutputType = {
    chave: number
    valor: number
    criadoEm: number
    atualizadoEm: number
    _all: number
  }


  export type ConfiguracaoMinAggregateInputType = {
    chave?: true
    valor?: true
    criadoEm?: true
    atualizadoEm?: true
  }

  export type ConfiguracaoMaxAggregateInputType = {
    chave?: true
    valor?: true
    criadoEm?: true
    atualizadoEm?: true
  }

  export type ConfiguracaoCountAggregateInputType = {
    chave?: true
    valor?: true
    criadoEm?: true
    atualizadoEm?: true
    _all?: true
  }

  export type ConfiguracaoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Configuracao to aggregate.
     */
    where?: ConfiguracaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Configuracaos to fetch.
     */
    orderBy?: ConfiguracaoOrderByWithRelationInput | ConfiguracaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConfiguracaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Configuracaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Configuracaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Configuracaos
    **/
    _count?: true | ConfiguracaoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConfiguracaoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConfiguracaoMaxAggregateInputType
  }

  export type GetConfiguracaoAggregateType<T extends ConfiguracaoAggregateArgs> = {
        [P in keyof T & keyof AggregateConfiguracao]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConfiguracao[P]>
      : GetScalarType<T[P], AggregateConfiguracao[P]>
  }




  export type ConfiguracaoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConfiguracaoWhereInput
    orderBy?: ConfiguracaoOrderByWithAggregationInput | ConfiguracaoOrderByWithAggregationInput[]
    by: ConfiguracaoScalarFieldEnum[] | ConfiguracaoScalarFieldEnum
    having?: ConfiguracaoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConfiguracaoCountAggregateInputType | true
    _min?: ConfiguracaoMinAggregateInputType
    _max?: ConfiguracaoMaxAggregateInputType
  }

  export type ConfiguracaoGroupByOutputType = {
    chave: string
    valor: string
    criadoEm: Date
    atualizadoEm: Date
    _count: ConfiguracaoCountAggregateOutputType | null
    _min: ConfiguracaoMinAggregateOutputType | null
    _max: ConfiguracaoMaxAggregateOutputType | null
  }

  type GetConfiguracaoGroupByPayload<T extends ConfiguracaoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConfiguracaoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConfiguracaoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConfiguracaoGroupByOutputType[P]>
            : GetScalarType<T[P], ConfiguracaoGroupByOutputType[P]>
        }
      >
    >


  export type ConfiguracaoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    chave?: boolean
    valor?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
  }, ExtArgs["result"]["configuracao"]>

  export type ConfiguracaoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    chave?: boolean
    valor?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
  }, ExtArgs["result"]["configuracao"]>

  export type ConfiguracaoSelectScalar = {
    chave?: boolean
    valor?: boolean
    criadoEm?: boolean
    atualizadoEm?: boolean
  }


  export type $ConfiguracaoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Configuracao"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      chave: string
      valor: string
      criadoEm: Date
      atualizadoEm: Date
    }, ExtArgs["result"]["configuracao"]>
    composites: {}
  }

  type ConfiguracaoGetPayload<S extends boolean | null | undefined | ConfiguracaoDefaultArgs> = $Result.GetResult<Prisma.$ConfiguracaoPayload, S>

  type ConfiguracaoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ConfiguracaoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ConfiguracaoCountAggregateInputType | true
    }

  export interface ConfiguracaoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Configuracao'], meta: { name: 'Configuracao' } }
    /**
     * Find zero or one Configuracao that matches the filter.
     * @param {ConfiguracaoFindUniqueArgs} args - Arguments to find a Configuracao
     * @example
     * // Get one Configuracao
     * const configuracao = await prisma.configuracao.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConfiguracaoFindUniqueArgs>(args: SelectSubset<T, ConfiguracaoFindUniqueArgs<ExtArgs>>): Prisma__ConfiguracaoClient<$Result.GetResult<Prisma.$ConfiguracaoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Configuracao that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ConfiguracaoFindUniqueOrThrowArgs} args - Arguments to find a Configuracao
     * @example
     * // Get one Configuracao
     * const configuracao = await prisma.configuracao.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConfiguracaoFindUniqueOrThrowArgs>(args: SelectSubset<T, ConfiguracaoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConfiguracaoClient<$Result.GetResult<Prisma.$ConfiguracaoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Configuracao that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfiguracaoFindFirstArgs} args - Arguments to find a Configuracao
     * @example
     * // Get one Configuracao
     * const configuracao = await prisma.configuracao.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConfiguracaoFindFirstArgs>(args?: SelectSubset<T, ConfiguracaoFindFirstArgs<ExtArgs>>): Prisma__ConfiguracaoClient<$Result.GetResult<Prisma.$ConfiguracaoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Configuracao that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfiguracaoFindFirstOrThrowArgs} args - Arguments to find a Configuracao
     * @example
     * // Get one Configuracao
     * const configuracao = await prisma.configuracao.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConfiguracaoFindFirstOrThrowArgs>(args?: SelectSubset<T, ConfiguracaoFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConfiguracaoClient<$Result.GetResult<Prisma.$ConfiguracaoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Configuracaos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfiguracaoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Configuracaos
     * const configuracaos = await prisma.configuracao.findMany()
     * 
     * // Get first 10 Configuracaos
     * const configuracaos = await prisma.configuracao.findMany({ take: 10 })
     * 
     * // Only select the `chave`
     * const configuracaoWithChaveOnly = await prisma.configuracao.findMany({ select: { chave: true } })
     * 
     */
    findMany<T extends ConfiguracaoFindManyArgs>(args?: SelectSubset<T, ConfiguracaoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConfiguracaoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Configuracao.
     * @param {ConfiguracaoCreateArgs} args - Arguments to create a Configuracao.
     * @example
     * // Create one Configuracao
     * const Configuracao = await prisma.configuracao.create({
     *   data: {
     *     // ... data to create a Configuracao
     *   }
     * })
     * 
     */
    create<T extends ConfiguracaoCreateArgs>(args: SelectSubset<T, ConfiguracaoCreateArgs<ExtArgs>>): Prisma__ConfiguracaoClient<$Result.GetResult<Prisma.$ConfiguracaoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Configuracaos.
     * @param {ConfiguracaoCreateManyArgs} args - Arguments to create many Configuracaos.
     * @example
     * // Create many Configuracaos
     * const configuracao = await prisma.configuracao.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConfiguracaoCreateManyArgs>(args?: SelectSubset<T, ConfiguracaoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Configuracaos and returns the data saved in the database.
     * @param {ConfiguracaoCreateManyAndReturnArgs} args - Arguments to create many Configuracaos.
     * @example
     * // Create many Configuracaos
     * const configuracao = await prisma.configuracao.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Configuracaos and only return the `chave`
     * const configuracaoWithChaveOnly = await prisma.configuracao.createManyAndReturn({ 
     *   select: { chave: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ConfiguracaoCreateManyAndReturnArgs>(args?: SelectSubset<T, ConfiguracaoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConfiguracaoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Configuracao.
     * @param {ConfiguracaoDeleteArgs} args - Arguments to delete one Configuracao.
     * @example
     * // Delete one Configuracao
     * const Configuracao = await prisma.configuracao.delete({
     *   where: {
     *     // ... filter to delete one Configuracao
     *   }
     * })
     * 
     */
    delete<T extends ConfiguracaoDeleteArgs>(args: SelectSubset<T, ConfiguracaoDeleteArgs<ExtArgs>>): Prisma__ConfiguracaoClient<$Result.GetResult<Prisma.$ConfiguracaoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Configuracao.
     * @param {ConfiguracaoUpdateArgs} args - Arguments to update one Configuracao.
     * @example
     * // Update one Configuracao
     * const configuracao = await prisma.configuracao.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConfiguracaoUpdateArgs>(args: SelectSubset<T, ConfiguracaoUpdateArgs<ExtArgs>>): Prisma__ConfiguracaoClient<$Result.GetResult<Prisma.$ConfiguracaoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Configuracaos.
     * @param {ConfiguracaoDeleteManyArgs} args - Arguments to filter Configuracaos to delete.
     * @example
     * // Delete a few Configuracaos
     * const { count } = await prisma.configuracao.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConfiguracaoDeleteManyArgs>(args?: SelectSubset<T, ConfiguracaoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Configuracaos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfiguracaoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Configuracaos
     * const configuracao = await prisma.configuracao.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConfiguracaoUpdateManyArgs>(args: SelectSubset<T, ConfiguracaoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Configuracao.
     * @param {ConfiguracaoUpsertArgs} args - Arguments to update or create a Configuracao.
     * @example
     * // Update or create a Configuracao
     * const configuracao = await prisma.configuracao.upsert({
     *   create: {
     *     // ... data to create a Configuracao
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Configuracao we want to update
     *   }
     * })
     */
    upsert<T extends ConfiguracaoUpsertArgs>(args: SelectSubset<T, ConfiguracaoUpsertArgs<ExtArgs>>): Prisma__ConfiguracaoClient<$Result.GetResult<Prisma.$ConfiguracaoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Configuracaos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfiguracaoCountArgs} args - Arguments to filter Configuracaos to count.
     * @example
     * // Count the number of Configuracaos
     * const count = await prisma.configuracao.count({
     *   where: {
     *     // ... the filter for the Configuracaos we want to count
     *   }
     * })
    **/
    count<T extends ConfiguracaoCountArgs>(
      args?: Subset<T, ConfiguracaoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConfiguracaoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Configuracao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfiguracaoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ConfiguracaoAggregateArgs>(args: Subset<T, ConfiguracaoAggregateArgs>): Prisma.PrismaPromise<GetConfiguracaoAggregateType<T>>

    /**
     * Group by Configuracao.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConfiguracaoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ConfiguracaoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConfiguracaoGroupByArgs['orderBy'] }
        : { orderBy?: ConfiguracaoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ConfiguracaoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConfiguracaoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Configuracao model
   */
  readonly fields: ConfiguracaoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Configuracao.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConfiguracaoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Configuracao model
   */ 
  interface ConfiguracaoFieldRefs {
    readonly chave: FieldRef<"Configuracao", 'String'>
    readonly valor: FieldRef<"Configuracao", 'String'>
    readonly criadoEm: FieldRef<"Configuracao", 'DateTime'>
    readonly atualizadoEm: FieldRef<"Configuracao", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Configuracao findUnique
   */
  export type ConfiguracaoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Configuracao
     */
    select?: ConfiguracaoSelect<ExtArgs> | null
    /**
     * Filter, which Configuracao to fetch.
     */
    where: ConfiguracaoWhereUniqueInput
  }

  /**
   * Configuracao findUniqueOrThrow
   */
  export type ConfiguracaoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Configuracao
     */
    select?: ConfiguracaoSelect<ExtArgs> | null
    /**
     * Filter, which Configuracao to fetch.
     */
    where: ConfiguracaoWhereUniqueInput
  }

  /**
   * Configuracao findFirst
   */
  export type ConfiguracaoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Configuracao
     */
    select?: ConfiguracaoSelect<ExtArgs> | null
    /**
     * Filter, which Configuracao to fetch.
     */
    where?: ConfiguracaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Configuracaos to fetch.
     */
    orderBy?: ConfiguracaoOrderByWithRelationInput | ConfiguracaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Configuracaos.
     */
    cursor?: ConfiguracaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Configuracaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Configuracaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Configuracaos.
     */
    distinct?: ConfiguracaoScalarFieldEnum | ConfiguracaoScalarFieldEnum[]
  }

  /**
   * Configuracao findFirstOrThrow
   */
  export type ConfiguracaoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Configuracao
     */
    select?: ConfiguracaoSelect<ExtArgs> | null
    /**
     * Filter, which Configuracao to fetch.
     */
    where?: ConfiguracaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Configuracaos to fetch.
     */
    orderBy?: ConfiguracaoOrderByWithRelationInput | ConfiguracaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Configuracaos.
     */
    cursor?: ConfiguracaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Configuracaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Configuracaos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Configuracaos.
     */
    distinct?: ConfiguracaoScalarFieldEnum | ConfiguracaoScalarFieldEnum[]
  }

  /**
   * Configuracao findMany
   */
  export type ConfiguracaoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Configuracao
     */
    select?: ConfiguracaoSelect<ExtArgs> | null
    /**
     * Filter, which Configuracaos to fetch.
     */
    where?: ConfiguracaoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Configuracaos to fetch.
     */
    orderBy?: ConfiguracaoOrderByWithRelationInput | ConfiguracaoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Configuracaos.
     */
    cursor?: ConfiguracaoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Configuracaos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Configuracaos.
     */
    skip?: number
    distinct?: ConfiguracaoScalarFieldEnum | ConfiguracaoScalarFieldEnum[]
  }

  /**
   * Configuracao create
   */
  export type ConfiguracaoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Configuracao
     */
    select?: ConfiguracaoSelect<ExtArgs> | null
    /**
     * The data needed to create a Configuracao.
     */
    data: XOR<ConfiguracaoCreateInput, ConfiguracaoUncheckedCreateInput>
  }

  /**
   * Configuracao createMany
   */
  export type ConfiguracaoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Configuracaos.
     */
    data: ConfiguracaoCreateManyInput | ConfiguracaoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Configuracao createManyAndReturn
   */
  export type ConfiguracaoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Configuracao
     */
    select?: ConfiguracaoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Configuracaos.
     */
    data: ConfiguracaoCreateManyInput | ConfiguracaoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Configuracao update
   */
  export type ConfiguracaoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Configuracao
     */
    select?: ConfiguracaoSelect<ExtArgs> | null
    /**
     * The data needed to update a Configuracao.
     */
    data: XOR<ConfiguracaoUpdateInput, ConfiguracaoUncheckedUpdateInput>
    /**
     * Choose, which Configuracao to update.
     */
    where: ConfiguracaoWhereUniqueInput
  }

  /**
   * Configuracao updateMany
   */
  export type ConfiguracaoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Configuracaos.
     */
    data: XOR<ConfiguracaoUpdateManyMutationInput, ConfiguracaoUncheckedUpdateManyInput>
    /**
     * Filter which Configuracaos to update
     */
    where?: ConfiguracaoWhereInput
  }

  /**
   * Configuracao upsert
   */
  export type ConfiguracaoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Configuracao
     */
    select?: ConfiguracaoSelect<ExtArgs> | null
    /**
     * The filter to search for the Configuracao to update in case it exists.
     */
    where: ConfiguracaoWhereUniqueInput
    /**
     * In case the Configuracao found by the `where` argument doesn't exist, create a new Configuracao with this data.
     */
    create: XOR<ConfiguracaoCreateInput, ConfiguracaoUncheckedCreateInput>
    /**
     * In case the Configuracao was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConfiguracaoUpdateInput, ConfiguracaoUncheckedUpdateInput>
  }

  /**
   * Configuracao delete
   */
  export type ConfiguracaoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Configuracao
     */
    select?: ConfiguracaoSelect<ExtArgs> | null
    /**
     * Filter which Configuracao to delete.
     */
    where: ConfiguracaoWhereUniqueInput
  }

  /**
   * Configuracao deleteMany
   */
  export type ConfiguracaoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Configuracaos to delete
     */
    where?: ConfiguracaoWhereInput
  }

  /**
   * Configuracao without action
   */
  export type ConfiguracaoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Configuracao
     */
    select?: ConfiguracaoSelect<ExtArgs> | null
  }


  /**
   * Model Agendamento
   */

  export type AggregateAgendamento = {
    _count: AgendamentoCountAggregateOutputType | null
    _avg: AgendamentoAvgAggregateOutputType | null
    _sum: AgendamentoSumAggregateOutputType | null
    _min: AgendamentoMinAggregateOutputType | null
    _max: AgendamentoMaxAggregateOutputType | null
  }

  export type AgendamentoAvgAggregateOutputType = {
    duracaoMinutos: number | null
  }

  export type AgendamentoSumAggregateOutputType = {
    duracaoMinutos: number | null
  }

  export type AgendamentoMinAggregateOutputType = {
    id: string | null
    nome: string | null
    email: string | null
    telefone: string | null
    dataHora: Date | null
    produtoId: string | null
    duracaoMinutos: number | null
    status: string | null
    usuarioId: string | null
    clienteId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AgendamentoMaxAggregateOutputType = {
    id: string | null
    nome: string | null
    email: string | null
    telefone: string | null
    dataHora: Date | null
    produtoId: string | null
    duracaoMinutos: number | null
    status: string | null
    usuarioId: string | null
    clienteId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AgendamentoCountAggregateOutputType = {
    id: number
    nome: number
    email: number
    telefone: number
    dataHora: number
    produtoId: number
    duracaoMinutos: number
    status: number
    usuarioId: number
    clienteId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AgendamentoAvgAggregateInputType = {
    duracaoMinutos?: true
  }

  export type AgendamentoSumAggregateInputType = {
    duracaoMinutos?: true
  }

  export type AgendamentoMinAggregateInputType = {
    id?: true
    nome?: true
    email?: true
    telefone?: true
    dataHora?: true
    produtoId?: true
    duracaoMinutos?: true
    status?: true
    usuarioId?: true
    clienteId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AgendamentoMaxAggregateInputType = {
    id?: true
    nome?: true
    email?: true
    telefone?: true
    dataHora?: true
    produtoId?: true
    duracaoMinutos?: true
    status?: true
    usuarioId?: true
    clienteId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AgendamentoCountAggregateInputType = {
    id?: true
    nome?: true
    email?: true
    telefone?: true
    dataHora?: true
    produtoId?: true
    duracaoMinutos?: true
    status?: true
    usuarioId?: true
    clienteId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AgendamentoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Agendamento to aggregate.
     */
    where?: AgendamentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agendamentos to fetch.
     */
    orderBy?: AgendamentoOrderByWithRelationInput | AgendamentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AgendamentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agendamentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agendamentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Agendamentos
    **/
    _count?: true | AgendamentoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AgendamentoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AgendamentoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AgendamentoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AgendamentoMaxAggregateInputType
  }

  export type GetAgendamentoAggregateType<T extends AgendamentoAggregateArgs> = {
        [P in keyof T & keyof AggregateAgendamento]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAgendamento[P]>
      : GetScalarType<T[P], AggregateAgendamento[P]>
  }




  export type AgendamentoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AgendamentoWhereInput
    orderBy?: AgendamentoOrderByWithAggregationInput | AgendamentoOrderByWithAggregationInput[]
    by: AgendamentoScalarFieldEnum[] | AgendamentoScalarFieldEnum
    having?: AgendamentoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AgendamentoCountAggregateInputType | true
    _avg?: AgendamentoAvgAggregateInputType
    _sum?: AgendamentoSumAggregateInputType
    _min?: AgendamentoMinAggregateInputType
    _max?: AgendamentoMaxAggregateInputType
  }

  export type AgendamentoGroupByOutputType = {
    id: string
    nome: string
    email: string
    telefone: string
    dataHora: Date
    produtoId: string
    duracaoMinutos: number
    status: string
    usuarioId: string | null
    clienteId: string | null
    createdAt: Date
    updatedAt: Date
    _count: AgendamentoCountAggregateOutputType | null
    _avg: AgendamentoAvgAggregateOutputType | null
    _sum: AgendamentoSumAggregateOutputType | null
    _min: AgendamentoMinAggregateOutputType | null
    _max: AgendamentoMaxAggregateOutputType | null
  }

  type GetAgendamentoGroupByPayload<T extends AgendamentoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AgendamentoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AgendamentoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AgendamentoGroupByOutputType[P]>
            : GetScalarType<T[P], AgendamentoGroupByOutputType[P]>
        }
      >
    >


  export type AgendamentoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nome?: boolean
    email?: boolean
    telefone?: boolean
    dataHora?: boolean
    produtoId?: boolean
    duracaoMinutos?: boolean
    status?: boolean
    usuarioId?: boolean
    clienteId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    usuario?: boolean | Agendamento$usuarioArgs<ExtArgs>
  }, ExtArgs["result"]["agendamento"]>

  export type AgendamentoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nome?: boolean
    email?: boolean
    telefone?: boolean
    dataHora?: boolean
    produtoId?: boolean
    duracaoMinutos?: boolean
    status?: boolean
    usuarioId?: boolean
    clienteId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    usuario?: boolean | Agendamento$usuarioArgs<ExtArgs>
  }, ExtArgs["result"]["agendamento"]>

  export type AgendamentoSelectScalar = {
    id?: boolean
    nome?: boolean
    email?: boolean
    telefone?: boolean
    dataHora?: boolean
    produtoId?: boolean
    duracaoMinutos?: boolean
    status?: boolean
    usuarioId?: boolean
    clienteId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type AgendamentoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | Agendamento$usuarioArgs<ExtArgs>
  }
  export type AgendamentoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    usuario?: boolean | Agendamento$usuarioArgs<ExtArgs>
  }

  export type $AgendamentoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Agendamento"
    objects: {
      usuario: Prisma.$UsuarioPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      nome: string
      email: string
      telefone: string
      dataHora: Date
      produtoId: string
      duracaoMinutos: number
      status: string
      usuarioId: string | null
      clienteId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["agendamento"]>
    composites: {}
  }

  type AgendamentoGetPayload<S extends boolean | null | undefined | AgendamentoDefaultArgs> = $Result.GetResult<Prisma.$AgendamentoPayload, S>

  type AgendamentoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AgendamentoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AgendamentoCountAggregateInputType | true
    }

  export interface AgendamentoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Agendamento'], meta: { name: 'Agendamento' } }
    /**
     * Find zero or one Agendamento that matches the filter.
     * @param {AgendamentoFindUniqueArgs} args - Arguments to find a Agendamento
     * @example
     * // Get one Agendamento
     * const agendamento = await prisma.agendamento.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AgendamentoFindUniqueArgs>(args: SelectSubset<T, AgendamentoFindUniqueArgs<ExtArgs>>): Prisma__AgendamentoClient<$Result.GetResult<Prisma.$AgendamentoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Agendamento that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AgendamentoFindUniqueOrThrowArgs} args - Arguments to find a Agendamento
     * @example
     * // Get one Agendamento
     * const agendamento = await prisma.agendamento.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AgendamentoFindUniqueOrThrowArgs>(args: SelectSubset<T, AgendamentoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AgendamentoClient<$Result.GetResult<Prisma.$AgendamentoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Agendamento that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgendamentoFindFirstArgs} args - Arguments to find a Agendamento
     * @example
     * // Get one Agendamento
     * const agendamento = await prisma.agendamento.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AgendamentoFindFirstArgs>(args?: SelectSubset<T, AgendamentoFindFirstArgs<ExtArgs>>): Prisma__AgendamentoClient<$Result.GetResult<Prisma.$AgendamentoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Agendamento that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgendamentoFindFirstOrThrowArgs} args - Arguments to find a Agendamento
     * @example
     * // Get one Agendamento
     * const agendamento = await prisma.agendamento.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AgendamentoFindFirstOrThrowArgs>(args?: SelectSubset<T, AgendamentoFindFirstOrThrowArgs<ExtArgs>>): Prisma__AgendamentoClient<$Result.GetResult<Prisma.$AgendamentoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Agendamentos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgendamentoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Agendamentos
     * const agendamentos = await prisma.agendamento.findMany()
     * 
     * // Get first 10 Agendamentos
     * const agendamentos = await prisma.agendamento.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const agendamentoWithIdOnly = await prisma.agendamento.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AgendamentoFindManyArgs>(args?: SelectSubset<T, AgendamentoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgendamentoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Agendamento.
     * @param {AgendamentoCreateArgs} args - Arguments to create a Agendamento.
     * @example
     * // Create one Agendamento
     * const Agendamento = await prisma.agendamento.create({
     *   data: {
     *     // ... data to create a Agendamento
     *   }
     * })
     * 
     */
    create<T extends AgendamentoCreateArgs>(args: SelectSubset<T, AgendamentoCreateArgs<ExtArgs>>): Prisma__AgendamentoClient<$Result.GetResult<Prisma.$AgendamentoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Agendamentos.
     * @param {AgendamentoCreateManyArgs} args - Arguments to create many Agendamentos.
     * @example
     * // Create many Agendamentos
     * const agendamento = await prisma.agendamento.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AgendamentoCreateManyArgs>(args?: SelectSubset<T, AgendamentoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Agendamentos and returns the data saved in the database.
     * @param {AgendamentoCreateManyAndReturnArgs} args - Arguments to create many Agendamentos.
     * @example
     * // Create many Agendamentos
     * const agendamento = await prisma.agendamento.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Agendamentos and only return the `id`
     * const agendamentoWithIdOnly = await prisma.agendamento.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AgendamentoCreateManyAndReturnArgs>(args?: SelectSubset<T, AgendamentoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AgendamentoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Agendamento.
     * @param {AgendamentoDeleteArgs} args - Arguments to delete one Agendamento.
     * @example
     * // Delete one Agendamento
     * const Agendamento = await prisma.agendamento.delete({
     *   where: {
     *     // ... filter to delete one Agendamento
     *   }
     * })
     * 
     */
    delete<T extends AgendamentoDeleteArgs>(args: SelectSubset<T, AgendamentoDeleteArgs<ExtArgs>>): Prisma__AgendamentoClient<$Result.GetResult<Prisma.$AgendamentoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Agendamento.
     * @param {AgendamentoUpdateArgs} args - Arguments to update one Agendamento.
     * @example
     * // Update one Agendamento
     * const agendamento = await prisma.agendamento.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AgendamentoUpdateArgs>(args: SelectSubset<T, AgendamentoUpdateArgs<ExtArgs>>): Prisma__AgendamentoClient<$Result.GetResult<Prisma.$AgendamentoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Agendamentos.
     * @param {AgendamentoDeleteManyArgs} args - Arguments to filter Agendamentos to delete.
     * @example
     * // Delete a few Agendamentos
     * const { count } = await prisma.agendamento.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AgendamentoDeleteManyArgs>(args?: SelectSubset<T, AgendamentoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Agendamentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgendamentoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Agendamentos
     * const agendamento = await prisma.agendamento.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AgendamentoUpdateManyArgs>(args: SelectSubset<T, AgendamentoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Agendamento.
     * @param {AgendamentoUpsertArgs} args - Arguments to update or create a Agendamento.
     * @example
     * // Update or create a Agendamento
     * const agendamento = await prisma.agendamento.upsert({
     *   create: {
     *     // ... data to create a Agendamento
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Agendamento we want to update
     *   }
     * })
     */
    upsert<T extends AgendamentoUpsertArgs>(args: SelectSubset<T, AgendamentoUpsertArgs<ExtArgs>>): Prisma__AgendamentoClient<$Result.GetResult<Prisma.$AgendamentoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Agendamentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgendamentoCountArgs} args - Arguments to filter Agendamentos to count.
     * @example
     * // Count the number of Agendamentos
     * const count = await prisma.agendamento.count({
     *   where: {
     *     // ... the filter for the Agendamentos we want to count
     *   }
     * })
    **/
    count<T extends AgendamentoCountArgs>(
      args?: Subset<T, AgendamentoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AgendamentoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Agendamento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgendamentoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AgendamentoAggregateArgs>(args: Subset<T, AgendamentoAggregateArgs>): Prisma.PrismaPromise<GetAgendamentoAggregateType<T>>

    /**
     * Group by Agendamento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AgendamentoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AgendamentoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AgendamentoGroupByArgs['orderBy'] }
        : { orderBy?: AgendamentoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AgendamentoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAgendamentoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Agendamento model
   */
  readonly fields: AgendamentoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Agendamento.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AgendamentoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    usuario<T extends Agendamento$usuarioArgs<ExtArgs> = {}>(args?: Subset<T, Agendamento$usuarioArgs<ExtArgs>>): Prisma__UsuarioClient<$Result.GetResult<Prisma.$UsuarioPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Agendamento model
   */ 
  interface AgendamentoFieldRefs {
    readonly id: FieldRef<"Agendamento", 'String'>
    readonly nome: FieldRef<"Agendamento", 'String'>
    readonly email: FieldRef<"Agendamento", 'String'>
    readonly telefone: FieldRef<"Agendamento", 'String'>
    readonly dataHora: FieldRef<"Agendamento", 'DateTime'>
    readonly produtoId: FieldRef<"Agendamento", 'String'>
    readonly duracaoMinutos: FieldRef<"Agendamento", 'Int'>
    readonly status: FieldRef<"Agendamento", 'String'>
    readonly usuarioId: FieldRef<"Agendamento", 'String'>
    readonly clienteId: FieldRef<"Agendamento", 'String'>
    readonly createdAt: FieldRef<"Agendamento", 'DateTime'>
    readonly updatedAt: FieldRef<"Agendamento", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Agendamento findUnique
   */
  export type AgendamentoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agendamento
     */
    select?: AgendamentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgendamentoInclude<ExtArgs> | null
    /**
     * Filter, which Agendamento to fetch.
     */
    where: AgendamentoWhereUniqueInput
  }

  /**
   * Agendamento findUniqueOrThrow
   */
  export type AgendamentoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agendamento
     */
    select?: AgendamentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgendamentoInclude<ExtArgs> | null
    /**
     * Filter, which Agendamento to fetch.
     */
    where: AgendamentoWhereUniqueInput
  }

  /**
   * Agendamento findFirst
   */
  export type AgendamentoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agendamento
     */
    select?: AgendamentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgendamentoInclude<ExtArgs> | null
    /**
     * Filter, which Agendamento to fetch.
     */
    where?: AgendamentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agendamentos to fetch.
     */
    orderBy?: AgendamentoOrderByWithRelationInput | AgendamentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Agendamentos.
     */
    cursor?: AgendamentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agendamentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agendamentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Agendamentos.
     */
    distinct?: AgendamentoScalarFieldEnum | AgendamentoScalarFieldEnum[]
  }

  /**
   * Agendamento findFirstOrThrow
   */
  export type AgendamentoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agendamento
     */
    select?: AgendamentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgendamentoInclude<ExtArgs> | null
    /**
     * Filter, which Agendamento to fetch.
     */
    where?: AgendamentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agendamentos to fetch.
     */
    orderBy?: AgendamentoOrderByWithRelationInput | AgendamentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Agendamentos.
     */
    cursor?: AgendamentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agendamentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agendamentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Agendamentos.
     */
    distinct?: AgendamentoScalarFieldEnum | AgendamentoScalarFieldEnum[]
  }

  /**
   * Agendamento findMany
   */
  export type AgendamentoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agendamento
     */
    select?: AgendamentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgendamentoInclude<ExtArgs> | null
    /**
     * Filter, which Agendamentos to fetch.
     */
    where?: AgendamentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Agendamentos to fetch.
     */
    orderBy?: AgendamentoOrderByWithRelationInput | AgendamentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Agendamentos.
     */
    cursor?: AgendamentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Agendamentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Agendamentos.
     */
    skip?: number
    distinct?: AgendamentoScalarFieldEnum | AgendamentoScalarFieldEnum[]
  }

  /**
   * Agendamento create
   */
  export type AgendamentoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agendamento
     */
    select?: AgendamentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgendamentoInclude<ExtArgs> | null
    /**
     * The data needed to create a Agendamento.
     */
    data: XOR<AgendamentoCreateInput, AgendamentoUncheckedCreateInput>
  }

  /**
   * Agendamento createMany
   */
  export type AgendamentoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Agendamentos.
     */
    data: AgendamentoCreateManyInput | AgendamentoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Agendamento createManyAndReturn
   */
  export type AgendamentoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agendamento
     */
    select?: AgendamentoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Agendamentos.
     */
    data: AgendamentoCreateManyInput | AgendamentoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgendamentoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Agendamento update
   */
  export type AgendamentoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agendamento
     */
    select?: AgendamentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgendamentoInclude<ExtArgs> | null
    /**
     * The data needed to update a Agendamento.
     */
    data: XOR<AgendamentoUpdateInput, AgendamentoUncheckedUpdateInput>
    /**
     * Choose, which Agendamento to update.
     */
    where: AgendamentoWhereUniqueInput
  }

  /**
   * Agendamento updateMany
   */
  export type AgendamentoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Agendamentos.
     */
    data: XOR<AgendamentoUpdateManyMutationInput, AgendamentoUncheckedUpdateManyInput>
    /**
     * Filter which Agendamentos to update
     */
    where?: AgendamentoWhereInput
  }

  /**
   * Agendamento upsert
   */
  export type AgendamentoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agendamento
     */
    select?: AgendamentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgendamentoInclude<ExtArgs> | null
    /**
     * The filter to search for the Agendamento to update in case it exists.
     */
    where: AgendamentoWhereUniqueInput
    /**
     * In case the Agendamento found by the `where` argument doesn't exist, create a new Agendamento with this data.
     */
    create: XOR<AgendamentoCreateInput, AgendamentoUncheckedCreateInput>
    /**
     * In case the Agendamento was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AgendamentoUpdateInput, AgendamentoUncheckedUpdateInput>
  }

  /**
   * Agendamento delete
   */
  export type AgendamentoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agendamento
     */
    select?: AgendamentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgendamentoInclude<ExtArgs> | null
    /**
     * Filter which Agendamento to delete.
     */
    where: AgendamentoWhereUniqueInput
  }

  /**
   * Agendamento deleteMany
   */
  export type AgendamentoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Agendamentos to delete
     */
    where?: AgendamentoWhereInput
  }

  /**
   * Agendamento.usuario
   */
  export type Agendamento$usuarioArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Usuario
     */
    select?: UsuarioSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UsuarioInclude<ExtArgs> | null
    where?: UsuarioWhereInput
  }

  /**
   * Agendamento without action
   */
  export type AgendamentoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Agendamento
     */
    select?: AgendamentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AgendamentoInclude<ExtArgs> | null
  }


  /**
   * Model CatalogoServico
   */

  export type AggregateCatalogoServico = {
    _count: CatalogoServicoCountAggregateOutputType | null
    _avg: CatalogoServicoAvgAggregateOutputType | null
    _sum: CatalogoServicoSumAggregateOutputType | null
    _min: CatalogoServicoMinAggregateOutputType | null
    _max: CatalogoServicoMaxAggregateOutputType | null
  }

  export type CatalogoServicoAvgAggregateOutputType = {
    valor: Decimal | null
  }

  export type CatalogoServicoSumAggregateOutputType = {
    valor: Decimal | null
  }

  export type CatalogoServicoMinAggregateOutputType = {
    id: string | null
    nome: string | null
    valor: Decimal | null
    duracao: string | null
    exibirComercial: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CatalogoServicoMaxAggregateOutputType = {
    id: string | null
    nome: string | null
    valor: Decimal | null
    duracao: string | null
    exibirComercial: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CatalogoServicoCountAggregateOutputType = {
    id: number
    nome: number
    valor: number
    duracao: number
    exibirComercial: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CatalogoServicoAvgAggregateInputType = {
    valor?: true
  }

  export type CatalogoServicoSumAggregateInputType = {
    valor?: true
  }

  export type CatalogoServicoMinAggregateInputType = {
    id?: true
    nome?: true
    valor?: true
    duracao?: true
    exibirComercial?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CatalogoServicoMaxAggregateInputType = {
    id?: true
    nome?: true
    valor?: true
    duracao?: true
    exibirComercial?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CatalogoServicoCountAggregateInputType = {
    id?: true
    nome?: true
    valor?: true
    duracao?: true
    exibirComercial?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CatalogoServicoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CatalogoServico to aggregate.
     */
    where?: CatalogoServicoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CatalogoServicos to fetch.
     */
    orderBy?: CatalogoServicoOrderByWithRelationInput | CatalogoServicoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: CatalogoServicoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CatalogoServicos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CatalogoServicos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned CatalogoServicos
    **/
    _count?: true | CatalogoServicoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: CatalogoServicoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: CatalogoServicoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CatalogoServicoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CatalogoServicoMaxAggregateInputType
  }

  export type GetCatalogoServicoAggregateType<T extends CatalogoServicoAggregateArgs> = {
        [P in keyof T & keyof AggregateCatalogoServico]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCatalogoServico[P]>
      : GetScalarType<T[P], AggregateCatalogoServico[P]>
  }




  export type CatalogoServicoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: CatalogoServicoWhereInput
    orderBy?: CatalogoServicoOrderByWithAggregationInput | CatalogoServicoOrderByWithAggregationInput[]
    by: CatalogoServicoScalarFieldEnum[] | CatalogoServicoScalarFieldEnum
    having?: CatalogoServicoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CatalogoServicoCountAggregateInputType | true
    _avg?: CatalogoServicoAvgAggregateInputType
    _sum?: CatalogoServicoSumAggregateInputType
    _min?: CatalogoServicoMinAggregateInputType
    _max?: CatalogoServicoMaxAggregateInputType
  }

  export type CatalogoServicoGroupByOutputType = {
    id: string
    nome: string
    valor: Decimal
    duracao: string | null
    exibirComercial: boolean
    createdAt: Date
    updatedAt: Date
    _count: CatalogoServicoCountAggregateOutputType | null
    _avg: CatalogoServicoAvgAggregateOutputType | null
    _sum: CatalogoServicoSumAggregateOutputType | null
    _min: CatalogoServicoMinAggregateOutputType | null
    _max: CatalogoServicoMaxAggregateOutputType | null
  }

  type GetCatalogoServicoGroupByPayload<T extends CatalogoServicoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CatalogoServicoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CatalogoServicoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CatalogoServicoGroupByOutputType[P]>
            : GetScalarType<T[P], CatalogoServicoGroupByOutputType[P]>
        }
      >
    >


  export type CatalogoServicoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nome?: boolean
    valor?: boolean
    duracao?: boolean
    exibirComercial?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    requisitos?: boolean | CatalogoServico$requisitosArgs<ExtArgs>
    _count?: boolean | CatalogoServicoCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["catalogoServico"]>

  export type CatalogoServicoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nome?: boolean
    valor?: boolean
    duracao?: boolean
    exibirComercial?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["catalogoServico"]>

  export type CatalogoServicoSelectScalar = {
    id?: boolean
    nome?: boolean
    valor?: boolean
    duracao?: boolean
    exibirComercial?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type CatalogoServicoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    requisitos?: boolean | CatalogoServico$requisitosArgs<ExtArgs>
    _count?: boolean | CatalogoServicoCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type CatalogoServicoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $CatalogoServicoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "CatalogoServico"
    objects: {
      requisitos: Prisma.$ServicoRequisitoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      nome: string
      valor: Prisma.Decimal
      duracao: string | null
      exibirComercial: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["catalogoServico"]>
    composites: {}
  }

  type CatalogoServicoGetPayload<S extends boolean | null | undefined | CatalogoServicoDefaultArgs> = $Result.GetResult<Prisma.$CatalogoServicoPayload, S>

  type CatalogoServicoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<CatalogoServicoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: CatalogoServicoCountAggregateInputType | true
    }

  export interface CatalogoServicoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['CatalogoServico'], meta: { name: 'CatalogoServico' } }
    /**
     * Find zero or one CatalogoServico that matches the filter.
     * @param {CatalogoServicoFindUniqueArgs} args - Arguments to find a CatalogoServico
     * @example
     * // Get one CatalogoServico
     * const catalogoServico = await prisma.catalogoServico.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CatalogoServicoFindUniqueArgs>(args: SelectSubset<T, CatalogoServicoFindUniqueArgs<ExtArgs>>): Prisma__CatalogoServicoClient<$Result.GetResult<Prisma.$CatalogoServicoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one CatalogoServico that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {CatalogoServicoFindUniqueOrThrowArgs} args - Arguments to find a CatalogoServico
     * @example
     * // Get one CatalogoServico
     * const catalogoServico = await prisma.catalogoServico.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CatalogoServicoFindUniqueOrThrowArgs>(args: SelectSubset<T, CatalogoServicoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__CatalogoServicoClient<$Result.GetResult<Prisma.$CatalogoServicoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first CatalogoServico that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CatalogoServicoFindFirstArgs} args - Arguments to find a CatalogoServico
     * @example
     * // Get one CatalogoServico
     * const catalogoServico = await prisma.catalogoServico.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CatalogoServicoFindFirstArgs>(args?: SelectSubset<T, CatalogoServicoFindFirstArgs<ExtArgs>>): Prisma__CatalogoServicoClient<$Result.GetResult<Prisma.$CatalogoServicoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first CatalogoServico that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CatalogoServicoFindFirstOrThrowArgs} args - Arguments to find a CatalogoServico
     * @example
     * // Get one CatalogoServico
     * const catalogoServico = await prisma.catalogoServico.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CatalogoServicoFindFirstOrThrowArgs>(args?: SelectSubset<T, CatalogoServicoFindFirstOrThrowArgs<ExtArgs>>): Prisma__CatalogoServicoClient<$Result.GetResult<Prisma.$CatalogoServicoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more CatalogoServicos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CatalogoServicoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all CatalogoServicos
     * const catalogoServicos = await prisma.catalogoServico.findMany()
     * 
     * // Get first 10 CatalogoServicos
     * const catalogoServicos = await prisma.catalogoServico.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const catalogoServicoWithIdOnly = await prisma.catalogoServico.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends CatalogoServicoFindManyArgs>(args?: SelectSubset<T, CatalogoServicoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CatalogoServicoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a CatalogoServico.
     * @param {CatalogoServicoCreateArgs} args - Arguments to create a CatalogoServico.
     * @example
     * // Create one CatalogoServico
     * const CatalogoServico = await prisma.catalogoServico.create({
     *   data: {
     *     // ... data to create a CatalogoServico
     *   }
     * })
     * 
     */
    create<T extends CatalogoServicoCreateArgs>(args: SelectSubset<T, CatalogoServicoCreateArgs<ExtArgs>>): Prisma__CatalogoServicoClient<$Result.GetResult<Prisma.$CatalogoServicoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many CatalogoServicos.
     * @param {CatalogoServicoCreateManyArgs} args - Arguments to create many CatalogoServicos.
     * @example
     * // Create many CatalogoServicos
     * const catalogoServico = await prisma.catalogoServico.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends CatalogoServicoCreateManyArgs>(args?: SelectSubset<T, CatalogoServicoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many CatalogoServicos and returns the data saved in the database.
     * @param {CatalogoServicoCreateManyAndReturnArgs} args - Arguments to create many CatalogoServicos.
     * @example
     * // Create many CatalogoServicos
     * const catalogoServico = await prisma.catalogoServico.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many CatalogoServicos and only return the `id`
     * const catalogoServicoWithIdOnly = await prisma.catalogoServico.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends CatalogoServicoCreateManyAndReturnArgs>(args?: SelectSubset<T, CatalogoServicoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$CatalogoServicoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a CatalogoServico.
     * @param {CatalogoServicoDeleteArgs} args - Arguments to delete one CatalogoServico.
     * @example
     * // Delete one CatalogoServico
     * const CatalogoServico = await prisma.catalogoServico.delete({
     *   where: {
     *     // ... filter to delete one CatalogoServico
     *   }
     * })
     * 
     */
    delete<T extends CatalogoServicoDeleteArgs>(args: SelectSubset<T, CatalogoServicoDeleteArgs<ExtArgs>>): Prisma__CatalogoServicoClient<$Result.GetResult<Prisma.$CatalogoServicoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one CatalogoServico.
     * @param {CatalogoServicoUpdateArgs} args - Arguments to update one CatalogoServico.
     * @example
     * // Update one CatalogoServico
     * const catalogoServico = await prisma.catalogoServico.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends CatalogoServicoUpdateArgs>(args: SelectSubset<T, CatalogoServicoUpdateArgs<ExtArgs>>): Prisma__CatalogoServicoClient<$Result.GetResult<Prisma.$CatalogoServicoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more CatalogoServicos.
     * @param {CatalogoServicoDeleteManyArgs} args - Arguments to filter CatalogoServicos to delete.
     * @example
     * // Delete a few CatalogoServicos
     * const { count } = await prisma.catalogoServico.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends CatalogoServicoDeleteManyArgs>(args?: SelectSubset<T, CatalogoServicoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more CatalogoServicos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CatalogoServicoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many CatalogoServicos
     * const catalogoServico = await prisma.catalogoServico.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends CatalogoServicoUpdateManyArgs>(args: SelectSubset<T, CatalogoServicoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one CatalogoServico.
     * @param {CatalogoServicoUpsertArgs} args - Arguments to update or create a CatalogoServico.
     * @example
     * // Update or create a CatalogoServico
     * const catalogoServico = await prisma.catalogoServico.upsert({
     *   create: {
     *     // ... data to create a CatalogoServico
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the CatalogoServico we want to update
     *   }
     * })
     */
    upsert<T extends CatalogoServicoUpsertArgs>(args: SelectSubset<T, CatalogoServicoUpsertArgs<ExtArgs>>): Prisma__CatalogoServicoClient<$Result.GetResult<Prisma.$CatalogoServicoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of CatalogoServicos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CatalogoServicoCountArgs} args - Arguments to filter CatalogoServicos to count.
     * @example
     * // Count the number of CatalogoServicos
     * const count = await prisma.catalogoServico.count({
     *   where: {
     *     // ... the filter for the CatalogoServicos we want to count
     *   }
     * })
    **/
    count<T extends CatalogoServicoCountArgs>(
      args?: Subset<T, CatalogoServicoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CatalogoServicoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a CatalogoServico.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CatalogoServicoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CatalogoServicoAggregateArgs>(args: Subset<T, CatalogoServicoAggregateArgs>): Prisma.PrismaPromise<GetCatalogoServicoAggregateType<T>>

    /**
     * Group by CatalogoServico.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CatalogoServicoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends CatalogoServicoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CatalogoServicoGroupByArgs['orderBy'] }
        : { orderBy?: CatalogoServicoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, CatalogoServicoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCatalogoServicoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the CatalogoServico model
   */
  readonly fields: CatalogoServicoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for CatalogoServico.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CatalogoServicoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    requisitos<T extends CatalogoServico$requisitosArgs<ExtArgs> = {}>(args?: Subset<T, CatalogoServico$requisitosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServicoRequisitoPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the CatalogoServico model
   */ 
  interface CatalogoServicoFieldRefs {
    readonly id: FieldRef<"CatalogoServico", 'String'>
    readonly nome: FieldRef<"CatalogoServico", 'String'>
    readonly valor: FieldRef<"CatalogoServico", 'Decimal'>
    readonly duracao: FieldRef<"CatalogoServico", 'String'>
    readonly exibirComercial: FieldRef<"CatalogoServico", 'Boolean'>
    readonly createdAt: FieldRef<"CatalogoServico", 'DateTime'>
    readonly updatedAt: FieldRef<"CatalogoServico", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * CatalogoServico findUnique
   */
  export type CatalogoServicoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CatalogoServico
     */
    select?: CatalogoServicoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CatalogoServicoInclude<ExtArgs> | null
    /**
     * Filter, which CatalogoServico to fetch.
     */
    where: CatalogoServicoWhereUniqueInput
  }

  /**
   * CatalogoServico findUniqueOrThrow
   */
  export type CatalogoServicoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CatalogoServico
     */
    select?: CatalogoServicoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CatalogoServicoInclude<ExtArgs> | null
    /**
     * Filter, which CatalogoServico to fetch.
     */
    where: CatalogoServicoWhereUniqueInput
  }

  /**
   * CatalogoServico findFirst
   */
  export type CatalogoServicoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CatalogoServico
     */
    select?: CatalogoServicoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CatalogoServicoInclude<ExtArgs> | null
    /**
     * Filter, which CatalogoServico to fetch.
     */
    where?: CatalogoServicoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CatalogoServicos to fetch.
     */
    orderBy?: CatalogoServicoOrderByWithRelationInput | CatalogoServicoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CatalogoServicos.
     */
    cursor?: CatalogoServicoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CatalogoServicos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CatalogoServicos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CatalogoServicos.
     */
    distinct?: CatalogoServicoScalarFieldEnum | CatalogoServicoScalarFieldEnum[]
  }

  /**
   * CatalogoServico findFirstOrThrow
   */
  export type CatalogoServicoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CatalogoServico
     */
    select?: CatalogoServicoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CatalogoServicoInclude<ExtArgs> | null
    /**
     * Filter, which CatalogoServico to fetch.
     */
    where?: CatalogoServicoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CatalogoServicos to fetch.
     */
    orderBy?: CatalogoServicoOrderByWithRelationInput | CatalogoServicoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for CatalogoServicos.
     */
    cursor?: CatalogoServicoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CatalogoServicos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CatalogoServicos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of CatalogoServicos.
     */
    distinct?: CatalogoServicoScalarFieldEnum | CatalogoServicoScalarFieldEnum[]
  }

  /**
   * CatalogoServico findMany
   */
  export type CatalogoServicoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CatalogoServico
     */
    select?: CatalogoServicoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CatalogoServicoInclude<ExtArgs> | null
    /**
     * Filter, which CatalogoServicos to fetch.
     */
    where?: CatalogoServicoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of CatalogoServicos to fetch.
     */
    orderBy?: CatalogoServicoOrderByWithRelationInput | CatalogoServicoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing CatalogoServicos.
     */
    cursor?: CatalogoServicoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` CatalogoServicos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` CatalogoServicos.
     */
    skip?: number
    distinct?: CatalogoServicoScalarFieldEnum | CatalogoServicoScalarFieldEnum[]
  }

  /**
   * CatalogoServico create
   */
  export type CatalogoServicoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CatalogoServico
     */
    select?: CatalogoServicoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CatalogoServicoInclude<ExtArgs> | null
    /**
     * The data needed to create a CatalogoServico.
     */
    data: XOR<CatalogoServicoCreateInput, CatalogoServicoUncheckedCreateInput>
  }

  /**
   * CatalogoServico createMany
   */
  export type CatalogoServicoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many CatalogoServicos.
     */
    data: CatalogoServicoCreateManyInput | CatalogoServicoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CatalogoServico createManyAndReturn
   */
  export type CatalogoServicoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CatalogoServico
     */
    select?: CatalogoServicoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many CatalogoServicos.
     */
    data: CatalogoServicoCreateManyInput | CatalogoServicoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * CatalogoServico update
   */
  export type CatalogoServicoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CatalogoServico
     */
    select?: CatalogoServicoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CatalogoServicoInclude<ExtArgs> | null
    /**
     * The data needed to update a CatalogoServico.
     */
    data: XOR<CatalogoServicoUpdateInput, CatalogoServicoUncheckedUpdateInput>
    /**
     * Choose, which CatalogoServico to update.
     */
    where: CatalogoServicoWhereUniqueInput
  }

  /**
   * CatalogoServico updateMany
   */
  export type CatalogoServicoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update CatalogoServicos.
     */
    data: XOR<CatalogoServicoUpdateManyMutationInput, CatalogoServicoUncheckedUpdateManyInput>
    /**
     * Filter which CatalogoServicos to update
     */
    where?: CatalogoServicoWhereInput
  }

  /**
   * CatalogoServico upsert
   */
  export type CatalogoServicoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CatalogoServico
     */
    select?: CatalogoServicoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CatalogoServicoInclude<ExtArgs> | null
    /**
     * The filter to search for the CatalogoServico to update in case it exists.
     */
    where: CatalogoServicoWhereUniqueInput
    /**
     * In case the CatalogoServico found by the `where` argument doesn't exist, create a new CatalogoServico with this data.
     */
    create: XOR<CatalogoServicoCreateInput, CatalogoServicoUncheckedCreateInput>
    /**
     * In case the CatalogoServico was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CatalogoServicoUpdateInput, CatalogoServicoUncheckedUpdateInput>
  }

  /**
   * CatalogoServico delete
   */
  export type CatalogoServicoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CatalogoServico
     */
    select?: CatalogoServicoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CatalogoServicoInclude<ExtArgs> | null
    /**
     * Filter which CatalogoServico to delete.
     */
    where: CatalogoServicoWhereUniqueInput
  }

  /**
   * CatalogoServico deleteMany
   */
  export type CatalogoServicoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which CatalogoServicos to delete
     */
    where?: CatalogoServicoWhereInput
  }

  /**
   * CatalogoServico.requisitos
   */
  export type CatalogoServico$requisitosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServicoRequisito
     */
    select?: ServicoRequisitoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServicoRequisitoInclude<ExtArgs> | null
    where?: ServicoRequisitoWhereInput
    orderBy?: ServicoRequisitoOrderByWithRelationInput | ServicoRequisitoOrderByWithRelationInput[]
    cursor?: ServicoRequisitoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ServicoRequisitoScalarFieldEnum | ServicoRequisitoScalarFieldEnum[]
  }

  /**
   * CatalogoServico without action
   */
  export type CatalogoServicoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the CatalogoServico
     */
    select?: CatalogoServicoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CatalogoServicoInclude<ExtArgs> | null
  }


  /**
   * Model ServicoRequisito
   */

  export type AggregateServicoRequisito = {
    _count: ServicoRequisitoCountAggregateOutputType | null
    _min: ServicoRequisitoMinAggregateOutputType | null
    _max: ServicoRequisitoMaxAggregateOutputType | null
  }

  export type ServicoRequisitoMinAggregateOutputType = {
    id: string | null
    servicoId: string | null
    nome: string | null
    etapa: string | null
    obrigatorio: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ServicoRequisitoMaxAggregateOutputType = {
    id: string | null
    servicoId: string | null
    nome: string | null
    etapa: string | null
    obrigatorio: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ServicoRequisitoCountAggregateOutputType = {
    id: number
    servicoId: number
    nome: number
    etapa: number
    obrigatorio: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ServicoRequisitoMinAggregateInputType = {
    id?: true
    servicoId?: true
    nome?: true
    etapa?: true
    obrigatorio?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ServicoRequisitoMaxAggregateInputType = {
    id?: true
    servicoId?: true
    nome?: true
    etapa?: true
    obrigatorio?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ServicoRequisitoCountAggregateInputType = {
    id?: true
    servicoId?: true
    nome?: true
    etapa?: true
    obrigatorio?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ServicoRequisitoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ServicoRequisito to aggregate.
     */
    where?: ServicoRequisitoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ServicoRequisitos to fetch.
     */
    orderBy?: ServicoRequisitoOrderByWithRelationInput | ServicoRequisitoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ServicoRequisitoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ServicoRequisitos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ServicoRequisitos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ServicoRequisitos
    **/
    _count?: true | ServicoRequisitoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ServicoRequisitoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ServicoRequisitoMaxAggregateInputType
  }

  export type GetServicoRequisitoAggregateType<T extends ServicoRequisitoAggregateArgs> = {
        [P in keyof T & keyof AggregateServicoRequisito]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateServicoRequisito[P]>
      : GetScalarType<T[P], AggregateServicoRequisito[P]>
  }




  export type ServicoRequisitoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ServicoRequisitoWhereInput
    orderBy?: ServicoRequisitoOrderByWithAggregationInput | ServicoRequisitoOrderByWithAggregationInput[]
    by: ServicoRequisitoScalarFieldEnum[] | ServicoRequisitoScalarFieldEnum
    having?: ServicoRequisitoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ServicoRequisitoCountAggregateInputType | true
    _min?: ServicoRequisitoMinAggregateInputType
    _max?: ServicoRequisitoMaxAggregateInputType
  }

  export type ServicoRequisitoGroupByOutputType = {
    id: string
    servicoId: string
    nome: string
    etapa: string
    obrigatorio: boolean
    createdAt: Date
    updatedAt: Date
    _count: ServicoRequisitoCountAggregateOutputType | null
    _min: ServicoRequisitoMinAggregateOutputType | null
    _max: ServicoRequisitoMaxAggregateOutputType | null
  }

  type GetServicoRequisitoGroupByPayload<T extends ServicoRequisitoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ServicoRequisitoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ServicoRequisitoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ServicoRequisitoGroupByOutputType[P]>
            : GetScalarType<T[P], ServicoRequisitoGroupByOutputType[P]>
        }
      >
    >


  export type ServicoRequisitoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    servicoId?: boolean
    nome?: boolean
    etapa?: boolean
    obrigatorio?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    servico?: boolean | CatalogoServicoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["servicoRequisito"]>

  export type ServicoRequisitoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    servicoId?: boolean
    nome?: boolean
    etapa?: boolean
    obrigatorio?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    servico?: boolean | CatalogoServicoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["servicoRequisito"]>

  export type ServicoRequisitoSelectScalar = {
    id?: boolean
    servicoId?: boolean
    nome?: boolean
    etapa?: boolean
    obrigatorio?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ServicoRequisitoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    servico?: boolean | CatalogoServicoDefaultArgs<ExtArgs>
  }
  export type ServicoRequisitoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    servico?: boolean | CatalogoServicoDefaultArgs<ExtArgs>
  }

  export type $ServicoRequisitoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ServicoRequisito"
    objects: {
      servico: Prisma.$CatalogoServicoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      servicoId: string
      nome: string
      etapa: string
      obrigatorio: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["servicoRequisito"]>
    composites: {}
  }

  type ServicoRequisitoGetPayload<S extends boolean | null | undefined | ServicoRequisitoDefaultArgs> = $Result.GetResult<Prisma.$ServicoRequisitoPayload, S>

  type ServicoRequisitoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ServicoRequisitoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ServicoRequisitoCountAggregateInputType | true
    }

  export interface ServicoRequisitoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ServicoRequisito'], meta: { name: 'ServicoRequisito' } }
    /**
     * Find zero or one ServicoRequisito that matches the filter.
     * @param {ServicoRequisitoFindUniqueArgs} args - Arguments to find a ServicoRequisito
     * @example
     * // Get one ServicoRequisito
     * const servicoRequisito = await prisma.servicoRequisito.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ServicoRequisitoFindUniqueArgs>(args: SelectSubset<T, ServicoRequisitoFindUniqueArgs<ExtArgs>>): Prisma__ServicoRequisitoClient<$Result.GetResult<Prisma.$ServicoRequisitoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ServicoRequisito that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ServicoRequisitoFindUniqueOrThrowArgs} args - Arguments to find a ServicoRequisito
     * @example
     * // Get one ServicoRequisito
     * const servicoRequisito = await prisma.servicoRequisito.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ServicoRequisitoFindUniqueOrThrowArgs>(args: SelectSubset<T, ServicoRequisitoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ServicoRequisitoClient<$Result.GetResult<Prisma.$ServicoRequisitoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ServicoRequisito that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServicoRequisitoFindFirstArgs} args - Arguments to find a ServicoRequisito
     * @example
     * // Get one ServicoRequisito
     * const servicoRequisito = await prisma.servicoRequisito.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ServicoRequisitoFindFirstArgs>(args?: SelectSubset<T, ServicoRequisitoFindFirstArgs<ExtArgs>>): Prisma__ServicoRequisitoClient<$Result.GetResult<Prisma.$ServicoRequisitoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ServicoRequisito that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServicoRequisitoFindFirstOrThrowArgs} args - Arguments to find a ServicoRequisito
     * @example
     * // Get one ServicoRequisito
     * const servicoRequisito = await prisma.servicoRequisito.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ServicoRequisitoFindFirstOrThrowArgs>(args?: SelectSubset<T, ServicoRequisitoFindFirstOrThrowArgs<ExtArgs>>): Prisma__ServicoRequisitoClient<$Result.GetResult<Prisma.$ServicoRequisitoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ServicoRequisitos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServicoRequisitoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ServicoRequisitos
     * const servicoRequisitos = await prisma.servicoRequisito.findMany()
     * 
     * // Get first 10 ServicoRequisitos
     * const servicoRequisitos = await prisma.servicoRequisito.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const servicoRequisitoWithIdOnly = await prisma.servicoRequisito.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ServicoRequisitoFindManyArgs>(args?: SelectSubset<T, ServicoRequisitoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServicoRequisitoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ServicoRequisito.
     * @param {ServicoRequisitoCreateArgs} args - Arguments to create a ServicoRequisito.
     * @example
     * // Create one ServicoRequisito
     * const ServicoRequisito = await prisma.servicoRequisito.create({
     *   data: {
     *     // ... data to create a ServicoRequisito
     *   }
     * })
     * 
     */
    create<T extends ServicoRequisitoCreateArgs>(args: SelectSubset<T, ServicoRequisitoCreateArgs<ExtArgs>>): Prisma__ServicoRequisitoClient<$Result.GetResult<Prisma.$ServicoRequisitoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ServicoRequisitos.
     * @param {ServicoRequisitoCreateManyArgs} args - Arguments to create many ServicoRequisitos.
     * @example
     * // Create many ServicoRequisitos
     * const servicoRequisito = await prisma.servicoRequisito.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ServicoRequisitoCreateManyArgs>(args?: SelectSubset<T, ServicoRequisitoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ServicoRequisitos and returns the data saved in the database.
     * @param {ServicoRequisitoCreateManyAndReturnArgs} args - Arguments to create many ServicoRequisitos.
     * @example
     * // Create many ServicoRequisitos
     * const servicoRequisito = await prisma.servicoRequisito.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ServicoRequisitos and only return the `id`
     * const servicoRequisitoWithIdOnly = await prisma.servicoRequisito.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ServicoRequisitoCreateManyAndReturnArgs>(args?: SelectSubset<T, ServicoRequisitoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ServicoRequisitoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ServicoRequisito.
     * @param {ServicoRequisitoDeleteArgs} args - Arguments to delete one ServicoRequisito.
     * @example
     * // Delete one ServicoRequisito
     * const ServicoRequisito = await prisma.servicoRequisito.delete({
     *   where: {
     *     // ... filter to delete one ServicoRequisito
     *   }
     * })
     * 
     */
    delete<T extends ServicoRequisitoDeleteArgs>(args: SelectSubset<T, ServicoRequisitoDeleteArgs<ExtArgs>>): Prisma__ServicoRequisitoClient<$Result.GetResult<Prisma.$ServicoRequisitoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ServicoRequisito.
     * @param {ServicoRequisitoUpdateArgs} args - Arguments to update one ServicoRequisito.
     * @example
     * // Update one ServicoRequisito
     * const servicoRequisito = await prisma.servicoRequisito.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ServicoRequisitoUpdateArgs>(args: SelectSubset<T, ServicoRequisitoUpdateArgs<ExtArgs>>): Prisma__ServicoRequisitoClient<$Result.GetResult<Prisma.$ServicoRequisitoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ServicoRequisitos.
     * @param {ServicoRequisitoDeleteManyArgs} args - Arguments to filter ServicoRequisitos to delete.
     * @example
     * // Delete a few ServicoRequisitos
     * const { count } = await prisma.servicoRequisito.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ServicoRequisitoDeleteManyArgs>(args?: SelectSubset<T, ServicoRequisitoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ServicoRequisitos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServicoRequisitoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ServicoRequisitos
     * const servicoRequisito = await prisma.servicoRequisito.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ServicoRequisitoUpdateManyArgs>(args: SelectSubset<T, ServicoRequisitoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ServicoRequisito.
     * @param {ServicoRequisitoUpsertArgs} args - Arguments to update or create a ServicoRequisito.
     * @example
     * // Update or create a ServicoRequisito
     * const servicoRequisito = await prisma.servicoRequisito.upsert({
     *   create: {
     *     // ... data to create a ServicoRequisito
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ServicoRequisito we want to update
     *   }
     * })
     */
    upsert<T extends ServicoRequisitoUpsertArgs>(args: SelectSubset<T, ServicoRequisitoUpsertArgs<ExtArgs>>): Prisma__ServicoRequisitoClient<$Result.GetResult<Prisma.$ServicoRequisitoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ServicoRequisitos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServicoRequisitoCountArgs} args - Arguments to filter ServicoRequisitos to count.
     * @example
     * // Count the number of ServicoRequisitos
     * const count = await prisma.servicoRequisito.count({
     *   where: {
     *     // ... the filter for the ServicoRequisitos we want to count
     *   }
     * })
    **/
    count<T extends ServicoRequisitoCountArgs>(
      args?: Subset<T, ServicoRequisitoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ServicoRequisitoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ServicoRequisito.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServicoRequisitoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ServicoRequisitoAggregateArgs>(args: Subset<T, ServicoRequisitoAggregateArgs>): Prisma.PrismaPromise<GetServicoRequisitoAggregateType<T>>

    /**
     * Group by ServicoRequisito.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ServicoRequisitoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ServicoRequisitoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ServicoRequisitoGroupByArgs['orderBy'] }
        : { orderBy?: ServicoRequisitoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ServicoRequisitoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetServicoRequisitoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ServicoRequisito model
   */
  readonly fields: ServicoRequisitoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ServicoRequisito.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ServicoRequisitoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    servico<T extends CatalogoServicoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, CatalogoServicoDefaultArgs<ExtArgs>>): Prisma__CatalogoServicoClient<$Result.GetResult<Prisma.$CatalogoServicoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ServicoRequisito model
   */ 
  interface ServicoRequisitoFieldRefs {
    readonly id: FieldRef<"ServicoRequisito", 'String'>
    readonly servicoId: FieldRef<"ServicoRequisito", 'String'>
    readonly nome: FieldRef<"ServicoRequisito", 'String'>
    readonly etapa: FieldRef<"ServicoRequisito", 'String'>
    readonly obrigatorio: FieldRef<"ServicoRequisito", 'Boolean'>
    readonly createdAt: FieldRef<"ServicoRequisito", 'DateTime'>
    readonly updatedAt: FieldRef<"ServicoRequisito", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ServicoRequisito findUnique
   */
  export type ServicoRequisitoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServicoRequisito
     */
    select?: ServicoRequisitoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServicoRequisitoInclude<ExtArgs> | null
    /**
     * Filter, which ServicoRequisito to fetch.
     */
    where: ServicoRequisitoWhereUniqueInput
  }

  /**
   * ServicoRequisito findUniqueOrThrow
   */
  export type ServicoRequisitoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServicoRequisito
     */
    select?: ServicoRequisitoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServicoRequisitoInclude<ExtArgs> | null
    /**
     * Filter, which ServicoRequisito to fetch.
     */
    where: ServicoRequisitoWhereUniqueInput
  }

  /**
   * ServicoRequisito findFirst
   */
  export type ServicoRequisitoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServicoRequisito
     */
    select?: ServicoRequisitoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServicoRequisitoInclude<ExtArgs> | null
    /**
     * Filter, which ServicoRequisito to fetch.
     */
    where?: ServicoRequisitoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ServicoRequisitos to fetch.
     */
    orderBy?: ServicoRequisitoOrderByWithRelationInput | ServicoRequisitoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ServicoRequisitos.
     */
    cursor?: ServicoRequisitoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ServicoRequisitos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ServicoRequisitos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ServicoRequisitos.
     */
    distinct?: ServicoRequisitoScalarFieldEnum | ServicoRequisitoScalarFieldEnum[]
  }

  /**
   * ServicoRequisito findFirstOrThrow
   */
  export type ServicoRequisitoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServicoRequisito
     */
    select?: ServicoRequisitoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServicoRequisitoInclude<ExtArgs> | null
    /**
     * Filter, which ServicoRequisito to fetch.
     */
    where?: ServicoRequisitoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ServicoRequisitos to fetch.
     */
    orderBy?: ServicoRequisitoOrderByWithRelationInput | ServicoRequisitoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ServicoRequisitos.
     */
    cursor?: ServicoRequisitoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ServicoRequisitos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ServicoRequisitos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ServicoRequisitos.
     */
    distinct?: ServicoRequisitoScalarFieldEnum | ServicoRequisitoScalarFieldEnum[]
  }

  /**
   * ServicoRequisito findMany
   */
  export type ServicoRequisitoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServicoRequisito
     */
    select?: ServicoRequisitoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServicoRequisitoInclude<ExtArgs> | null
    /**
     * Filter, which ServicoRequisitos to fetch.
     */
    where?: ServicoRequisitoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ServicoRequisitos to fetch.
     */
    orderBy?: ServicoRequisitoOrderByWithRelationInput | ServicoRequisitoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ServicoRequisitos.
     */
    cursor?: ServicoRequisitoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ServicoRequisitos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ServicoRequisitos.
     */
    skip?: number
    distinct?: ServicoRequisitoScalarFieldEnum | ServicoRequisitoScalarFieldEnum[]
  }

  /**
   * ServicoRequisito create
   */
  export type ServicoRequisitoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServicoRequisito
     */
    select?: ServicoRequisitoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServicoRequisitoInclude<ExtArgs> | null
    /**
     * The data needed to create a ServicoRequisito.
     */
    data: XOR<ServicoRequisitoCreateInput, ServicoRequisitoUncheckedCreateInput>
  }

  /**
   * ServicoRequisito createMany
   */
  export type ServicoRequisitoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ServicoRequisitos.
     */
    data: ServicoRequisitoCreateManyInput | ServicoRequisitoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ServicoRequisito createManyAndReturn
   */
  export type ServicoRequisitoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServicoRequisito
     */
    select?: ServicoRequisitoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ServicoRequisitos.
     */
    data: ServicoRequisitoCreateManyInput | ServicoRequisitoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServicoRequisitoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ServicoRequisito update
   */
  export type ServicoRequisitoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServicoRequisito
     */
    select?: ServicoRequisitoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServicoRequisitoInclude<ExtArgs> | null
    /**
     * The data needed to update a ServicoRequisito.
     */
    data: XOR<ServicoRequisitoUpdateInput, ServicoRequisitoUncheckedUpdateInput>
    /**
     * Choose, which ServicoRequisito to update.
     */
    where: ServicoRequisitoWhereUniqueInput
  }

  /**
   * ServicoRequisito updateMany
   */
  export type ServicoRequisitoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ServicoRequisitos.
     */
    data: XOR<ServicoRequisitoUpdateManyMutationInput, ServicoRequisitoUncheckedUpdateManyInput>
    /**
     * Filter which ServicoRequisitos to update
     */
    where?: ServicoRequisitoWhereInput
  }

  /**
   * ServicoRequisito upsert
   */
  export type ServicoRequisitoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServicoRequisito
     */
    select?: ServicoRequisitoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServicoRequisitoInclude<ExtArgs> | null
    /**
     * The filter to search for the ServicoRequisito to update in case it exists.
     */
    where: ServicoRequisitoWhereUniqueInput
    /**
     * In case the ServicoRequisito found by the `where` argument doesn't exist, create a new ServicoRequisito with this data.
     */
    create: XOR<ServicoRequisitoCreateInput, ServicoRequisitoUncheckedCreateInput>
    /**
     * In case the ServicoRequisito was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ServicoRequisitoUpdateInput, ServicoRequisitoUncheckedUpdateInput>
  }

  /**
   * ServicoRequisito delete
   */
  export type ServicoRequisitoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServicoRequisito
     */
    select?: ServicoRequisitoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServicoRequisitoInclude<ExtArgs> | null
    /**
     * Filter which ServicoRequisito to delete.
     */
    where: ServicoRequisitoWhereUniqueInput
  }

  /**
   * ServicoRequisito deleteMany
   */
  export type ServicoRequisitoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ServicoRequisitos to delete
     */
    where?: ServicoRequisitoWhereInput
  }

  /**
   * ServicoRequisito without action
   */
  export type ServicoRequisitoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ServicoRequisito
     */
    select?: ServicoRequisitoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ServicoRequisitoInclude<ExtArgs> | null
  }


  /**
   * Model AssessoriaJuridica
   */

  export type AggregateAssessoriaJuridica = {
    _count: AssessoriaJuridicaCountAggregateOutputType | null
    _min: AssessoriaJuridicaMinAggregateOutputType | null
    _max: AssessoriaJuridicaMaxAggregateOutputType | null
  }

  export type AssessoriaJuridicaMinAggregateOutputType = {
    id: string | null
    clienteId: string | null
    responsavelId: string | null
    servicoId: string | null
    observacoes: string | null
    criadoEm: Date | null
  }

  export type AssessoriaJuridicaMaxAggregateOutputType = {
    id: string | null
    clienteId: string | null
    responsavelId: string | null
    servicoId: string | null
    observacoes: string | null
    criadoEm: Date | null
  }

  export type AssessoriaJuridicaCountAggregateOutputType = {
    id: number
    clienteId: number
    responsavelId: number
    servicoId: number
    respostas: number
    observacoes: number
    criadoEm: number
    _all: number
  }


  export type AssessoriaJuridicaMinAggregateInputType = {
    id?: true
    clienteId?: true
    responsavelId?: true
    servicoId?: true
    observacoes?: true
    criadoEm?: true
  }

  export type AssessoriaJuridicaMaxAggregateInputType = {
    id?: true
    clienteId?: true
    responsavelId?: true
    servicoId?: true
    observacoes?: true
    criadoEm?: true
  }

  export type AssessoriaJuridicaCountAggregateInputType = {
    id?: true
    clienteId?: true
    responsavelId?: true
    servicoId?: true
    respostas?: true
    observacoes?: true
    criadoEm?: true
    _all?: true
  }

  export type AssessoriaJuridicaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AssessoriaJuridica to aggregate.
     */
    where?: AssessoriaJuridicaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssessoriaJuridicas to fetch.
     */
    orderBy?: AssessoriaJuridicaOrderByWithRelationInput | AssessoriaJuridicaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AssessoriaJuridicaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssessoriaJuridicas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssessoriaJuridicas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AssessoriaJuridicas
    **/
    _count?: true | AssessoriaJuridicaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AssessoriaJuridicaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AssessoriaJuridicaMaxAggregateInputType
  }

  export type GetAssessoriaJuridicaAggregateType<T extends AssessoriaJuridicaAggregateArgs> = {
        [P in keyof T & keyof AggregateAssessoriaJuridica]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAssessoriaJuridica[P]>
      : GetScalarType<T[P], AggregateAssessoriaJuridica[P]>
  }




  export type AssessoriaJuridicaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AssessoriaJuridicaWhereInput
    orderBy?: AssessoriaJuridicaOrderByWithAggregationInput | AssessoriaJuridicaOrderByWithAggregationInput[]
    by: AssessoriaJuridicaScalarFieldEnum[] | AssessoriaJuridicaScalarFieldEnum
    having?: AssessoriaJuridicaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AssessoriaJuridicaCountAggregateInputType | true
    _min?: AssessoriaJuridicaMinAggregateInputType
    _max?: AssessoriaJuridicaMaxAggregateInputType
  }

  export type AssessoriaJuridicaGroupByOutputType = {
    id: string
    clienteId: string
    responsavelId: string
    servicoId: string | null
    respostas: JsonValue
    observacoes: string | null
    criadoEm: Date
    _count: AssessoriaJuridicaCountAggregateOutputType | null
    _min: AssessoriaJuridicaMinAggregateOutputType | null
    _max: AssessoriaJuridicaMaxAggregateOutputType | null
  }

  type GetAssessoriaJuridicaGroupByPayload<T extends AssessoriaJuridicaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AssessoriaJuridicaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AssessoriaJuridicaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AssessoriaJuridicaGroupByOutputType[P]>
            : GetScalarType<T[P], AssessoriaJuridicaGroupByOutputType[P]>
        }
      >
    >


  export type AssessoriaJuridicaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clienteId?: boolean
    responsavelId?: boolean
    servicoId?: boolean
    respostas?: boolean
    observacoes?: boolean
    criadoEm?: boolean
  }, ExtArgs["result"]["assessoriaJuridica"]>

  export type AssessoriaJuridicaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    clienteId?: boolean
    responsavelId?: boolean
    servicoId?: boolean
    respostas?: boolean
    observacoes?: boolean
    criadoEm?: boolean
  }, ExtArgs["result"]["assessoriaJuridica"]>

  export type AssessoriaJuridicaSelectScalar = {
    id?: boolean
    clienteId?: boolean
    responsavelId?: boolean
    servicoId?: boolean
    respostas?: boolean
    observacoes?: boolean
    criadoEm?: boolean
  }


  export type $AssessoriaJuridicaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AssessoriaJuridica"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      clienteId: string
      responsavelId: string
      servicoId: string | null
      respostas: Prisma.JsonValue
      observacoes: string | null
      criadoEm: Date
    }, ExtArgs["result"]["assessoriaJuridica"]>
    composites: {}
  }

  type AssessoriaJuridicaGetPayload<S extends boolean | null | undefined | AssessoriaJuridicaDefaultArgs> = $Result.GetResult<Prisma.$AssessoriaJuridicaPayload, S>

  type AssessoriaJuridicaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AssessoriaJuridicaFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AssessoriaJuridicaCountAggregateInputType | true
    }

  export interface AssessoriaJuridicaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AssessoriaJuridica'], meta: { name: 'AssessoriaJuridica' } }
    /**
     * Find zero or one AssessoriaJuridica that matches the filter.
     * @param {AssessoriaJuridicaFindUniqueArgs} args - Arguments to find a AssessoriaJuridica
     * @example
     * // Get one AssessoriaJuridica
     * const assessoriaJuridica = await prisma.assessoriaJuridica.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AssessoriaJuridicaFindUniqueArgs>(args: SelectSubset<T, AssessoriaJuridicaFindUniqueArgs<ExtArgs>>): Prisma__AssessoriaJuridicaClient<$Result.GetResult<Prisma.$AssessoriaJuridicaPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AssessoriaJuridica that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AssessoriaJuridicaFindUniqueOrThrowArgs} args - Arguments to find a AssessoriaJuridica
     * @example
     * // Get one AssessoriaJuridica
     * const assessoriaJuridica = await prisma.assessoriaJuridica.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AssessoriaJuridicaFindUniqueOrThrowArgs>(args: SelectSubset<T, AssessoriaJuridicaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AssessoriaJuridicaClient<$Result.GetResult<Prisma.$AssessoriaJuridicaPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AssessoriaJuridica that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessoriaJuridicaFindFirstArgs} args - Arguments to find a AssessoriaJuridica
     * @example
     * // Get one AssessoriaJuridica
     * const assessoriaJuridica = await prisma.assessoriaJuridica.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AssessoriaJuridicaFindFirstArgs>(args?: SelectSubset<T, AssessoriaJuridicaFindFirstArgs<ExtArgs>>): Prisma__AssessoriaJuridicaClient<$Result.GetResult<Prisma.$AssessoriaJuridicaPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AssessoriaJuridica that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessoriaJuridicaFindFirstOrThrowArgs} args - Arguments to find a AssessoriaJuridica
     * @example
     * // Get one AssessoriaJuridica
     * const assessoriaJuridica = await prisma.assessoriaJuridica.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AssessoriaJuridicaFindFirstOrThrowArgs>(args?: SelectSubset<T, AssessoriaJuridicaFindFirstOrThrowArgs<ExtArgs>>): Prisma__AssessoriaJuridicaClient<$Result.GetResult<Prisma.$AssessoriaJuridicaPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AssessoriaJuridicas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessoriaJuridicaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AssessoriaJuridicas
     * const assessoriaJuridicas = await prisma.assessoriaJuridica.findMany()
     * 
     * // Get first 10 AssessoriaJuridicas
     * const assessoriaJuridicas = await prisma.assessoriaJuridica.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const assessoriaJuridicaWithIdOnly = await prisma.assessoriaJuridica.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AssessoriaJuridicaFindManyArgs>(args?: SelectSubset<T, AssessoriaJuridicaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssessoriaJuridicaPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AssessoriaJuridica.
     * @param {AssessoriaJuridicaCreateArgs} args - Arguments to create a AssessoriaJuridica.
     * @example
     * // Create one AssessoriaJuridica
     * const AssessoriaJuridica = await prisma.assessoriaJuridica.create({
     *   data: {
     *     // ... data to create a AssessoriaJuridica
     *   }
     * })
     * 
     */
    create<T extends AssessoriaJuridicaCreateArgs>(args: SelectSubset<T, AssessoriaJuridicaCreateArgs<ExtArgs>>): Prisma__AssessoriaJuridicaClient<$Result.GetResult<Prisma.$AssessoriaJuridicaPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AssessoriaJuridicas.
     * @param {AssessoriaJuridicaCreateManyArgs} args - Arguments to create many AssessoriaJuridicas.
     * @example
     * // Create many AssessoriaJuridicas
     * const assessoriaJuridica = await prisma.assessoriaJuridica.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AssessoriaJuridicaCreateManyArgs>(args?: SelectSubset<T, AssessoriaJuridicaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AssessoriaJuridicas and returns the data saved in the database.
     * @param {AssessoriaJuridicaCreateManyAndReturnArgs} args - Arguments to create many AssessoriaJuridicas.
     * @example
     * // Create many AssessoriaJuridicas
     * const assessoriaJuridica = await prisma.assessoriaJuridica.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AssessoriaJuridicas and only return the `id`
     * const assessoriaJuridicaWithIdOnly = await prisma.assessoriaJuridica.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AssessoriaJuridicaCreateManyAndReturnArgs>(args?: SelectSubset<T, AssessoriaJuridicaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AssessoriaJuridicaPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AssessoriaJuridica.
     * @param {AssessoriaJuridicaDeleteArgs} args - Arguments to delete one AssessoriaJuridica.
     * @example
     * // Delete one AssessoriaJuridica
     * const AssessoriaJuridica = await prisma.assessoriaJuridica.delete({
     *   where: {
     *     // ... filter to delete one AssessoriaJuridica
     *   }
     * })
     * 
     */
    delete<T extends AssessoriaJuridicaDeleteArgs>(args: SelectSubset<T, AssessoriaJuridicaDeleteArgs<ExtArgs>>): Prisma__AssessoriaJuridicaClient<$Result.GetResult<Prisma.$AssessoriaJuridicaPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AssessoriaJuridica.
     * @param {AssessoriaJuridicaUpdateArgs} args - Arguments to update one AssessoriaJuridica.
     * @example
     * // Update one AssessoriaJuridica
     * const assessoriaJuridica = await prisma.assessoriaJuridica.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AssessoriaJuridicaUpdateArgs>(args: SelectSubset<T, AssessoriaJuridicaUpdateArgs<ExtArgs>>): Prisma__AssessoriaJuridicaClient<$Result.GetResult<Prisma.$AssessoriaJuridicaPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AssessoriaJuridicas.
     * @param {AssessoriaJuridicaDeleteManyArgs} args - Arguments to filter AssessoriaJuridicas to delete.
     * @example
     * // Delete a few AssessoriaJuridicas
     * const { count } = await prisma.assessoriaJuridica.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AssessoriaJuridicaDeleteManyArgs>(args?: SelectSubset<T, AssessoriaJuridicaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AssessoriaJuridicas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessoriaJuridicaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AssessoriaJuridicas
     * const assessoriaJuridica = await prisma.assessoriaJuridica.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AssessoriaJuridicaUpdateManyArgs>(args: SelectSubset<T, AssessoriaJuridicaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AssessoriaJuridica.
     * @param {AssessoriaJuridicaUpsertArgs} args - Arguments to update or create a AssessoriaJuridica.
     * @example
     * // Update or create a AssessoriaJuridica
     * const assessoriaJuridica = await prisma.assessoriaJuridica.upsert({
     *   create: {
     *     // ... data to create a AssessoriaJuridica
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AssessoriaJuridica we want to update
     *   }
     * })
     */
    upsert<T extends AssessoriaJuridicaUpsertArgs>(args: SelectSubset<T, AssessoriaJuridicaUpsertArgs<ExtArgs>>): Prisma__AssessoriaJuridicaClient<$Result.GetResult<Prisma.$AssessoriaJuridicaPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AssessoriaJuridicas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessoriaJuridicaCountArgs} args - Arguments to filter AssessoriaJuridicas to count.
     * @example
     * // Count the number of AssessoriaJuridicas
     * const count = await prisma.assessoriaJuridica.count({
     *   where: {
     *     // ... the filter for the AssessoriaJuridicas we want to count
     *   }
     * })
    **/
    count<T extends AssessoriaJuridicaCountArgs>(
      args?: Subset<T, AssessoriaJuridicaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AssessoriaJuridicaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AssessoriaJuridica.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessoriaJuridicaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AssessoriaJuridicaAggregateArgs>(args: Subset<T, AssessoriaJuridicaAggregateArgs>): Prisma.PrismaPromise<GetAssessoriaJuridicaAggregateType<T>>

    /**
     * Group by AssessoriaJuridica.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AssessoriaJuridicaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AssessoriaJuridicaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AssessoriaJuridicaGroupByArgs['orderBy'] }
        : { orderBy?: AssessoriaJuridicaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AssessoriaJuridicaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAssessoriaJuridicaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AssessoriaJuridica model
   */
  readonly fields: AssessoriaJuridicaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AssessoriaJuridica.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AssessoriaJuridicaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AssessoriaJuridica model
   */ 
  interface AssessoriaJuridicaFieldRefs {
    readonly id: FieldRef<"AssessoriaJuridica", 'String'>
    readonly clienteId: FieldRef<"AssessoriaJuridica", 'String'>
    readonly responsavelId: FieldRef<"AssessoriaJuridica", 'String'>
    readonly servicoId: FieldRef<"AssessoriaJuridica", 'String'>
    readonly respostas: FieldRef<"AssessoriaJuridica", 'Json'>
    readonly observacoes: FieldRef<"AssessoriaJuridica", 'String'>
    readonly criadoEm: FieldRef<"AssessoriaJuridica", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AssessoriaJuridica findUnique
   */
  export type AssessoriaJuridicaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessoriaJuridica
     */
    select?: AssessoriaJuridicaSelect<ExtArgs> | null
    /**
     * Filter, which AssessoriaJuridica to fetch.
     */
    where: AssessoriaJuridicaWhereUniqueInput
  }

  /**
   * AssessoriaJuridica findUniqueOrThrow
   */
  export type AssessoriaJuridicaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessoriaJuridica
     */
    select?: AssessoriaJuridicaSelect<ExtArgs> | null
    /**
     * Filter, which AssessoriaJuridica to fetch.
     */
    where: AssessoriaJuridicaWhereUniqueInput
  }

  /**
   * AssessoriaJuridica findFirst
   */
  export type AssessoriaJuridicaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessoriaJuridica
     */
    select?: AssessoriaJuridicaSelect<ExtArgs> | null
    /**
     * Filter, which AssessoriaJuridica to fetch.
     */
    where?: AssessoriaJuridicaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssessoriaJuridicas to fetch.
     */
    orderBy?: AssessoriaJuridicaOrderByWithRelationInput | AssessoriaJuridicaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AssessoriaJuridicas.
     */
    cursor?: AssessoriaJuridicaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssessoriaJuridicas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssessoriaJuridicas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AssessoriaJuridicas.
     */
    distinct?: AssessoriaJuridicaScalarFieldEnum | AssessoriaJuridicaScalarFieldEnum[]
  }

  /**
   * AssessoriaJuridica findFirstOrThrow
   */
  export type AssessoriaJuridicaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessoriaJuridica
     */
    select?: AssessoriaJuridicaSelect<ExtArgs> | null
    /**
     * Filter, which AssessoriaJuridica to fetch.
     */
    where?: AssessoriaJuridicaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssessoriaJuridicas to fetch.
     */
    orderBy?: AssessoriaJuridicaOrderByWithRelationInput | AssessoriaJuridicaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AssessoriaJuridicas.
     */
    cursor?: AssessoriaJuridicaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssessoriaJuridicas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssessoriaJuridicas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AssessoriaJuridicas.
     */
    distinct?: AssessoriaJuridicaScalarFieldEnum | AssessoriaJuridicaScalarFieldEnum[]
  }

  /**
   * AssessoriaJuridica findMany
   */
  export type AssessoriaJuridicaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessoriaJuridica
     */
    select?: AssessoriaJuridicaSelect<ExtArgs> | null
    /**
     * Filter, which AssessoriaJuridicas to fetch.
     */
    where?: AssessoriaJuridicaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AssessoriaJuridicas to fetch.
     */
    orderBy?: AssessoriaJuridicaOrderByWithRelationInput | AssessoriaJuridicaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AssessoriaJuridicas.
     */
    cursor?: AssessoriaJuridicaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AssessoriaJuridicas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AssessoriaJuridicas.
     */
    skip?: number
    distinct?: AssessoriaJuridicaScalarFieldEnum | AssessoriaJuridicaScalarFieldEnum[]
  }

  /**
   * AssessoriaJuridica create
   */
  export type AssessoriaJuridicaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessoriaJuridica
     */
    select?: AssessoriaJuridicaSelect<ExtArgs> | null
    /**
     * The data needed to create a AssessoriaJuridica.
     */
    data: XOR<AssessoriaJuridicaCreateInput, AssessoriaJuridicaUncheckedCreateInput>
  }

  /**
   * AssessoriaJuridica createMany
   */
  export type AssessoriaJuridicaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AssessoriaJuridicas.
     */
    data: AssessoriaJuridicaCreateManyInput | AssessoriaJuridicaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AssessoriaJuridica createManyAndReturn
   */
  export type AssessoriaJuridicaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessoriaJuridica
     */
    select?: AssessoriaJuridicaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AssessoriaJuridicas.
     */
    data: AssessoriaJuridicaCreateManyInput | AssessoriaJuridicaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AssessoriaJuridica update
   */
  export type AssessoriaJuridicaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessoriaJuridica
     */
    select?: AssessoriaJuridicaSelect<ExtArgs> | null
    /**
     * The data needed to update a AssessoriaJuridica.
     */
    data: XOR<AssessoriaJuridicaUpdateInput, AssessoriaJuridicaUncheckedUpdateInput>
    /**
     * Choose, which AssessoriaJuridica to update.
     */
    where: AssessoriaJuridicaWhereUniqueInput
  }

  /**
   * AssessoriaJuridica updateMany
   */
  export type AssessoriaJuridicaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AssessoriaJuridicas.
     */
    data: XOR<AssessoriaJuridicaUpdateManyMutationInput, AssessoriaJuridicaUncheckedUpdateManyInput>
    /**
     * Filter which AssessoriaJuridicas to update
     */
    where?: AssessoriaJuridicaWhereInput
  }

  /**
   * AssessoriaJuridica upsert
   */
  export type AssessoriaJuridicaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessoriaJuridica
     */
    select?: AssessoriaJuridicaSelect<ExtArgs> | null
    /**
     * The filter to search for the AssessoriaJuridica to update in case it exists.
     */
    where: AssessoriaJuridicaWhereUniqueInput
    /**
     * In case the AssessoriaJuridica found by the `where` argument doesn't exist, create a new AssessoriaJuridica with this data.
     */
    create: XOR<AssessoriaJuridicaCreateInput, AssessoriaJuridicaUncheckedCreateInput>
    /**
     * In case the AssessoriaJuridica was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AssessoriaJuridicaUpdateInput, AssessoriaJuridicaUncheckedUpdateInput>
  }

  /**
   * AssessoriaJuridica delete
   */
  export type AssessoriaJuridicaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessoriaJuridica
     */
    select?: AssessoriaJuridicaSelect<ExtArgs> | null
    /**
     * Filter which AssessoriaJuridica to delete.
     */
    where: AssessoriaJuridicaWhereUniqueInput
  }

  /**
   * AssessoriaJuridica deleteMany
   */
  export type AssessoriaJuridicaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AssessoriaJuridicas to delete
     */
    where?: AssessoriaJuridicaWhereInput
  }

  /**
   * AssessoriaJuridica without action
   */
  export type AssessoriaJuridicaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AssessoriaJuridica
     */
    select?: AssessoriaJuridicaSelect<ExtArgs> | null
  }


  /**
   * Model Apostilamento
   */

  export type AggregateApostilamento = {
    _count: ApostilamentoCountAggregateOutputType | null
    _min: ApostilamentoMinAggregateOutputType | null
    _max: ApostilamentoMaxAggregateOutputType | null
  }

  export type ApostilamentoMinAggregateOutputType = {
    id: string | null
    documentoId: string | null
    status: string | null
    observacoes: string | null
    solicitadoEm: Date | null
    concluidoEm: Date | null
  }

  export type ApostilamentoMaxAggregateOutputType = {
    id: string | null
    documentoId: string | null
    status: string | null
    observacoes: string | null
    solicitadoEm: Date | null
    concluidoEm: Date | null
  }

  export type ApostilamentoCountAggregateOutputType = {
    id: number
    documentoId: number
    status: number
    observacoes: number
    solicitadoEm: number
    concluidoEm: number
    _all: number
  }


  export type ApostilamentoMinAggregateInputType = {
    id?: true
    documentoId?: true
    status?: true
    observacoes?: true
    solicitadoEm?: true
    concluidoEm?: true
  }

  export type ApostilamentoMaxAggregateInputType = {
    id?: true
    documentoId?: true
    status?: true
    observacoes?: true
    solicitadoEm?: true
    concluidoEm?: true
  }

  export type ApostilamentoCountAggregateInputType = {
    id?: true
    documentoId?: true
    status?: true
    observacoes?: true
    solicitadoEm?: true
    concluidoEm?: true
    _all?: true
  }

  export type ApostilamentoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Apostilamento to aggregate.
     */
    where?: ApostilamentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Apostilamentos to fetch.
     */
    orderBy?: ApostilamentoOrderByWithRelationInput | ApostilamentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ApostilamentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Apostilamentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Apostilamentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Apostilamentos
    **/
    _count?: true | ApostilamentoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ApostilamentoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ApostilamentoMaxAggregateInputType
  }

  export type GetApostilamentoAggregateType<T extends ApostilamentoAggregateArgs> = {
        [P in keyof T & keyof AggregateApostilamento]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApostilamento[P]>
      : GetScalarType<T[P], AggregateApostilamento[P]>
  }




  export type ApostilamentoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApostilamentoWhereInput
    orderBy?: ApostilamentoOrderByWithAggregationInput | ApostilamentoOrderByWithAggregationInput[]
    by: ApostilamentoScalarFieldEnum[] | ApostilamentoScalarFieldEnum
    having?: ApostilamentoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ApostilamentoCountAggregateInputType | true
    _min?: ApostilamentoMinAggregateInputType
    _max?: ApostilamentoMaxAggregateInputType
  }

  export type ApostilamentoGroupByOutputType = {
    id: string
    documentoId: string
    status: string
    observacoes: string | null
    solicitadoEm: Date
    concluidoEm: Date | null
    _count: ApostilamentoCountAggregateOutputType | null
    _min: ApostilamentoMinAggregateOutputType | null
    _max: ApostilamentoMaxAggregateOutputType | null
  }

  type GetApostilamentoGroupByPayload<T extends ApostilamentoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ApostilamentoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ApostilamentoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ApostilamentoGroupByOutputType[P]>
            : GetScalarType<T[P], ApostilamentoGroupByOutputType[P]>
        }
      >
    >


  export type ApostilamentoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    documentoId?: boolean
    status?: boolean
    observacoes?: boolean
    solicitadoEm?: boolean
    concluidoEm?: boolean
    documento?: boolean | DocumentoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["apostilamento"]>

  export type ApostilamentoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    documentoId?: boolean
    status?: boolean
    observacoes?: boolean
    solicitadoEm?: boolean
    concluidoEm?: boolean
    documento?: boolean | DocumentoDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["apostilamento"]>

  export type ApostilamentoSelectScalar = {
    id?: boolean
    documentoId?: boolean
    status?: boolean
    observacoes?: boolean
    solicitadoEm?: boolean
    concluidoEm?: boolean
  }

  export type ApostilamentoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    documento?: boolean | DocumentoDefaultArgs<ExtArgs>
  }
  export type ApostilamentoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    documento?: boolean | DocumentoDefaultArgs<ExtArgs>
  }

  export type $ApostilamentoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Apostilamento"
    objects: {
      documento: Prisma.$DocumentoPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      documentoId: string
      status: string
      observacoes: string | null
      solicitadoEm: Date
      concluidoEm: Date | null
    }, ExtArgs["result"]["apostilamento"]>
    composites: {}
  }

  type ApostilamentoGetPayload<S extends boolean | null | undefined | ApostilamentoDefaultArgs> = $Result.GetResult<Prisma.$ApostilamentoPayload, S>

  type ApostilamentoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ApostilamentoFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ApostilamentoCountAggregateInputType | true
    }

  export interface ApostilamentoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Apostilamento'], meta: { name: 'Apostilamento' } }
    /**
     * Find zero or one Apostilamento that matches the filter.
     * @param {ApostilamentoFindUniqueArgs} args - Arguments to find a Apostilamento
     * @example
     * // Get one Apostilamento
     * const apostilamento = await prisma.apostilamento.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ApostilamentoFindUniqueArgs>(args: SelectSubset<T, ApostilamentoFindUniqueArgs<ExtArgs>>): Prisma__ApostilamentoClient<$Result.GetResult<Prisma.$ApostilamentoPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Apostilamento that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ApostilamentoFindUniqueOrThrowArgs} args - Arguments to find a Apostilamento
     * @example
     * // Get one Apostilamento
     * const apostilamento = await prisma.apostilamento.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ApostilamentoFindUniqueOrThrowArgs>(args: SelectSubset<T, ApostilamentoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ApostilamentoClient<$Result.GetResult<Prisma.$ApostilamentoPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Apostilamento that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApostilamentoFindFirstArgs} args - Arguments to find a Apostilamento
     * @example
     * // Get one Apostilamento
     * const apostilamento = await prisma.apostilamento.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ApostilamentoFindFirstArgs>(args?: SelectSubset<T, ApostilamentoFindFirstArgs<ExtArgs>>): Prisma__ApostilamentoClient<$Result.GetResult<Prisma.$ApostilamentoPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Apostilamento that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApostilamentoFindFirstOrThrowArgs} args - Arguments to find a Apostilamento
     * @example
     * // Get one Apostilamento
     * const apostilamento = await prisma.apostilamento.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ApostilamentoFindFirstOrThrowArgs>(args?: SelectSubset<T, ApostilamentoFindFirstOrThrowArgs<ExtArgs>>): Prisma__ApostilamentoClient<$Result.GetResult<Prisma.$ApostilamentoPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Apostilamentos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApostilamentoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Apostilamentos
     * const apostilamentos = await prisma.apostilamento.findMany()
     * 
     * // Get first 10 Apostilamentos
     * const apostilamentos = await prisma.apostilamento.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const apostilamentoWithIdOnly = await prisma.apostilamento.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ApostilamentoFindManyArgs>(args?: SelectSubset<T, ApostilamentoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApostilamentoPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Apostilamento.
     * @param {ApostilamentoCreateArgs} args - Arguments to create a Apostilamento.
     * @example
     * // Create one Apostilamento
     * const Apostilamento = await prisma.apostilamento.create({
     *   data: {
     *     // ... data to create a Apostilamento
     *   }
     * })
     * 
     */
    create<T extends ApostilamentoCreateArgs>(args: SelectSubset<T, ApostilamentoCreateArgs<ExtArgs>>): Prisma__ApostilamentoClient<$Result.GetResult<Prisma.$ApostilamentoPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Apostilamentos.
     * @param {ApostilamentoCreateManyArgs} args - Arguments to create many Apostilamentos.
     * @example
     * // Create many Apostilamentos
     * const apostilamento = await prisma.apostilamento.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ApostilamentoCreateManyArgs>(args?: SelectSubset<T, ApostilamentoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Apostilamentos and returns the data saved in the database.
     * @param {ApostilamentoCreateManyAndReturnArgs} args - Arguments to create many Apostilamentos.
     * @example
     * // Create many Apostilamentos
     * const apostilamento = await prisma.apostilamento.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Apostilamentos and only return the `id`
     * const apostilamentoWithIdOnly = await prisma.apostilamento.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ApostilamentoCreateManyAndReturnArgs>(args?: SelectSubset<T, ApostilamentoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApostilamentoPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Apostilamento.
     * @param {ApostilamentoDeleteArgs} args - Arguments to delete one Apostilamento.
     * @example
     * // Delete one Apostilamento
     * const Apostilamento = await prisma.apostilamento.delete({
     *   where: {
     *     // ... filter to delete one Apostilamento
     *   }
     * })
     * 
     */
    delete<T extends ApostilamentoDeleteArgs>(args: SelectSubset<T, ApostilamentoDeleteArgs<ExtArgs>>): Prisma__ApostilamentoClient<$Result.GetResult<Prisma.$ApostilamentoPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Apostilamento.
     * @param {ApostilamentoUpdateArgs} args - Arguments to update one Apostilamento.
     * @example
     * // Update one Apostilamento
     * const apostilamento = await prisma.apostilamento.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ApostilamentoUpdateArgs>(args: SelectSubset<T, ApostilamentoUpdateArgs<ExtArgs>>): Prisma__ApostilamentoClient<$Result.GetResult<Prisma.$ApostilamentoPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Apostilamentos.
     * @param {ApostilamentoDeleteManyArgs} args - Arguments to filter Apostilamentos to delete.
     * @example
     * // Delete a few Apostilamentos
     * const { count } = await prisma.apostilamento.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ApostilamentoDeleteManyArgs>(args?: SelectSubset<T, ApostilamentoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Apostilamentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApostilamentoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Apostilamentos
     * const apostilamento = await prisma.apostilamento.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ApostilamentoUpdateManyArgs>(args: SelectSubset<T, ApostilamentoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Apostilamento.
     * @param {ApostilamentoUpsertArgs} args - Arguments to update or create a Apostilamento.
     * @example
     * // Update or create a Apostilamento
     * const apostilamento = await prisma.apostilamento.upsert({
     *   create: {
     *     // ... data to create a Apostilamento
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Apostilamento we want to update
     *   }
     * })
     */
    upsert<T extends ApostilamentoUpsertArgs>(args: SelectSubset<T, ApostilamentoUpsertArgs<ExtArgs>>): Prisma__ApostilamentoClient<$Result.GetResult<Prisma.$ApostilamentoPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Apostilamentos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApostilamentoCountArgs} args - Arguments to filter Apostilamentos to count.
     * @example
     * // Count the number of Apostilamentos
     * const count = await prisma.apostilamento.count({
     *   where: {
     *     // ... the filter for the Apostilamentos we want to count
     *   }
     * })
    **/
    count<T extends ApostilamentoCountArgs>(
      args?: Subset<T, ApostilamentoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ApostilamentoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Apostilamento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApostilamentoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ApostilamentoAggregateArgs>(args: Subset<T, ApostilamentoAggregateArgs>): Prisma.PrismaPromise<GetApostilamentoAggregateType<T>>

    /**
     * Group by Apostilamento.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApostilamentoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ApostilamentoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ApostilamentoGroupByArgs['orderBy'] }
        : { orderBy?: ApostilamentoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ApostilamentoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetApostilamentoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Apostilamento model
   */
  readonly fields: ApostilamentoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Apostilamento.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ApostilamentoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    documento<T extends DocumentoDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DocumentoDefaultArgs<ExtArgs>>): Prisma__DocumentoClient<$Result.GetResult<Prisma.$DocumentoPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Apostilamento model
   */ 
  interface ApostilamentoFieldRefs {
    readonly id: FieldRef<"Apostilamento", 'String'>
    readonly documentoId: FieldRef<"Apostilamento", 'String'>
    readonly status: FieldRef<"Apostilamento", 'String'>
    readonly observacoes: FieldRef<"Apostilamento", 'String'>
    readonly solicitadoEm: FieldRef<"Apostilamento", 'DateTime'>
    readonly concluidoEm: FieldRef<"Apostilamento", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Apostilamento findUnique
   */
  export type ApostilamentoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apostilamento
     */
    select?: ApostilamentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApostilamentoInclude<ExtArgs> | null
    /**
     * Filter, which Apostilamento to fetch.
     */
    where: ApostilamentoWhereUniqueInput
  }

  /**
   * Apostilamento findUniqueOrThrow
   */
  export type ApostilamentoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apostilamento
     */
    select?: ApostilamentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApostilamentoInclude<ExtArgs> | null
    /**
     * Filter, which Apostilamento to fetch.
     */
    where: ApostilamentoWhereUniqueInput
  }

  /**
   * Apostilamento findFirst
   */
  export type ApostilamentoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apostilamento
     */
    select?: ApostilamentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApostilamentoInclude<ExtArgs> | null
    /**
     * Filter, which Apostilamento to fetch.
     */
    where?: ApostilamentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Apostilamentos to fetch.
     */
    orderBy?: ApostilamentoOrderByWithRelationInput | ApostilamentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Apostilamentos.
     */
    cursor?: ApostilamentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Apostilamentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Apostilamentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Apostilamentos.
     */
    distinct?: ApostilamentoScalarFieldEnum | ApostilamentoScalarFieldEnum[]
  }

  /**
   * Apostilamento findFirstOrThrow
   */
  export type ApostilamentoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apostilamento
     */
    select?: ApostilamentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApostilamentoInclude<ExtArgs> | null
    /**
     * Filter, which Apostilamento to fetch.
     */
    where?: ApostilamentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Apostilamentos to fetch.
     */
    orderBy?: ApostilamentoOrderByWithRelationInput | ApostilamentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Apostilamentos.
     */
    cursor?: ApostilamentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Apostilamentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Apostilamentos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Apostilamentos.
     */
    distinct?: ApostilamentoScalarFieldEnum | ApostilamentoScalarFieldEnum[]
  }

  /**
   * Apostilamento findMany
   */
  export type ApostilamentoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apostilamento
     */
    select?: ApostilamentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApostilamentoInclude<ExtArgs> | null
    /**
     * Filter, which Apostilamentos to fetch.
     */
    where?: ApostilamentoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Apostilamentos to fetch.
     */
    orderBy?: ApostilamentoOrderByWithRelationInput | ApostilamentoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Apostilamentos.
     */
    cursor?: ApostilamentoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Apostilamentos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Apostilamentos.
     */
    skip?: number
    distinct?: ApostilamentoScalarFieldEnum | ApostilamentoScalarFieldEnum[]
  }

  /**
   * Apostilamento create
   */
  export type ApostilamentoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apostilamento
     */
    select?: ApostilamentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApostilamentoInclude<ExtArgs> | null
    /**
     * The data needed to create a Apostilamento.
     */
    data: XOR<ApostilamentoCreateInput, ApostilamentoUncheckedCreateInput>
  }

  /**
   * Apostilamento createMany
   */
  export type ApostilamentoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Apostilamentos.
     */
    data: ApostilamentoCreateManyInput | ApostilamentoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Apostilamento createManyAndReturn
   */
  export type ApostilamentoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apostilamento
     */
    select?: ApostilamentoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Apostilamentos.
     */
    data: ApostilamentoCreateManyInput | ApostilamentoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApostilamentoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Apostilamento update
   */
  export type ApostilamentoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apostilamento
     */
    select?: ApostilamentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApostilamentoInclude<ExtArgs> | null
    /**
     * The data needed to update a Apostilamento.
     */
    data: XOR<ApostilamentoUpdateInput, ApostilamentoUncheckedUpdateInput>
    /**
     * Choose, which Apostilamento to update.
     */
    where: ApostilamentoWhereUniqueInput
  }

  /**
   * Apostilamento updateMany
   */
  export type ApostilamentoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Apostilamentos.
     */
    data: XOR<ApostilamentoUpdateManyMutationInput, ApostilamentoUncheckedUpdateManyInput>
    /**
     * Filter which Apostilamentos to update
     */
    where?: ApostilamentoWhereInput
  }

  /**
   * Apostilamento upsert
   */
  export type ApostilamentoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apostilamento
     */
    select?: ApostilamentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApostilamentoInclude<ExtArgs> | null
    /**
     * The filter to search for the Apostilamento to update in case it exists.
     */
    where: ApostilamentoWhereUniqueInput
    /**
     * In case the Apostilamento found by the `where` argument doesn't exist, create a new Apostilamento with this data.
     */
    create: XOR<ApostilamentoCreateInput, ApostilamentoUncheckedCreateInput>
    /**
     * In case the Apostilamento was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ApostilamentoUpdateInput, ApostilamentoUncheckedUpdateInput>
  }

  /**
   * Apostilamento delete
   */
  export type ApostilamentoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apostilamento
     */
    select?: ApostilamentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApostilamentoInclude<ExtArgs> | null
    /**
     * Filter which Apostilamento to delete.
     */
    where: ApostilamentoWhereUniqueInput
  }

  /**
   * Apostilamento deleteMany
   */
  export type ApostilamentoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Apostilamentos to delete
     */
    where?: ApostilamentoWhereInput
  }

  /**
   * Apostilamento without action
   */
  export type ApostilamentoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Apostilamento
     */
    select?: ApostilamentoSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApostilamentoInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UsuarioScalarFieldEnum: {
    id: 'id',
    email: 'email',
    nome: 'nome',
    tipo: 'tipo',
    bucketRootPath: 'bucketRootPath',
    criadoEm: 'criadoEm',
    atualizadoEm: 'atualizadoEm'
  };

  export type UsuarioScalarFieldEnum = (typeof UsuarioScalarFieldEnum)[keyof typeof UsuarioScalarFieldEnum]


  export const NotificacaoScalarFieldEnum: {
    id: 'id',
    titulo: 'titulo',
    mensagem: 'mensagem',
    lida: 'lida',
    tipo: 'tipo',
    dataPrazo: 'dataPrazo',
    criadoEm: 'criadoEm',
    clienteId: 'clienteId',
    criadorId: 'criadorId',
    usuarioId: 'usuarioId'
  };

  export type NotificacaoScalarFieldEnum = (typeof NotificacaoScalarFieldEnum)[keyof typeof NotificacaoScalarFieldEnum]


  export const ProcessoScalarFieldEnum: {
    id: 'id'
  };

  export type ProcessoScalarFieldEnum = (typeof ProcessoScalarFieldEnum)[keyof typeof ProcessoScalarFieldEnum]


  export const DependenteScalarFieldEnum: {
    id: 'id'
  };

  export type DependenteScalarFieldEnum = (typeof DependenteScalarFieldEnum)[keyof typeof DependenteScalarFieldEnum]


  export const RequerimentoScalarFieldEnum: {
    id: 'id',
    clienteId: 'clienteId',
    processoId: 'processoId',
    tipo: 'tipo',
    status: 'status',
    observacoes: 'observacoes',
    criadorId: 'criadorId',
    createdAt: 'createdAt',
    updated_at: 'updated_at'
  };

  export type RequerimentoScalarFieldEnum = (typeof RequerimentoScalarFieldEnum)[keyof typeof RequerimentoScalarFieldEnum]


  export const DocumentoScalarFieldEnum: {
    id: 'id',
    clienteId: 'clienteId',
    processoId: 'processoId',
    dependenteId: 'dependenteId',
    requerimentoId: 'requerimentoId',
    tipo: 'tipo',
    nomeOriginal: 'nomeOriginal',
    nomeArquivo: 'nomeArquivo',
    storagePath: 'storagePath',
    publicUrl: 'publicUrl',
    contentType: 'contentType',
    tamanho: 'tamanho',
    status: 'status',
    apostilado: 'apostilado',
    traduzido: 'traduzido',
    motivoRejeicao: 'motivoRejeicao',
    analisadoPor: 'analisadoPor',
    analisadoEm: 'analisadoEm',
    solicitadoPeloJuridico: 'solicitadoPeloJuridico',
    dataSolicitacaoJuridico: 'dataSolicitacaoJuridico',
    criadoEm: 'criadoEm',
    atualizadoEm: 'atualizadoEm'
  };

  export type DocumentoScalarFieldEnum = (typeof DocumentoScalarFieldEnum)[keyof typeof DocumentoScalarFieldEnum]


  export const ConfiguracaoScalarFieldEnum: {
    chave: 'chave',
    valor: 'valor',
    criadoEm: 'criadoEm',
    atualizadoEm: 'atualizadoEm'
  };

  export type ConfiguracaoScalarFieldEnum = (typeof ConfiguracaoScalarFieldEnum)[keyof typeof ConfiguracaoScalarFieldEnum]


  export const AgendamentoScalarFieldEnum: {
    id: 'id',
    nome: 'nome',
    email: 'email',
    telefone: 'telefone',
    dataHora: 'dataHora',
    produtoId: 'produtoId',
    duracaoMinutos: 'duracaoMinutos',
    status: 'status',
    usuarioId: 'usuarioId',
    clienteId: 'clienteId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AgendamentoScalarFieldEnum = (typeof AgendamentoScalarFieldEnum)[keyof typeof AgendamentoScalarFieldEnum]


  export const CatalogoServicoScalarFieldEnum: {
    id: 'id',
    nome: 'nome',
    valor: 'valor',
    duracao: 'duracao',
    exibirComercial: 'exibirComercial',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CatalogoServicoScalarFieldEnum = (typeof CatalogoServicoScalarFieldEnum)[keyof typeof CatalogoServicoScalarFieldEnum]


  export const ServicoRequisitoScalarFieldEnum: {
    id: 'id',
    servicoId: 'servicoId',
    nome: 'nome',
    etapa: 'etapa',
    obrigatorio: 'obrigatorio',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ServicoRequisitoScalarFieldEnum = (typeof ServicoRequisitoScalarFieldEnum)[keyof typeof ServicoRequisitoScalarFieldEnum]


  export const AssessoriaJuridicaScalarFieldEnum: {
    id: 'id',
    clienteId: 'clienteId',
    responsavelId: 'responsavelId',
    servicoId: 'servicoId',
    respostas: 'respostas',
    observacoes: 'observacoes',
    criadoEm: 'criadoEm'
  };

  export type AssessoriaJuridicaScalarFieldEnum = (typeof AssessoriaJuridicaScalarFieldEnum)[keyof typeof AssessoriaJuridicaScalarFieldEnum]


  export const ApostilamentoScalarFieldEnum: {
    id: 'id',
    documentoId: 'documentoId',
    status: 'status',
    observacoes: 'observacoes',
    solicitadoEm: 'solicitadoEm',
    concluidoEm: 'concluidoEm'
  };

  export type ApostilamentoScalarFieldEnum = (typeof ApostilamentoScalarFieldEnum)[keyof typeof ApostilamentoScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'TipoUsuario'
   */
  export type EnumTipoUsuarioFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TipoUsuario'>
    


  /**
   * Reference to a field of type 'TipoUsuario[]'
   */
  export type ListEnumTipoUsuarioFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TipoUsuario[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'StatusDocumento'
   */
  export type EnumStatusDocumentoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StatusDocumento'>
    


  /**
   * Reference to a field of type 'StatusDocumento[]'
   */
  export type ListEnumStatusDocumentoFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'StatusDocumento[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UsuarioWhereInput = {
    AND?: UsuarioWhereInput | UsuarioWhereInput[]
    OR?: UsuarioWhereInput[]
    NOT?: UsuarioWhereInput | UsuarioWhereInput[]
    id?: UuidFilter<"Usuario"> | string
    email?: StringFilter<"Usuario"> | string
    nome?: StringNullableFilter<"Usuario"> | string | null
    tipo?: EnumTipoUsuarioFilter<"Usuario"> | $Enums.TipoUsuario
    bucketRootPath?: StringNullableFilter<"Usuario"> | string | null
    criadoEm?: DateTimeFilter<"Usuario"> | Date | string
    atualizadoEm?: DateTimeFilter<"Usuario"> | Date | string
    notificacoes?: NotificacaoListRelationFilter
    agendamentos?: AgendamentoListRelationFilter
  }

  export type UsuarioOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    nome?: SortOrderInput | SortOrder
    tipo?: SortOrder
    bucketRootPath?: SortOrderInput | SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
    notificacoes?: NotificacaoOrderByRelationAggregateInput
    agendamentos?: AgendamentoOrderByRelationAggregateInput
  }

  export type UsuarioWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UsuarioWhereInput | UsuarioWhereInput[]
    OR?: UsuarioWhereInput[]
    NOT?: UsuarioWhereInput | UsuarioWhereInput[]
    nome?: StringNullableFilter<"Usuario"> | string | null
    tipo?: EnumTipoUsuarioFilter<"Usuario"> | $Enums.TipoUsuario
    bucketRootPath?: StringNullableFilter<"Usuario"> | string | null
    criadoEm?: DateTimeFilter<"Usuario"> | Date | string
    atualizadoEm?: DateTimeFilter<"Usuario"> | Date | string
    notificacoes?: NotificacaoListRelationFilter
    agendamentos?: AgendamentoListRelationFilter
  }, "id" | "email">

  export type UsuarioOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    nome?: SortOrderInput | SortOrder
    tipo?: SortOrder
    bucketRootPath?: SortOrderInput | SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
    _count?: UsuarioCountOrderByAggregateInput
    _max?: UsuarioMaxOrderByAggregateInput
    _min?: UsuarioMinOrderByAggregateInput
  }

  export type UsuarioScalarWhereWithAggregatesInput = {
    AND?: UsuarioScalarWhereWithAggregatesInput | UsuarioScalarWhereWithAggregatesInput[]
    OR?: UsuarioScalarWhereWithAggregatesInput[]
    NOT?: UsuarioScalarWhereWithAggregatesInput | UsuarioScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Usuario"> | string
    email?: StringWithAggregatesFilter<"Usuario"> | string
    nome?: StringNullableWithAggregatesFilter<"Usuario"> | string | null
    tipo?: EnumTipoUsuarioWithAggregatesFilter<"Usuario"> | $Enums.TipoUsuario
    bucketRootPath?: StringNullableWithAggregatesFilter<"Usuario"> | string | null
    criadoEm?: DateTimeWithAggregatesFilter<"Usuario"> | Date | string
    atualizadoEm?: DateTimeWithAggregatesFilter<"Usuario"> | Date | string
  }

  export type NotificacaoWhereInput = {
    AND?: NotificacaoWhereInput | NotificacaoWhereInput[]
    OR?: NotificacaoWhereInput[]
    NOT?: NotificacaoWhereInput | NotificacaoWhereInput[]
    id?: StringFilter<"Notificacao"> | string
    titulo?: StringFilter<"Notificacao"> | string
    mensagem?: StringFilter<"Notificacao"> | string
    lida?: BoolFilter<"Notificacao"> | boolean
    tipo?: StringFilter<"Notificacao"> | string
    dataPrazo?: DateTimeNullableFilter<"Notificacao"> | Date | string | null
    criadoEm?: DateTimeFilter<"Notificacao"> | Date | string
    clienteId?: UuidNullableFilter<"Notificacao"> | string | null
    criadorId?: UuidNullableFilter<"Notificacao"> | string | null
    usuarioId?: UuidNullableFilter<"Notificacao"> | string | null
    usuario?: XOR<UsuarioNullableRelationFilter, UsuarioWhereInput> | null
  }

  export type NotificacaoOrderByWithRelationInput = {
    id?: SortOrder
    titulo?: SortOrder
    mensagem?: SortOrder
    lida?: SortOrder
    tipo?: SortOrder
    dataPrazo?: SortOrderInput | SortOrder
    criadoEm?: SortOrder
    clienteId?: SortOrderInput | SortOrder
    criadorId?: SortOrderInput | SortOrder
    usuarioId?: SortOrderInput | SortOrder
    usuario?: UsuarioOrderByWithRelationInput
  }

  export type NotificacaoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: NotificacaoWhereInput | NotificacaoWhereInput[]
    OR?: NotificacaoWhereInput[]
    NOT?: NotificacaoWhereInput | NotificacaoWhereInput[]
    titulo?: StringFilter<"Notificacao"> | string
    mensagem?: StringFilter<"Notificacao"> | string
    lida?: BoolFilter<"Notificacao"> | boolean
    tipo?: StringFilter<"Notificacao"> | string
    dataPrazo?: DateTimeNullableFilter<"Notificacao"> | Date | string | null
    criadoEm?: DateTimeFilter<"Notificacao"> | Date | string
    clienteId?: UuidNullableFilter<"Notificacao"> | string | null
    criadorId?: UuidNullableFilter<"Notificacao"> | string | null
    usuarioId?: UuidNullableFilter<"Notificacao"> | string | null
    usuario?: XOR<UsuarioNullableRelationFilter, UsuarioWhereInput> | null
  }, "id">

  export type NotificacaoOrderByWithAggregationInput = {
    id?: SortOrder
    titulo?: SortOrder
    mensagem?: SortOrder
    lida?: SortOrder
    tipo?: SortOrder
    dataPrazo?: SortOrderInput | SortOrder
    criadoEm?: SortOrder
    clienteId?: SortOrderInput | SortOrder
    criadorId?: SortOrderInput | SortOrder
    usuarioId?: SortOrderInput | SortOrder
    _count?: NotificacaoCountOrderByAggregateInput
    _max?: NotificacaoMaxOrderByAggregateInput
    _min?: NotificacaoMinOrderByAggregateInput
  }

  export type NotificacaoScalarWhereWithAggregatesInput = {
    AND?: NotificacaoScalarWhereWithAggregatesInput | NotificacaoScalarWhereWithAggregatesInput[]
    OR?: NotificacaoScalarWhereWithAggregatesInput[]
    NOT?: NotificacaoScalarWhereWithAggregatesInput | NotificacaoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Notificacao"> | string
    titulo?: StringWithAggregatesFilter<"Notificacao"> | string
    mensagem?: StringWithAggregatesFilter<"Notificacao"> | string
    lida?: BoolWithAggregatesFilter<"Notificacao"> | boolean
    tipo?: StringWithAggregatesFilter<"Notificacao"> | string
    dataPrazo?: DateTimeNullableWithAggregatesFilter<"Notificacao"> | Date | string | null
    criadoEm?: DateTimeWithAggregatesFilter<"Notificacao"> | Date | string
    clienteId?: UuidNullableWithAggregatesFilter<"Notificacao"> | string | null
    criadorId?: UuidNullableWithAggregatesFilter<"Notificacao"> | string | null
    usuarioId?: UuidNullableWithAggregatesFilter<"Notificacao"> | string | null
  }

  export type ProcessoWhereInput = {
    AND?: ProcessoWhereInput | ProcessoWhereInput[]
    OR?: ProcessoWhereInput[]
    NOT?: ProcessoWhereInput | ProcessoWhereInput[]
    id?: UuidFilter<"Processo"> | string
    documentos?: DocumentoListRelationFilter
  }

  export type ProcessoOrderByWithRelationInput = {
    id?: SortOrder
    documentos?: DocumentoOrderByRelationAggregateInput
  }

  export type ProcessoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ProcessoWhereInput | ProcessoWhereInput[]
    OR?: ProcessoWhereInput[]
    NOT?: ProcessoWhereInput | ProcessoWhereInput[]
    documentos?: DocumentoListRelationFilter
  }, "id">

  export type ProcessoOrderByWithAggregationInput = {
    id?: SortOrder
    _count?: ProcessoCountOrderByAggregateInput
    _max?: ProcessoMaxOrderByAggregateInput
    _min?: ProcessoMinOrderByAggregateInput
  }

  export type ProcessoScalarWhereWithAggregatesInput = {
    AND?: ProcessoScalarWhereWithAggregatesInput | ProcessoScalarWhereWithAggregatesInput[]
    OR?: ProcessoScalarWhereWithAggregatesInput[]
    NOT?: ProcessoScalarWhereWithAggregatesInput | ProcessoScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Processo"> | string
  }

  export type DependenteWhereInput = {
    AND?: DependenteWhereInput | DependenteWhereInput[]
    OR?: DependenteWhereInput[]
    NOT?: DependenteWhereInput | DependenteWhereInput[]
    id?: UuidFilter<"Dependente"> | string
    documentos?: DocumentoListRelationFilter
  }

  export type DependenteOrderByWithRelationInput = {
    id?: SortOrder
    documentos?: DocumentoOrderByRelationAggregateInput
  }

  export type DependenteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DependenteWhereInput | DependenteWhereInput[]
    OR?: DependenteWhereInput[]
    NOT?: DependenteWhereInput | DependenteWhereInput[]
    documentos?: DocumentoListRelationFilter
  }, "id">

  export type DependenteOrderByWithAggregationInput = {
    id?: SortOrder
    _count?: DependenteCountOrderByAggregateInput
    _max?: DependenteMaxOrderByAggregateInput
    _min?: DependenteMinOrderByAggregateInput
  }

  export type DependenteScalarWhereWithAggregatesInput = {
    AND?: DependenteScalarWhereWithAggregatesInput | DependenteScalarWhereWithAggregatesInput[]
    OR?: DependenteScalarWhereWithAggregatesInput[]
    NOT?: DependenteScalarWhereWithAggregatesInput | DependenteScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Dependente"> | string
  }

  export type RequerimentoWhereInput = {
    AND?: RequerimentoWhereInput | RequerimentoWhereInput[]
    OR?: RequerimentoWhereInput[]
    NOT?: RequerimentoWhereInput | RequerimentoWhereInput[]
    id?: UuidFilter<"Requerimento"> | string
    clienteId?: UuidFilter<"Requerimento"> | string
    processoId?: UuidNullableFilter<"Requerimento"> | string | null
    tipo?: StringFilter<"Requerimento"> | string
    status?: StringFilter<"Requerimento"> | string
    observacoes?: StringNullableFilter<"Requerimento"> | string | null
    criadorId?: UuidNullableFilter<"Requerimento"> | string | null
    createdAt?: DateTimeFilter<"Requerimento"> | Date | string
    updated_at?: DateTimeFilter<"Requerimento"> | Date | string
    documentos?: DocumentoListRelationFilter
  }

  export type RequerimentoOrderByWithRelationInput = {
    id?: SortOrder
    clienteId?: SortOrder
    processoId?: SortOrderInput | SortOrder
    tipo?: SortOrder
    status?: SortOrder
    observacoes?: SortOrderInput | SortOrder
    criadorId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updated_at?: SortOrder
    documentos?: DocumentoOrderByRelationAggregateInput
  }

  export type RequerimentoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RequerimentoWhereInput | RequerimentoWhereInput[]
    OR?: RequerimentoWhereInput[]
    NOT?: RequerimentoWhereInput | RequerimentoWhereInput[]
    clienteId?: UuidFilter<"Requerimento"> | string
    processoId?: UuidNullableFilter<"Requerimento"> | string | null
    tipo?: StringFilter<"Requerimento"> | string
    status?: StringFilter<"Requerimento"> | string
    observacoes?: StringNullableFilter<"Requerimento"> | string | null
    criadorId?: UuidNullableFilter<"Requerimento"> | string | null
    createdAt?: DateTimeFilter<"Requerimento"> | Date | string
    updated_at?: DateTimeFilter<"Requerimento"> | Date | string
    documentos?: DocumentoListRelationFilter
  }, "id">

  export type RequerimentoOrderByWithAggregationInput = {
    id?: SortOrder
    clienteId?: SortOrder
    processoId?: SortOrderInput | SortOrder
    tipo?: SortOrder
    status?: SortOrder
    observacoes?: SortOrderInput | SortOrder
    criadorId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updated_at?: SortOrder
    _count?: RequerimentoCountOrderByAggregateInput
    _max?: RequerimentoMaxOrderByAggregateInput
    _min?: RequerimentoMinOrderByAggregateInput
  }

  export type RequerimentoScalarWhereWithAggregatesInput = {
    AND?: RequerimentoScalarWhereWithAggregatesInput | RequerimentoScalarWhereWithAggregatesInput[]
    OR?: RequerimentoScalarWhereWithAggregatesInput[]
    NOT?: RequerimentoScalarWhereWithAggregatesInput | RequerimentoScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Requerimento"> | string
    clienteId?: UuidWithAggregatesFilter<"Requerimento"> | string
    processoId?: UuidNullableWithAggregatesFilter<"Requerimento"> | string | null
    tipo?: StringWithAggregatesFilter<"Requerimento"> | string
    status?: StringWithAggregatesFilter<"Requerimento"> | string
    observacoes?: StringNullableWithAggregatesFilter<"Requerimento"> | string | null
    criadorId?: UuidNullableWithAggregatesFilter<"Requerimento"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Requerimento"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Requerimento"> | Date | string
  }

  export type DocumentoWhereInput = {
    AND?: DocumentoWhereInput | DocumentoWhereInput[]
    OR?: DocumentoWhereInput[]
    NOT?: DocumentoWhereInput | DocumentoWhereInput[]
    id?: UuidFilter<"Documento"> | string
    clienteId?: UuidFilter<"Documento"> | string
    processoId?: UuidNullableFilter<"Documento"> | string | null
    dependenteId?: UuidNullableFilter<"Documento"> | string | null
    requerimentoId?: UuidNullableFilter<"Documento"> | string | null
    tipo?: StringFilter<"Documento"> | string
    nomeOriginal?: StringFilter<"Documento"> | string
    nomeArquivo?: StringFilter<"Documento"> | string
    storagePath?: StringFilter<"Documento"> | string
    publicUrl?: StringNullableFilter<"Documento"> | string | null
    contentType?: StringNullableFilter<"Documento"> | string | null
    tamanho?: IntNullableFilter<"Documento"> | number | null
    status?: EnumStatusDocumentoFilter<"Documento"> | $Enums.StatusDocumento
    apostilado?: BoolFilter<"Documento"> | boolean
    traduzido?: BoolFilter<"Documento"> | boolean
    motivoRejeicao?: StringNullableFilter<"Documento"> | string | null
    analisadoPor?: UuidNullableFilter<"Documento"> | string | null
    analisadoEm?: DateTimeNullableFilter<"Documento"> | Date | string | null
    solicitadoPeloJuridico?: BoolFilter<"Documento"> | boolean
    dataSolicitacaoJuridico?: DateTimeNullableFilter<"Documento"> | Date | string | null
    criadoEm?: DateTimeFilter<"Documento"> | Date | string
    atualizadoEm?: DateTimeFilter<"Documento"> | Date | string
    processo?: XOR<ProcessoNullableRelationFilter, ProcessoWhereInput> | null
    dependente?: XOR<DependenteNullableRelationFilter, DependenteWhereInput> | null
    requerimento?: XOR<RequerimentoNullableRelationFilter, RequerimentoWhereInput> | null
    apostilamento?: XOR<ApostilamentoNullableRelationFilter, ApostilamentoWhereInput> | null
  }

  export type DocumentoOrderByWithRelationInput = {
    id?: SortOrder
    clienteId?: SortOrder
    processoId?: SortOrderInput | SortOrder
    dependenteId?: SortOrderInput | SortOrder
    requerimentoId?: SortOrderInput | SortOrder
    tipo?: SortOrder
    nomeOriginal?: SortOrder
    nomeArquivo?: SortOrder
    storagePath?: SortOrder
    publicUrl?: SortOrderInput | SortOrder
    contentType?: SortOrderInput | SortOrder
    tamanho?: SortOrderInput | SortOrder
    status?: SortOrder
    apostilado?: SortOrder
    traduzido?: SortOrder
    motivoRejeicao?: SortOrderInput | SortOrder
    analisadoPor?: SortOrderInput | SortOrder
    analisadoEm?: SortOrderInput | SortOrder
    solicitadoPeloJuridico?: SortOrder
    dataSolicitacaoJuridico?: SortOrderInput | SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
    processo?: ProcessoOrderByWithRelationInput
    dependente?: DependenteOrderByWithRelationInput
    requerimento?: RequerimentoOrderByWithRelationInput
    apostilamento?: ApostilamentoOrderByWithRelationInput
  }

  export type DocumentoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DocumentoWhereInput | DocumentoWhereInput[]
    OR?: DocumentoWhereInput[]
    NOT?: DocumentoWhereInput | DocumentoWhereInput[]
    clienteId?: UuidFilter<"Documento"> | string
    processoId?: UuidNullableFilter<"Documento"> | string | null
    dependenteId?: UuidNullableFilter<"Documento"> | string | null
    requerimentoId?: UuidNullableFilter<"Documento"> | string | null
    tipo?: StringFilter<"Documento"> | string
    nomeOriginal?: StringFilter<"Documento"> | string
    nomeArquivo?: StringFilter<"Documento"> | string
    storagePath?: StringFilter<"Documento"> | string
    publicUrl?: StringNullableFilter<"Documento"> | string | null
    contentType?: StringNullableFilter<"Documento"> | string | null
    tamanho?: IntNullableFilter<"Documento"> | number | null
    status?: EnumStatusDocumentoFilter<"Documento"> | $Enums.StatusDocumento
    apostilado?: BoolFilter<"Documento"> | boolean
    traduzido?: BoolFilter<"Documento"> | boolean
    motivoRejeicao?: StringNullableFilter<"Documento"> | string | null
    analisadoPor?: UuidNullableFilter<"Documento"> | string | null
    analisadoEm?: DateTimeNullableFilter<"Documento"> | Date | string | null
    solicitadoPeloJuridico?: BoolFilter<"Documento"> | boolean
    dataSolicitacaoJuridico?: DateTimeNullableFilter<"Documento"> | Date | string | null
    criadoEm?: DateTimeFilter<"Documento"> | Date | string
    atualizadoEm?: DateTimeFilter<"Documento"> | Date | string
    processo?: XOR<ProcessoNullableRelationFilter, ProcessoWhereInput> | null
    dependente?: XOR<DependenteNullableRelationFilter, DependenteWhereInput> | null
    requerimento?: XOR<RequerimentoNullableRelationFilter, RequerimentoWhereInput> | null
    apostilamento?: XOR<ApostilamentoNullableRelationFilter, ApostilamentoWhereInput> | null
  }, "id">

  export type DocumentoOrderByWithAggregationInput = {
    id?: SortOrder
    clienteId?: SortOrder
    processoId?: SortOrderInput | SortOrder
    dependenteId?: SortOrderInput | SortOrder
    requerimentoId?: SortOrderInput | SortOrder
    tipo?: SortOrder
    nomeOriginal?: SortOrder
    nomeArquivo?: SortOrder
    storagePath?: SortOrder
    publicUrl?: SortOrderInput | SortOrder
    contentType?: SortOrderInput | SortOrder
    tamanho?: SortOrderInput | SortOrder
    status?: SortOrder
    apostilado?: SortOrder
    traduzido?: SortOrder
    motivoRejeicao?: SortOrderInput | SortOrder
    analisadoPor?: SortOrderInput | SortOrder
    analisadoEm?: SortOrderInput | SortOrder
    solicitadoPeloJuridico?: SortOrder
    dataSolicitacaoJuridico?: SortOrderInput | SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
    _count?: DocumentoCountOrderByAggregateInput
    _avg?: DocumentoAvgOrderByAggregateInput
    _max?: DocumentoMaxOrderByAggregateInput
    _min?: DocumentoMinOrderByAggregateInput
    _sum?: DocumentoSumOrderByAggregateInput
  }

  export type DocumentoScalarWhereWithAggregatesInput = {
    AND?: DocumentoScalarWhereWithAggregatesInput | DocumentoScalarWhereWithAggregatesInput[]
    OR?: DocumentoScalarWhereWithAggregatesInput[]
    NOT?: DocumentoScalarWhereWithAggregatesInput | DocumentoScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Documento"> | string
    clienteId?: UuidWithAggregatesFilter<"Documento"> | string
    processoId?: UuidNullableWithAggregatesFilter<"Documento"> | string | null
    dependenteId?: UuidNullableWithAggregatesFilter<"Documento"> | string | null
    requerimentoId?: UuidNullableWithAggregatesFilter<"Documento"> | string | null
    tipo?: StringWithAggregatesFilter<"Documento"> | string
    nomeOriginal?: StringWithAggregatesFilter<"Documento"> | string
    nomeArquivo?: StringWithAggregatesFilter<"Documento"> | string
    storagePath?: StringWithAggregatesFilter<"Documento"> | string
    publicUrl?: StringNullableWithAggregatesFilter<"Documento"> | string | null
    contentType?: StringNullableWithAggregatesFilter<"Documento"> | string | null
    tamanho?: IntNullableWithAggregatesFilter<"Documento"> | number | null
    status?: EnumStatusDocumentoWithAggregatesFilter<"Documento"> | $Enums.StatusDocumento
    apostilado?: BoolWithAggregatesFilter<"Documento"> | boolean
    traduzido?: BoolWithAggregatesFilter<"Documento"> | boolean
    motivoRejeicao?: StringNullableWithAggregatesFilter<"Documento"> | string | null
    analisadoPor?: UuidNullableWithAggregatesFilter<"Documento"> | string | null
    analisadoEm?: DateTimeNullableWithAggregatesFilter<"Documento"> | Date | string | null
    solicitadoPeloJuridico?: BoolWithAggregatesFilter<"Documento"> | boolean
    dataSolicitacaoJuridico?: DateTimeNullableWithAggregatesFilter<"Documento"> | Date | string | null
    criadoEm?: DateTimeWithAggregatesFilter<"Documento"> | Date | string
    atualizadoEm?: DateTimeWithAggregatesFilter<"Documento"> | Date | string
  }

  export type ConfiguracaoWhereInput = {
    AND?: ConfiguracaoWhereInput | ConfiguracaoWhereInput[]
    OR?: ConfiguracaoWhereInput[]
    NOT?: ConfiguracaoWhereInput | ConfiguracaoWhereInput[]
    chave?: StringFilter<"Configuracao"> | string
    valor?: StringFilter<"Configuracao"> | string
    criadoEm?: DateTimeFilter<"Configuracao"> | Date | string
    atualizadoEm?: DateTimeFilter<"Configuracao"> | Date | string
  }

  export type ConfiguracaoOrderByWithRelationInput = {
    chave?: SortOrder
    valor?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
  }

  export type ConfiguracaoWhereUniqueInput = Prisma.AtLeast<{
    chave?: string
    AND?: ConfiguracaoWhereInput | ConfiguracaoWhereInput[]
    OR?: ConfiguracaoWhereInput[]
    NOT?: ConfiguracaoWhereInput | ConfiguracaoWhereInput[]
    valor?: StringFilter<"Configuracao"> | string
    criadoEm?: DateTimeFilter<"Configuracao"> | Date | string
    atualizadoEm?: DateTimeFilter<"Configuracao"> | Date | string
  }, "chave">

  export type ConfiguracaoOrderByWithAggregationInput = {
    chave?: SortOrder
    valor?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
    _count?: ConfiguracaoCountOrderByAggregateInput
    _max?: ConfiguracaoMaxOrderByAggregateInput
    _min?: ConfiguracaoMinOrderByAggregateInput
  }

  export type ConfiguracaoScalarWhereWithAggregatesInput = {
    AND?: ConfiguracaoScalarWhereWithAggregatesInput | ConfiguracaoScalarWhereWithAggregatesInput[]
    OR?: ConfiguracaoScalarWhereWithAggregatesInput[]
    NOT?: ConfiguracaoScalarWhereWithAggregatesInput | ConfiguracaoScalarWhereWithAggregatesInput[]
    chave?: StringWithAggregatesFilter<"Configuracao"> | string
    valor?: StringWithAggregatesFilter<"Configuracao"> | string
    criadoEm?: DateTimeWithAggregatesFilter<"Configuracao"> | Date | string
    atualizadoEm?: DateTimeWithAggregatesFilter<"Configuracao"> | Date | string
  }

  export type AgendamentoWhereInput = {
    AND?: AgendamentoWhereInput | AgendamentoWhereInput[]
    OR?: AgendamentoWhereInput[]
    NOT?: AgendamentoWhereInput | AgendamentoWhereInput[]
    id?: UuidFilter<"Agendamento"> | string
    nome?: StringFilter<"Agendamento"> | string
    email?: StringFilter<"Agendamento"> | string
    telefone?: StringFilter<"Agendamento"> | string
    dataHora?: DateTimeFilter<"Agendamento"> | Date | string
    produtoId?: StringFilter<"Agendamento"> | string
    duracaoMinutos?: IntFilter<"Agendamento"> | number
    status?: StringFilter<"Agendamento"> | string
    usuarioId?: UuidNullableFilter<"Agendamento"> | string | null
    clienteId?: UuidNullableFilter<"Agendamento"> | string | null
    createdAt?: DateTimeFilter<"Agendamento"> | Date | string
    updatedAt?: DateTimeFilter<"Agendamento"> | Date | string
    usuario?: XOR<UsuarioNullableRelationFilter, UsuarioWhereInput> | null
  }

  export type AgendamentoOrderByWithRelationInput = {
    id?: SortOrder
    nome?: SortOrder
    email?: SortOrder
    telefone?: SortOrder
    dataHora?: SortOrder
    produtoId?: SortOrder
    duracaoMinutos?: SortOrder
    status?: SortOrder
    usuarioId?: SortOrderInput | SortOrder
    clienteId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    usuario?: UsuarioOrderByWithRelationInput
  }

  export type AgendamentoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AgendamentoWhereInput | AgendamentoWhereInput[]
    OR?: AgendamentoWhereInput[]
    NOT?: AgendamentoWhereInput | AgendamentoWhereInput[]
    nome?: StringFilter<"Agendamento"> | string
    email?: StringFilter<"Agendamento"> | string
    telefone?: StringFilter<"Agendamento"> | string
    dataHora?: DateTimeFilter<"Agendamento"> | Date | string
    produtoId?: StringFilter<"Agendamento"> | string
    duracaoMinutos?: IntFilter<"Agendamento"> | number
    status?: StringFilter<"Agendamento"> | string
    usuarioId?: UuidNullableFilter<"Agendamento"> | string | null
    clienteId?: UuidNullableFilter<"Agendamento"> | string | null
    createdAt?: DateTimeFilter<"Agendamento"> | Date | string
    updatedAt?: DateTimeFilter<"Agendamento"> | Date | string
    usuario?: XOR<UsuarioNullableRelationFilter, UsuarioWhereInput> | null
  }, "id">

  export type AgendamentoOrderByWithAggregationInput = {
    id?: SortOrder
    nome?: SortOrder
    email?: SortOrder
    telefone?: SortOrder
    dataHora?: SortOrder
    produtoId?: SortOrder
    duracaoMinutos?: SortOrder
    status?: SortOrder
    usuarioId?: SortOrderInput | SortOrder
    clienteId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AgendamentoCountOrderByAggregateInput
    _avg?: AgendamentoAvgOrderByAggregateInput
    _max?: AgendamentoMaxOrderByAggregateInput
    _min?: AgendamentoMinOrderByAggregateInput
    _sum?: AgendamentoSumOrderByAggregateInput
  }

  export type AgendamentoScalarWhereWithAggregatesInput = {
    AND?: AgendamentoScalarWhereWithAggregatesInput | AgendamentoScalarWhereWithAggregatesInput[]
    OR?: AgendamentoScalarWhereWithAggregatesInput[]
    NOT?: AgendamentoScalarWhereWithAggregatesInput | AgendamentoScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Agendamento"> | string
    nome?: StringWithAggregatesFilter<"Agendamento"> | string
    email?: StringWithAggregatesFilter<"Agendamento"> | string
    telefone?: StringWithAggregatesFilter<"Agendamento"> | string
    dataHora?: DateTimeWithAggregatesFilter<"Agendamento"> | Date | string
    produtoId?: StringWithAggregatesFilter<"Agendamento"> | string
    duracaoMinutos?: IntWithAggregatesFilter<"Agendamento"> | number
    status?: StringWithAggregatesFilter<"Agendamento"> | string
    usuarioId?: UuidNullableWithAggregatesFilter<"Agendamento"> | string | null
    clienteId?: UuidNullableWithAggregatesFilter<"Agendamento"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Agendamento"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Agendamento"> | Date | string
  }

  export type CatalogoServicoWhereInput = {
    AND?: CatalogoServicoWhereInput | CatalogoServicoWhereInput[]
    OR?: CatalogoServicoWhereInput[]
    NOT?: CatalogoServicoWhereInput | CatalogoServicoWhereInput[]
    id?: UuidFilter<"CatalogoServico"> | string
    nome?: StringFilter<"CatalogoServico"> | string
    valor?: DecimalFilter<"CatalogoServico"> | Decimal | DecimalJsLike | number | string
    duracao?: StringNullableFilter<"CatalogoServico"> | string | null
    exibirComercial?: BoolFilter<"CatalogoServico"> | boolean
    createdAt?: DateTimeFilter<"CatalogoServico"> | Date | string
    updatedAt?: DateTimeFilter<"CatalogoServico"> | Date | string
    requisitos?: ServicoRequisitoListRelationFilter
  }

  export type CatalogoServicoOrderByWithRelationInput = {
    id?: SortOrder
    nome?: SortOrder
    valor?: SortOrder
    duracao?: SortOrderInput | SortOrder
    exibirComercial?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    requisitos?: ServicoRequisitoOrderByRelationAggregateInput
  }

  export type CatalogoServicoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: CatalogoServicoWhereInput | CatalogoServicoWhereInput[]
    OR?: CatalogoServicoWhereInput[]
    NOT?: CatalogoServicoWhereInput | CatalogoServicoWhereInput[]
    nome?: StringFilter<"CatalogoServico"> | string
    valor?: DecimalFilter<"CatalogoServico"> | Decimal | DecimalJsLike | number | string
    duracao?: StringNullableFilter<"CatalogoServico"> | string | null
    exibirComercial?: BoolFilter<"CatalogoServico"> | boolean
    createdAt?: DateTimeFilter<"CatalogoServico"> | Date | string
    updatedAt?: DateTimeFilter<"CatalogoServico"> | Date | string
    requisitos?: ServicoRequisitoListRelationFilter
  }, "id">

  export type CatalogoServicoOrderByWithAggregationInput = {
    id?: SortOrder
    nome?: SortOrder
    valor?: SortOrder
    duracao?: SortOrderInput | SortOrder
    exibirComercial?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: CatalogoServicoCountOrderByAggregateInput
    _avg?: CatalogoServicoAvgOrderByAggregateInput
    _max?: CatalogoServicoMaxOrderByAggregateInput
    _min?: CatalogoServicoMinOrderByAggregateInput
    _sum?: CatalogoServicoSumOrderByAggregateInput
  }

  export type CatalogoServicoScalarWhereWithAggregatesInput = {
    AND?: CatalogoServicoScalarWhereWithAggregatesInput | CatalogoServicoScalarWhereWithAggregatesInput[]
    OR?: CatalogoServicoScalarWhereWithAggregatesInput[]
    NOT?: CatalogoServicoScalarWhereWithAggregatesInput | CatalogoServicoScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"CatalogoServico"> | string
    nome?: StringWithAggregatesFilter<"CatalogoServico"> | string
    valor?: DecimalWithAggregatesFilter<"CatalogoServico"> | Decimal | DecimalJsLike | number | string
    duracao?: StringNullableWithAggregatesFilter<"CatalogoServico"> | string | null
    exibirComercial?: BoolWithAggregatesFilter<"CatalogoServico"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"CatalogoServico"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"CatalogoServico"> | Date | string
  }

  export type ServicoRequisitoWhereInput = {
    AND?: ServicoRequisitoWhereInput | ServicoRequisitoWhereInput[]
    OR?: ServicoRequisitoWhereInput[]
    NOT?: ServicoRequisitoWhereInput | ServicoRequisitoWhereInput[]
    id?: UuidFilter<"ServicoRequisito"> | string
    servicoId?: UuidFilter<"ServicoRequisito"> | string
    nome?: StringFilter<"ServicoRequisito"> | string
    etapa?: StringFilter<"ServicoRequisito"> | string
    obrigatorio?: BoolFilter<"ServicoRequisito"> | boolean
    createdAt?: DateTimeFilter<"ServicoRequisito"> | Date | string
    updatedAt?: DateTimeFilter<"ServicoRequisito"> | Date | string
    servico?: XOR<CatalogoServicoRelationFilter, CatalogoServicoWhereInput>
  }

  export type ServicoRequisitoOrderByWithRelationInput = {
    id?: SortOrder
    servicoId?: SortOrder
    nome?: SortOrder
    etapa?: SortOrder
    obrigatorio?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    servico?: CatalogoServicoOrderByWithRelationInput
  }

  export type ServicoRequisitoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ServicoRequisitoWhereInput | ServicoRequisitoWhereInput[]
    OR?: ServicoRequisitoWhereInput[]
    NOT?: ServicoRequisitoWhereInput | ServicoRequisitoWhereInput[]
    servicoId?: UuidFilter<"ServicoRequisito"> | string
    nome?: StringFilter<"ServicoRequisito"> | string
    etapa?: StringFilter<"ServicoRequisito"> | string
    obrigatorio?: BoolFilter<"ServicoRequisito"> | boolean
    createdAt?: DateTimeFilter<"ServicoRequisito"> | Date | string
    updatedAt?: DateTimeFilter<"ServicoRequisito"> | Date | string
    servico?: XOR<CatalogoServicoRelationFilter, CatalogoServicoWhereInput>
  }, "id">

  export type ServicoRequisitoOrderByWithAggregationInput = {
    id?: SortOrder
    servicoId?: SortOrder
    nome?: SortOrder
    etapa?: SortOrder
    obrigatorio?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ServicoRequisitoCountOrderByAggregateInput
    _max?: ServicoRequisitoMaxOrderByAggregateInput
    _min?: ServicoRequisitoMinOrderByAggregateInput
  }

  export type ServicoRequisitoScalarWhereWithAggregatesInput = {
    AND?: ServicoRequisitoScalarWhereWithAggregatesInput | ServicoRequisitoScalarWhereWithAggregatesInput[]
    OR?: ServicoRequisitoScalarWhereWithAggregatesInput[]
    NOT?: ServicoRequisitoScalarWhereWithAggregatesInput | ServicoRequisitoScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"ServicoRequisito"> | string
    servicoId?: UuidWithAggregatesFilter<"ServicoRequisito"> | string
    nome?: StringWithAggregatesFilter<"ServicoRequisito"> | string
    etapa?: StringWithAggregatesFilter<"ServicoRequisito"> | string
    obrigatorio?: BoolWithAggregatesFilter<"ServicoRequisito"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"ServicoRequisito"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ServicoRequisito"> | Date | string
  }

  export type AssessoriaJuridicaWhereInput = {
    AND?: AssessoriaJuridicaWhereInput | AssessoriaJuridicaWhereInput[]
    OR?: AssessoriaJuridicaWhereInput[]
    NOT?: AssessoriaJuridicaWhereInput | AssessoriaJuridicaWhereInput[]
    id?: UuidFilter<"AssessoriaJuridica"> | string
    clienteId?: UuidFilter<"AssessoriaJuridica"> | string
    responsavelId?: UuidFilter<"AssessoriaJuridica"> | string
    servicoId?: UuidNullableFilter<"AssessoriaJuridica"> | string | null
    respostas?: JsonFilter<"AssessoriaJuridica">
    observacoes?: StringNullableFilter<"AssessoriaJuridica"> | string | null
    criadoEm?: DateTimeFilter<"AssessoriaJuridica"> | Date | string
  }

  export type AssessoriaJuridicaOrderByWithRelationInput = {
    id?: SortOrder
    clienteId?: SortOrder
    responsavelId?: SortOrder
    servicoId?: SortOrderInput | SortOrder
    respostas?: SortOrder
    observacoes?: SortOrderInput | SortOrder
    criadoEm?: SortOrder
  }

  export type AssessoriaJuridicaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AssessoriaJuridicaWhereInput | AssessoriaJuridicaWhereInput[]
    OR?: AssessoriaJuridicaWhereInput[]
    NOT?: AssessoriaJuridicaWhereInput | AssessoriaJuridicaWhereInput[]
    clienteId?: UuidFilter<"AssessoriaJuridica"> | string
    responsavelId?: UuidFilter<"AssessoriaJuridica"> | string
    servicoId?: UuidNullableFilter<"AssessoriaJuridica"> | string | null
    respostas?: JsonFilter<"AssessoriaJuridica">
    observacoes?: StringNullableFilter<"AssessoriaJuridica"> | string | null
    criadoEm?: DateTimeFilter<"AssessoriaJuridica"> | Date | string
  }, "id">

  export type AssessoriaJuridicaOrderByWithAggregationInput = {
    id?: SortOrder
    clienteId?: SortOrder
    responsavelId?: SortOrder
    servicoId?: SortOrderInput | SortOrder
    respostas?: SortOrder
    observacoes?: SortOrderInput | SortOrder
    criadoEm?: SortOrder
    _count?: AssessoriaJuridicaCountOrderByAggregateInput
    _max?: AssessoriaJuridicaMaxOrderByAggregateInput
    _min?: AssessoriaJuridicaMinOrderByAggregateInput
  }

  export type AssessoriaJuridicaScalarWhereWithAggregatesInput = {
    AND?: AssessoriaJuridicaScalarWhereWithAggregatesInput | AssessoriaJuridicaScalarWhereWithAggregatesInput[]
    OR?: AssessoriaJuridicaScalarWhereWithAggregatesInput[]
    NOT?: AssessoriaJuridicaScalarWhereWithAggregatesInput | AssessoriaJuridicaScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"AssessoriaJuridica"> | string
    clienteId?: UuidWithAggregatesFilter<"AssessoriaJuridica"> | string
    responsavelId?: UuidWithAggregatesFilter<"AssessoriaJuridica"> | string
    servicoId?: UuidNullableWithAggregatesFilter<"AssessoriaJuridica"> | string | null
    respostas?: JsonWithAggregatesFilter<"AssessoriaJuridica">
    observacoes?: StringNullableWithAggregatesFilter<"AssessoriaJuridica"> | string | null
    criadoEm?: DateTimeWithAggregatesFilter<"AssessoriaJuridica"> | Date | string
  }

  export type ApostilamentoWhereInput = {
    AND?: ApostilamentoWhereInput | ApostilamentoWhereInput[]
    OR?: ApostilamentoWhereInput[]
    NOT?: ApostilamentoWhereInput | ApostilamentoWhereInput[]
    id?: UuidFilter<"Apostilamento"> | string
    documentoId?: UuidFilter<"Apostilamento"> | string
    status?: StringFilter<"Apostilamento"> | string
    observacoes?: StringNullableFilter<"Apostilamento"> | string | null
    solicitadoEm?: DateTimeFilter<"Apostilamento"> | Date | string
    concluidoEm?: DateTimeNullableFilter<"Apostilamento"> | Date | string | null
    documento?: XOR<DocumentoRelationFilter, DocumentoWhereInput>
  }

  export type ApostilamentoOrderByWithRelationInput = {
    id?: SortOrder
    documentoId?: SortOrder
    status?: SortOrder
    observacoes?: SortOrderInput | SortOrder
    solicitadoEm?: SortOrder
    concluidoEm?: SortOrderInput | SortOrder
    documento?: DocumentoOrderByWithRelationInput
  }

  export type ApostilamentoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    documentoId?: string
    AND?: ApostilamentoWhereInput | ApostilamentoWhereInput[]
    OR?: ApostilamentoWhereInput[]
    NOT?: ApostilamentoWhereInput | ApostilamentoWhereInput[]
    status?: StringFilter<"Apostilamento"> | string
    observacoes?: StringNullableFilter<"Apostilamento"> | string | null
    solicitadoEm?: DateTimeFilter<"Apostilamento"> | Date | string
    concluidoEm?: DateTimeNullableFilter<"Apostilamento"> | Date | string | null
    documento?: XOR<DocumentoRelationFilter, DocumentoWhereInput>
  }, "id" | "documentoId">

  export type ApostilamentoOrderByWithAggregationInput = {
    id?: SortOrder
    documentoId?: SortOrder
    status?: SortOrder
    observacoes?: SortOrderInput | SortOrder
    solicitadoEm?: SortOrder
    concluidoEm?: SortOrderInput | SortOrder
    _count?: ApostilamentoCountOrderByAggregateInput
    _max?: ApostilamentoMaxOrderByAggregateInput
    _min?: ApostilamentoMinOrderByAggregateInput
  }

  export type ApostilamentoScalarWhereWithAggregatesInput = {
    AND?: ApostilamentoScalarWhereWithAggregatesInput | ApostilamentoScalarWhereWithAggregatesInput[]
    OR?: ApostilamentoScalarWhereWithAggregatesInput[]
    NOT?: ApostilamentoScalarWhereWithAggregatesInput | ApostilamentoScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Apostilamento"> | string
    documentoId?: UuidWithAggregatesFilter<"Apostilamento"> | string
    status?: StringWithAggregatesFilter<"Apostilamento"> | string
    observacoes?: StringNullableWithAggregatesFilter<"Apostilamento"> | string | null
    solicitadoEm?: DateTimeWithAggregatesFilter<"Apostilamento"> | Date | string
    concluidoEm?: DateTimeNullableWithAggregatesFilter<"Apostilamento"> | Date | string | null
  }

  export type UsuarioCreateInput = {
    id: string
    email: string
    nome?: string | null
    tipo?: $Enums.TipoUsuario
    bucketRootPath?: string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    notificacoes?: NotificacaoCreateNestedManyWithoutUsuarioInput
    agendamentos?: AgendamentoCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateInput = {
    id: string
    email: string
    nome?: string | null
    tipo?: $Enums.TipoUsuario
    bucketRootPath?: string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    notificacoes?: NotificacaoUncheckedCreateNestedManyWithoutUsuarioInput
    agendamentos?: AgendamentoUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: EnumTipoUsuarioFieldUpdateOperationsInput | $Enums.TipoUsuario
    bucketRootPath?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    notificacoes?: NotificacaoUpdateManyWithoutUsuarioNestedInput
    agendamentos?: AgendamentoUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: EnumTipoUsuarioFieldUpdateOperationsInput | $Enums.TipoUsuario
    bucketRootPath?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    notificacoes?: NotificacaoUncheckedUpdateManyWithoutUsuarioNestedInput
    agendamentos?: AgendamentoUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioCreateManyInput = {
    id: string
    email: string
    nome?: string | null
    tipo?: $Enums.TipoUsuario
    bucketRootPath?: string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
  }

  export type UsuarioUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: EnumTipoUsuarioFieldUpdateOperationsInput | $Enums.TipoUsuario
    bucketRootPath?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UsuarioUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: EnumTipoUsuarioFieldUpdateOperationsInput | $Enums.TipoUsuario
    bucketRootPath?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificacaoCreateInput = {
    id?: string
    titulo: string
    mensagem: string
    lida?: boolean
    tipo?: string
    dataPrazo?: Date | string | null
    criadoEm?: Date | string
    clienteId?: string | null
    criadorId?: string | null
    usuario?: UsuarioCreateNestedOneWithoutNotificacoesInput
  }

  export type NotificacaoUncheckedCreateInput = {
    id?: string
    titulo: string
    mensagem: string
    lida?: boolean
    tipo?: string
    dataPrazo?: Date | string | null
    criadoEm?: Date | string
    clienteId?: string | null
    criadorId?: string | null
    usuarioId?: string | null
  }

  export type NotificacaoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    mensagem?: StringFieldUpdateOperationsInput | string
    lida?: BoolFieldUpdateOperationsInput | boolean
    tipo?: StringFieldUpdateOperationsInput | string
    dataPrazo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: NullableStringFieldUpdateOperationsInput | string | null
    criadorId?: NullableStringFieldUpdateOperationsInput | string | null
    usuario?: UsuarioUpdateOneWithoutNotificacoesNestedInput
  }

  export type NotificacaoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    mensagem?: StringFieldUpdateOperationsInput | string
    lida?: BoolFieldUpdateOperationsInput | boolean
    tipo?: StringFieldUpdateOperationsInput | string
    dataPrazo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: NullableStringFieldUpdateOperationsInput | string | null
    criadorId?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type NotificacaoCreateManyInput = {
    id?: string
    titulo: string
    mensagem: string
    lida?: boolean
    tipo?: string
    dataPrazo?: Date | string | null
    criadoEm?: Date | string
    clienteId?: string | null
    criadorId?: string | null
    usuarioId?: string | null
  }

  export type NotificacaoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    mensagem?: StringFieldUpdateOperationsInput | string
    lida?: BoolFieldUpdateOperationsInput | boolean
    tipo?: StringFieldUpdateOperationsInput | string
    dataPrazo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: NullableStringFieldUpdateOperationsInput | string | null
    criadorId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type NotificacaoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    mensagem?: StringFieldUpdateOperationsInput | string
    lida?: BoolFieldUpdateOperationsInput | boolean
    tipo?: StringFieldUpdateOperationsInput | string
    dataPrazo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: NullableStringFieldUpdateOperationsInput | string | null
    criadorId?: NullableStringFieldUpdateOperationsInput | string | null
    usuarioId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ProcessoCreateInput = {
    id?: string
    documentos?: DocumentoCreateNestedManyWithoutProcessoInput
  }

  export type ProcessoUncheckedCreateInput = {
    id?: string
    documentos?: DocumentoUncheckedCreateNestedManyWithoutProcessoInput
  }

  export type ProcessoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentos?: DocumentoUpdateManyWithoutProcessoNestedInput
  }

  export type ProcessoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentos?: DocumentoUncheckedUpdateManyWithoutProcessoNestedInput
  }

  export type ProcessoCreateManyInput = {
    id?: string
  }

  export type ProcessoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
  }

  export type ProcessoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
  }

  export type DependenteCreateInput = {
    id?: string
    documentos?: DocumentoCreateNestedManyWithoutDependenteInput
  }

  export type DependenteUncheckedCreateInput = {
    id?: string
    documentos?: DocumentoUncheckedCreateNestedManyWithoutDependenteInput
  }

  export type DependenteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentos?: DocumentoUpdateManyWithoutDependenteNestedInput
  }

  export type DependenteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentos?: DocumentoUncheckedUpdateManyWithoutDependenteNestedInput
  }

  export type DependenteCreateManyInput = {
    id?: string
  }

  export type DependenteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
  }

  export type DependenteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
  }

  export type RequerimentoCreateInput = {
    id?: string
    clienteId: string
    processoId?: string | null
    tipo: string
    status?: string
    observacoes?: string | null
    criadorId?: string | null
    createdAt?: Date | string
    updated_at?: Date | string
    documentos?: DocumentoCreateNestedManyWithoutRequerimentoInput
  }

  export type RequerimentoUncheckedCreateInput = {
    id?: string
    clienteId: string
    processoId?: string | null
    tipo: string
    status?: string
    observacoes?: string | null
    criadorId?: string | null
    createdAt?: Date | string
    updated_at?: Date | string
    documentos?: DocumentoUncheckedCreateNestedManyWithoutRequerimentoInput
  }

  export type RequerimentoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    processoId?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadorId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    documentos?: DocumentoUpdateManyWithoutRequerimentoNestedInput
  }

  export type RequerimentoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    processoId?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadorId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    documentos?: DocumentoUncheckedUpdateManyWithoutRequerimentoNestedInput
  }

  export type RequerimentoCreateManyInput = {
    id?: string
    clienteId: string
    processoId?: string | null
    tipo: string
    status?: string
    observacoes?: string | null
    criadorId?: string | null
    createdAt?: Date | string
    updated_at?: Date | string
  }

  export type RequerimentoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    processoId?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadorId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequerimentoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    processoId?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadorId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentoCreateInput = {
    id?: string
    clienteId: string
    tipo: string
    nomeOriginal: string
    nomeArquivo: string
    storagePath: string
    publicUrl?: string | null
    contentType?: string | null
    tamanho?: number | null
    status?: $Enums.StatusDocumento
    apostilado?: boolean
    traduzido?: boolean
    motivoRejeicao?: string | null
    analisadoPor?: string | null
    analisadoEm?: Date | string | null
    solicitadoPeloJuridico?: boolean
    dataSolicitacaoJuridico?: Date | string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    processo?: ProcessoCreateNestedOneWithoutDocumentosInput
    dependente?: DependenteCreateNestedOneWithoutDocumentosInput
    requerimento?: RequerimentoCreateNestedOneWithoutDocumentosInput
    apostilamento?: ApostilamentoCreateNestedOneWithoutDocumentoInput
  }

  export type DocumentoUncheckedCreateInput = {
    id?: string
    clienteId: string
    processoId?: string | null
    dependenteId?: string | null
    requerimentoId?: string | null
    tipo: string
    nomeOriginal: string
    nomeArquivo: string
    storagePath: string
    publicUrl?: string | null
    contentType?: string | null
    tamanho?: number | null
    status?: $Enums.StatusDocumento
    apostilado?: boolean
    traduzido?: boolean
    motivoRejeicao?: string | null
    analisadoPor?: string | null
    analisadoEm?: Date | string | null
    solicitadoPeloJuridico?: boolean
    dataSolicitacaoJuridico?: Date | string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    apostilamento?: ApostilamentoUncheckedCreateNestedOneWithoutDocumentoInput
  }

  export type DocumentoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    nomeOriginal?: StringFieldUpdateOperationsInput | string
    nomeArquivo?: StringFieldUpdateOperationsInput | string
    storagePath?: StringFieldUpdateOperationsInput | string
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    contentType?: NullableStringFieldUpdateOperationsInput | string | null
    tamanho?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumStatusDocumentoFieldUpdateOperationsInput | $Enums.StatusDocumento
    apostilado?: BoolFieldUpdateOperationsInput | boolean
    traduzido?: BoolFieldUpdateOperationsInput | boolean
    motivoRejeicao?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoEm?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    solicitadoPeloJuridico?: BoolFieldUpdateOperationsInput | boolean
    dataSolicitacaoJuridico?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    processo?: ProcessoUpdateOneWithoutDocumentosNestedInput
    dependente?: DependenteUpdateOneWithoutDocumentosNestedInput
    requerimento?: RequerimentoUpdateOneWithoutDocumentosNestedInput
    apostilamento?: ApostilamentoUpdateOneWithoutDocumentoNestedInput
  }

  export type DocumentoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    processoId?: NullableStringFieldUpdateOperationsInput | string | null
    dependenteId?: NullableStringFieldUpdateOperationsInput | string | null
    requerimentoId?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    nomeOriginal?: StringFieldUpdateOperationsInput | string
    nomeArquivo?: StringFieldUpdateOperationsInput | string
    storagePath?: StringFieldUpdateOperationsInput | string
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    contentType?: NullableStringFieldUpdateOperationsInput | string | null
    tamanho?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumStatusDocumentoFieldUpdateOperationsInput | $Enums.StatusDocumento
    apostilado?: BoolFieldUpdateOperationsInput | boolean
    traduzido?: BoolFieldUpdateOperationsInput | boolean
    motivoRejeicao?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoEm?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    solicitadoPeloJuridico?: BoolFieldUpdateOperationsInput | boolean
    dataSolicitacaoJuridico?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    apostilamento?: ApostilamentoUncheckedUpdateOneWithoutDocumentoNestedInput
  }

  export type DocumentoCreateManyInput = {
    id?: string
    clienteId: string
    processoId?: string | null
    dependenteId?: string | null
    requerimentoId?: string | null
    tipo: string
    nomeOriginal: string
    nomeArquivo: string
    storagePath: string
    publicUrl?: string | null
    contentType?: string | null
    tamanho?: number | null
    status?: $Enums.StatusDocumento
    apostilado?: boolean
    traduzido?: boolean
    motivoRejeicao?: string | null
    analisadoPor?: string | null
    analisadoEm?: Date | string | null
    solicitadoPeloJuridico?: boolean
    dataSolicitacaoJuridico?: Date | string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
  }

  export type DocumentoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    nomeOriginal?: StringFieldUpdateOperationsInput | string
    nomeArquivo?: StringFieldUpdateOperationsInput | string
    storagePath?: StringFieldUpdateOperationsInput | string
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    contentType?: NullableStringFieldUpdateOperationsInput | string | null
    tamanho?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumStatusDocumentoFieldUpdateOperationsInput | $Enums.StatusDocumento
    apostilado?: BoolFieldUpdateOperationsInput | boolean
    traduzido?: BoolFieldUpdateOperationsInput | boolean
    motivoRejeicao?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoEm?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    solicitadoPeloJuridico?: BoolFieldUpdateOperationsInput | boolean
    dataSolicitacaoJuridico?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    processoId?: NullableStringFieldUpdateOperationsInput | string | null
    dependenteId?: NullableStringFieldUpdateOperationsInput | string | null
    requerimentoId?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    nomeOriginal?: StringFieldUpdateOperationsInput | string
    nomeArquivo?: StringFieldUpdateOperationsInput | string
    storagePath?: StringFieldUpdateOperationsInput | string
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    contentType?: NullableStringFieldUpdateOperationsInput | string | null
    tamanho?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumStatusDocumentoFieldUpdateOperationsInput | $Enums.StatusDocumento
    apostilado?: BoolFieldUpdateOperationsInput | boolean
    traduzido?: BoolFieldUpdateOperationsInput | boolean
    motivoRejeicao?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoEm?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    solicitadoPeloJuridico?: BoolFieldUpdateOperationsInput | boolean
    dataSolicitacaoJuridico?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfiguracaoCreateInput = {
    chave: string
    valor: string
    criadoEm?: Date | string
    atualizadoEm?: Date | string
  }

  export type ConfiguracaoUncheckedCreateInput = {
    chave: string
    valor: string
    criadoEm?: Date | string
    atualizadoEm?: Date | string
  }

  export type ConfiguracaoUpdateInput = {
    chave?: StringFieldUpdateOperationsInput | string
    valor?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfiguracaoUncheckedUpdateInput = {
    chave?: StringFieldUpdateOperationsInput | string
    valor?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfiguracaoCreateManyInput = {
    chave: string
    valor: string
    criadoEm?: Date | string
    atualizadoEm?: Date | string
  }

  export type ConfiguracaoUpdateManyMutationInput = {
    chave?: StringFieldUpdateOperationsInput | string
    valor?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConfiguracaoUncheckedUpdateManyInput = {
    chave?: StringFieldUpdateOperationsInput | string
    valor?: StringFieldUpdateOperationsInput | string
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgendamentoCreateInput = {
    id?: string
    nome: string
    email: string
    telefone: string
    dataHora: Date | string
    produtoId: string
    duracaoMinutos?: number
    status?: string
    clienteId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    usuario?: UsuarioCreateNestedOneWithoutAgendamentosInput
  }

  export type AgendamentoUncheckedCreateInput = {
    id?: string
    nome: string
    email: string
    telefone: string
    dataHora: Date | string
    produtoId: string
    duracaoMinutos?: number
    status?: string
    usuarioId?: string | null
    clienteId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AgendamentoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefone?: StringFieldUpdateOperationsInput | string
    dataHora?: DateTimeFieldUpdateOperationsInput | Date | string
    produtoId?: StringFieldUpdateOperationsInput | string
    duracaoMinutos?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    clienteId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    usuario?: UsuarioUpdateOneWithoutAgendamentosNestedInput
  }

  export type AgendamentoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefone?: StringFieldUpdateOperationsInput | string
    dataHora?: DateTimeFieldUpdateOperationsInput | Date | string
    produtoId?: StringFieldUpdateOperationsInput | string
    duracaoMinutos?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    usuarioId?: NullableStringFieldUpdateOperationsInput | string | null
    clienteId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgendamentoCreateManyInput = {
    id?: string
    nome: string
    email: string
    telefone: string
    dataHora: Date | string
    produtoId: string
    duracaoMinutos?: number
    status?: string
    usuarioId?: string | null
    clienteId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AgendamentoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefone?: StringFieldUpdateOperationsInput | string
    dataHora?: DateTimeFieldUpdateOperationsInput | Date | string
    produtoId?: StringFieldUpdateOperationsInput | string
    duracaoMinutos?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    clienteId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgendamentoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefone?: StringFieldUpdateOperationsInput | string
    dataHora?: DateTimeFieldUpdateOperationsInput | Date | string
    produtoId?: StringFieldUpdateOperationsInput | string
    duracaoMinutos?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    usuarioId?: NullableStringFieldUpdateOperationsInput | string | null
    clienteId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CatalogoServicoCreateInput = {
    id?: string
    nome: string
    valor?: Decimal | DecimalJsLike | number | string
    duracao?: string | null
    exibirComercial?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    requisitos?: ServicoRequisitoCreateNestedManyWithoutServicoInput
  }

  export type CatalogoServicoUncheckedCreateInput = {
    id?: string
    nome: string
    valor?: Decimal | DecimalJsLike | number | string
    duracao?: string | null
    exibirComercial?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    requisitos?: ServicoRequisitoUncheckedCreateNestedManyWithoutServicoInput
  }

  export type CatalogoServicoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    valor?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    duracao?: NullableStringFieldUpdateOperationsInput | string | null
    exibirComercial?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    requisitos?: ServicoRequisitoUpdateManyWithoutServicoNestedInput
  }

  export type CatalogoServicoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    valor?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    duracao?: NullableStringFieldUpdateOperationsInput | string | null
    exibirComercial?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    requisitos?: ServicoRequisitoUncheckedUpdateManyWithoutServicoNestedInput
  }

  export type CatalogoServicoCreateManyInput = {
    id?: string
    nome: string
    valor?: Decimal | DecimalJsLike | number | string
    duracao?: string | null
    exibirComercial?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CatalogoServicoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    valor?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    duracao?: NullableStringFieldUpdateOperationsInput | string | null
    exibirComercial?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CatalogoServicoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    valor?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    duracao?: NullableStringFieldUpdateOperationsInput | string | null
    exibirComercial?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServicoRequisitoCreateInput = {
    id?: string
    nome: string
    etapa: string
    obrigatorio?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    servico: CatalogoServicoCreateNestedOneWithoutRequisitosInput
  }

  export type ServicoRequisitoUncheckedCreateInput = {
    id?: string
    servicoId: string
    nome: string
    etapa: string
    obrigatorio?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ServicoRequisitoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    etapa?: StringFieldUpdateOperationsInput | string
    obrigatorio?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    servico?: CatalogoServicoUpdateOneRequiredWithoutRequisitosNestedInput
  }

  export type ServicoRequisitoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    servicoId?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    etapa?: StringFieldUpdateOperationsInput | string
    obrigatorio?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServicoRequisitoCreateManyInput = {
    id?: string
    servicoId: string
    nome: string
    etapa: string
    obrigatorio?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ServicoRequisitoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    etapa?: StringFieldUpdateOperationsInput | string
    obrigatorio?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServicoRequisitoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    servicoId?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    etapa?: StringFieldUpdateOperationsInput | string
    obrigatorio?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssessoriaJuridicaCreateInput = {
    id?: string
    clienteId: string
    responsavelId: string
    servicoId?: string | null
    respostas: JsonNullValueInput | InputJsonValue
    observacoes?: string | null
    criadoEm?: Date | string
  }

  export type AssessoriaJuridicaUncheckedCreateInput = {
    id?: string
    clienteId: string
    responsavelId: string
    servicoId?: string | null
    respostas: JsonNullValueInput | InputJsonValue
    observacoes?: string | null
    criadoEm?: Date | string
  }

  export type AssessoriaJuridicaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    responsavelId?: StringFieldUpdateOperationsInput | string
    servicoId?: NullableStringFieldUpdateOperationsInput | string | null
    respostas?: JsonNullValueInput | InputJsonValue
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssessoriaJuridicaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    responsavelId?: StringFieldUpdateOperationsInput | string
    servicoId?: NullableStringFieldUpdateOperationsInput | string | null
    respostas?: JsonNullValueInput | InputJsonValue
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssessoriaJuridicaCreateManyInput = {
    id?: string
    clienteId: string
    responsavelId: string
    servicoId?: string | null
    respostas: JsonNullValueInput | InputJsonValue
    observacoes?: string | null
    criadoEm?: Date | string
  }

  export type AssessoriaJuridicaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    responsavelId?: StringFieldUpdateOperationsInput | string
    servicoId?: NullableStringFieldUpdateOperationsInput | string | null
    respostas?: JsonNullValueInput | InputJsonValue
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AssessoriaJuridicaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    responsavelId?: StringFieldUpdateOperationsInput | string
    servicoId?: NullableStringFieldUpdateOperationsInput | string | null
    respostas?: JsonNullValueInput | InputJsonValue
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApostilamentoCreateInput = {
    id?: string
    status?: string
    observacoes?: string | null
    solicitadoEm?: Date | string
    concluidoEm?: Date | string | null
    documento: DocumentoCreateNestedOneWithoutApostilamentoInput
  }

  export type ApostilamentoUncheckedCreateInput = {
    id?: string
    documentoId: string
    status?: string
    observacoes?: string | null
    solicitadoEm?: Date | string
    concluidoEm?: Date | string | null
  }

  export type ApostilamentoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    solicitadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    concluidoEm?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    documento?: DocumentoUpdateOneRequiredWithoutApostilamentoNestedInput
  }

  export type ApostilamentoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentoId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    solicitadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    concluidoEm?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ApostilamentoCreateManyInput = {
    id?: string
    documentoId: string
    status?: string
    observacoes?: string | null
    solicitadoEm?: Date | string
    concluidoEm?: Date | string | null
  }

  export type ApostilamentoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    solicitadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    concluidoEm?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ApostilamentoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    documentoId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    solicitadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    concluidoEm?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type EnumTipoUsuarioFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoUsuario | EnumTipoUsuarioFieldRefInput<$PrismaModel>
    in?: $Enums.TipoUsuario[] | ListEnumTipoUsuarioFieldRefInput<$PrismaModel>
    notIn?: $Enums.TipoUsuario[] | ListEnumTipoUsuarioFieldRefInput<$PrismaModel>
    not?: NestedEnumTipoUsuarioFilter<$PrismaModel> | $Enums.TipoUsuario
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NotificacaoListRelationFilter = {
    every?: NotificacaoWhereInput
    some?: NotificacaoWhereInput
    none?: NotificacaoWhereInput
  }

  export type AgendamentoListRelationFilter = {
    every?: AgendamentoWhereInput
    some?: AgendamentoWhereInput
    none?: AgendamentoWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type NotificacaoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type AgendamentoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UsuarioCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    nome?: SortOrder
    tipo?: SortOrder
    bucketRootPath?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
  }

  export type UsuarioMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    nome?: SortOrder
    tipo?: SortOrder
    bucketRootPath?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
  }

  export type UsuarioMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    nome?: SortOrder
    tipo?: SortOrder
    bucketRootPath?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumTipoUsuarioWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoUsuario | EnumTipoUsuarioFieldRefInput<$PrismaModel>
    in?: $Enums.TipoUsuario[] | ListEnumTipoUsuarioFieldRefInput<$PrismaModel>
    notIn?: $Enums.TipoUsuario[] | ListEnumTipoUsuarioFieldRefInput<$PrismaModel>
    not?: NestedEnumTipoUsuarioWithAggregatesFilter<$PrismaModel> | $Enums.TipoUsuario
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTipoUsuarioFilter<$PrismaModel>
    _max?: NestedEnumTipoUsuarioFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type UuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type UsuarioNullableRelationFilter = {
    is?: UsuarioWhereInput | null
    isNot?: UsuarioWhereInput | null
  }

  export type NotificacaoCountOrderByAggregateInput = {
    id?: SortOrder
    titulo?: SortOrder
    mensagem?: SortOrder
    lida?: SortOrder
    tipo?: SortOrder
    dataPrazo?: SortOrder
    criadoEm?: SortOrder
    clienteId?: SortOrder
    criadorId?: SortOrder
    usuarioId?: SortOrder
  }

  export type NotificacaoMaxOrderByAggregateInput = {
    id?: SortOrder
    titulo?: SortOrder
    mensagem?: SortOrder
    lida?: SortOrder
    tipo?: SortOrder
    dataPrazo?: SortOrder
    criadoEm?: SortOrder
    clienteId?: SortOrder
    criadorId?: SortOrder
    usuarioId?: SortOrder
  }

  export type NotificacaoMinOrderByAggregateInput = {
    id?: SortOrder
    titulo?: SortOrder
    mensagem?: SortOrder
    lida?: SortOrder
    tipo?: SortOrder
    dataPrazo?: SortOrder
    criadoEm?: SortOrder
    clienteId?: SortOrder
    criadorId?: SortOrder
    usuarioId?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type UuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DocumentoListRelationFilter = {
    every?: DocumentoWhereInput
    some?: DocumentoWhereInput
    none?: DocumentoWhereInput
  }

  export type DocumentoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProcessoCountOrderByAggregateInput = {
    id?: SortOrder
  }

  export type ProcessoMaxOrderByAggregateInput = {
    id?: SortOrder
  }

  export type ProcessoMinOrderByAggregateInput = {
    id?: SortOrder
  }

  export type DependenteCountOrderByAggregateInput = {
    id?: SortOrder
  }

  export type DependenteMaxOrderByAggregateInput = {
    id?: SortOrder
  }

  export type DependenteMinOrderByAggregateInput = {
    id?: SortOrder
  }

  export type RequerimentoCountOrderByAggregateInput = {
    id?: SortOrder
    clienteId?: SortOrder
    processoId?: SortOrder
    tipo?: SortOrder
    status?: SortOrder
    observacoes?: SortOrder
    criadorId?: SortOrder
    createdAt?: SortOrder
    updated_at?: SortOrder
  }

  export type RequerimentoMaxOrderByAggregateInput = {
    id?: SortOrder
    clienteId?: SortOrder
    processoId?: SortOrder
    tipo?: SortOrder
    status?: SortOrder
    observacoes?: SortOrder
    criadorId?: SortOrder
    createdAt?: SortOrder
    updated_at?: SortOrder
  }

  export type RequerimentoMinOrderByAggregateInput = {
    id?: SortOrder
    clienteId?: SortOrder
    processoId?: SortOrder
    tipo?: SortOrder
    status?: SortOrder
    observacoes?: SortOrder
    criadorId?: SortOrder
    createdAt?: SortOrder
    updated_at?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type EnumStatusDocumentoFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusDocumento | EnumStatusDocumentoFieldRefInput<$PrismaModel>
    in?: $Enums.StatusDocumento[] | ListEnumStatusDocumentoFieldRefInput<$PrismaModel>
    notIn?: $Enums.StatusDocumento[] | ListEnumStatusDocumentoFieldRefInput<$PrismaModel>
    not?: NestedEnumStatusDocumentoFilter<$PrismaModel> | $Enums.StatusDocumento
  }

  export type ProcessoNullableRelationFilter = {
    is?: ProcessoWhereInput | null
    isNot?: ProcessoWhereInput | null
  }

  export type DependenteNullableRelationFilter = {
    is?: DependenteWhereInput | null
    isNot?: DependenteWhereInput | null
  }

  export type RequerimentoNullableRelationFilter = {
    is?: RequerimentoWhereInput | null
    isNot?: RequerimentoWhereInput | null
  }

  export type ApostilamentoNullableRelationFilter = {
    is?: ApostilamentoWhereInput | null
    isNot?: ApostilamentoWhereInput | null
  }

  export type DocumentoCountOrderByAggregateInput = {
    id?: SortOrder
    clienteId?: SortOrder
    processoId?: SortOrder
    dependenteId?: SortOrder
    requerimentoId?: SortOrder
    tipo?: SortOrder
    nomeOriginal?: SortOrder
    nomeArquivo?: SortOrder
    storagePath?: SortOrder
    publicUrl?: SortOrder
    contentType?: SortOrder
    tamanho?: SortOrder
    status?: SortOrder
    apostilado?: SortOrder
    traduzido?: SortOrder
    motivoRejeicao?: SortOrder
    analisadoPor?: SortOrder
    analisadoEm?: SortOrder
    solicitadoPeloJuridico?: SortOrder
    dataSolicitacaoJuridico?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
  }

  export type DocumentoAvgOrderByAggregateInput = {
    tamanho?: SortOrder
  }

  export type DocumentoMaxOrderByAggregateInput = {
    id?: SortOrder
    clienteId?: SortOrder
    processoId?: SortOrder
    dependenteId?: SortOrder
    requerimentoId?: SortOrder
    tipo?: SortOrder
    nomeOriginal?: SortOrder
    nomeArquivo?: SortOrder
    storagePath?: SortOrder
    publicUrl?: SortOrder
    contentType?: SortOrder
    tamanho?: SortOrder
    status?: SortOrder
    apostilado?: SortOrder
    traduzido?: SortOrder
    motivoRejeicao?: SortOrder
    analisadoPor?: SortOrder
    analisadoEm?: SortOrder
    solicitadoPeloJuridico?: SortOrder
    dataSolicitacaoJuridico?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
  }

  export type DocumentoMinOrderByAggregateInput = {
    id?: SortOrder
    clienteId?: SortOrder
    processoId?: SortOrder
    dependenteId?: SortOrder
    requerimentoId?: SortOrder
    tipo?: SortOrder
    nomeOriginal?: SortOrder
    nomeArquivo?: SortOrder
    storagePath?: SortOrder
    publicUrl?: SortOrder
    contentType?: SortOrder
    tamanho?: SortOrder
    status?: SortOrder
    apostilado?: SortOrder
    traduzido?: SortOrder
    motivoRejeicao?: SortOrder
    analisadoPor?: SortOrder
    analisadoEm?: SortOrder
    solicitadoPeloJuridico?: SortOrder
    dataSolicitacaoJuridico?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
  }

  export type DocumentoSumOrderByAggregateInput = {
    tamanho?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type EnumStatusDocumentoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusDocumento | EnumStatusDocumentoFieldRefInput<$PrismaModel>
    in?: $Enums.StatusDocumento[] | ListEnumStatusDocumentoFieldRefInput<$PrismaModel>
    notIn?: $Enums.StatusDocumento[] | ListEnumStatusDocumentoFieldRefInput<$PrismaModel>
    not?: NestedEnumStatusDocumentoWithAggregatesFilter<$PrismaModel> | $Enums.StatusDocumento
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStatusDocumentoFilter<$PrismaModel>
    _max?: NestedEnumStatusDocumentoFilter<$PrismaModel>
  }

  export type ConfiguracaoCountOrderByAggregateInput = {
    chave?: SortOrder
    valor?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
  }

  export type ConfiguracaoMaxOrderByAggregateInput = {
    chave?: SortOrder
    valor?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
  }

  export type ConfiguracaoMinOrderByAggregateInput = {
    chave?: SortOrder
    valor?: SortOrder
    criadoEm?: SortOrder
    atualizadoEm?: SortOrder
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type AgendamentoCountOrderByAggregateInput = {
    id?: SortOrder
    nome?: SortOrder
    email?: SortOrder
    telefone?: SortOrder
    dataHora?: SortOrder
    produtoId?: SortOrder
    duracaoMinutos?: SortOrder
    status?: SortOrder
    usuarioId?: SortOrder
    clienteId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AgendamentoAvgOrderByAggregateInput = {
    duracaoMinutos?: SortOrder
  }

  export type AgendamentoMaxOrderByAggregateInput = {
    id?: SortOrder
    nome?: SortOrder
    email?: SortOrder
    telefone?: SortOrder
    dataHora?: SortOrder
    produtoId?: SortOrder
    duracaoMinutos?: SortOrder
    status?: SortOrder
    usuarioId?: SortOrder
    clienteId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AgendamentoMinOrderByAggregateInput = {
    id?: SortOrder
    nome?: SortOrder
    email?: SortOrder
    telefone?: SortOrder
    dataHora?: SortOrder
    produtoId?: SortOrder
    duracaoMinutos?: SortOrder
    status?: SortOrder
    usuarioId?: SortOrder
    clienteId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AgendamentoSumOrderByAggregateInput = {
    duracaoMinutos?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type ServicoRequisitoListRelationFilter = {
    every?: ServicoRequisitoWhereInput
    some?: ServicoRequisitoWhereInput
    none?: ServicoRequisitoWhereInput
  }

  export type ServicoRequisitoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type CatalogoServicoCountOrderByAggregateInput = {
    id?: SortOrder
    nome?: SortOrder
    valor?: SortOrder
    duracao?: SortOrder
    exibirComercial?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CatalogoServicoAvgOrderByAggregateInput = {
    valor?: SortOrder
  }

  export type CatalogoServicoMaxOrderByAggregateInput = {
    id?: SortOrder
    nome?: SortOrder
    valor?: SortOrder
    duracao?: SortOrder
    exibirComercial?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CatalogoServicoMinOrderByAggregateInput = {
    id?: SortOrder
    nome?: SortOrder
    valor?: SortOrder
    duracao?: SortOrder
    exibirComercial?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type CatalogoServicoSumOrderByAggregateInput = {
    valor?: SortOrder
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type CatalogoServicoRelationFilter = {
    is?: CatalogoServicoWhereInput
    isNot?: CatalogoServicoWhereInput
  }

  export type ServicoRequisitoCountOrderByAggregateInput = {
    id?: SortOrder
    servicoId?: SortOrder
    nome?: SortOrder
    etapa?: SortOrder
    obrigatorio?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ServicoRequisitoMaxOrderByAggregateInput = {
    id?: SortOrder
    servicoId?: SortOrder
    nome?: SortOrder
    etapa?: SortOrder
    obrigatorio?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ServicoRequisitoMinOrderByAggregateInput = {
    id?: SortOrder
    servicoId?: SortOrder
    nome?: SortOrder
    etapa?: SortOrder
    obrigatorio?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type AssessoriaJuridicaCountOrderByAggregateInput = {
    id?: SortOrder
    clienteId?: SortOrder
    responsavelId?: SortOrder
    servicoId?: SortOrder
    respostas?: SortOrder
    observacoes?: SortOrder
    criadoEm?: SortOrder
  }

  export type AssessoriaJuridicaMaxOrderByAggregateInput = {
    id?: SortOrder
    clienteId?: SortOrder
    responsavelId?: SortOrder
    servicoId?: SortOrder
    observacoes?: SortOrder
    criadoEm?: SortOrder
  }

  export type AssessoriaJuridicaMinOrderByAggregateInput = {
    id?: SortOrder
    clienteId?: SortOrder
    responsavelId?: SortOrder
    servicoId?: SortOrder
    observacoes?: SortOrder
    criadoEm?: SortOrder
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type DocumentoRelationFilter = {
    is?: DocumentoWhereInput
    isNot?: DocumentoWhereInput
  }

  export type ApostilamentoCountOrderByAggregateInput = {
    id?: SortOrder
    documentoId?: SortOrder
    status?: SortOrder
    observacoes?: SortOrder
    solicitadoEm?: SortOrder
    concluidoEm?: SortOrder
  }

  export type ApostilamentoMaxOrderByAggregateInput = {
    id?: SortOrder
    documentoId?: SortOrder
    status?: SortOrder
    observacoes?: SortOrder
    solicitadoEm?: SortOrder
    concluidoEm?: SortOrder
  }

  export type ApostilamentoMinOrderByAggregateInput = {
    id?: SortOrder
    documentoId?: SortOrder
    status?: SortOrder
    observacoes?: SortOrder
    solicitadoEm?: SortOrder
    concluidoEm?: SortOrder
  }

  export type NotificacaoCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<NotificacaoCreateWithoutUsuarioInput, NotificacaoUncheckedCreateWithoutUsuarioInput> | NotificacaoCreateWithoutUsuarioInput[] | NotificacaoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: NotificacaoCreateOrConnectWithoutUsuarioInput | NotificacaoCreateOrConnectWithoutUsuarioInput[]
    createMany?: NotificacaoCreateManyUsuarioInputEnvelope
    connect?: NotificacaoWhereUniqueInput | NotificacaoWhereUniqueInput[]
  }

  export type AgendamentoCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<AgendamentoCreateWithoutUsuarioInput, AgendamentoUncheckedCreateWithoutUsuarioInput> | AgendamentoCreateWithoutUsuarioInput[] | AgendamentoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: AgendamentoCreateOrConnectWithoutUsuarioInput | AgendamentoCreateOrConnectWithoutUsuarioInput[]
    createMany?: AgendamentoCreateManyUsuarioInputEnvelope
    connect?: AgendamentoWhereUniqueInput | AgendamentoWhereUniqueInput[]
  }

  export type NotificacaoUncheckedCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<NotificacaoCreateWithoutUsuarioInput, NotificacaoUncheckedCreateWithoutUsuarioInput> | NotificacaoCreateWithoutUsuarioInput[] | NotificacaoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: NotificacaoCreateOrConnectWithoutUsuarioInput | NotificacaoCreateOrConnectWithoutUsuarioInput[]
    createMany?: NotificacaoCreateManyUsuarioInputEnvelope
    connect?: NotificacaoWhereUniqueInput | NotificacaoWhereUniqueInput[]
  }

  export type AgendamentoUncheckedCreateNestedManyWithoutUsuarioInput = {
    create?: XOR<AgendamentoCreateWithoutUsuarioInput, AgendamentoUncheckedCreateWithoutUsuarioInput> | AgendamentoCreateWithoutUsuarioInput[] | AgendamentoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: AgendamentoCreateOrConnectWithoutUsuarioInput | AgendamentoCreateOrConnectWithoutUsuarioInput[]
    createMany?: AgendamentoCreateManyUsuarioInputEnvelope
    connect?: AgendamentoWhereUniqueInput | AgendamentoWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumTipoUsuarioFieldUpdateOperationsInput = {
    set?: $Enums.TipoUsuario
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NotificacaoUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<NotificacaoCreateWithoutUsuarioInput, NotificacaoUncheckedCreateWithoutUsuarioInput> | NotificacaoCreateWithoutUsuarioInput[] | NotificacaoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: NotificacaoCreateOrConnectWithoutUsuarioInput | NotificacaoCreateOrConnectWithoutUsuarioInput[]
    upsert?: NotificacaoUpsertWithWhereUniqueWithoutUsuarioInput | NotificacaoUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: NotificacaoCreateManyUsuarioInputEnvelope
    set?: NotificacaoWhereUniqueInput | NotificacaoWhereUniqueInput[]
    disconnect?: NotificacaoWhereUniqueInput | NotificacaoWhereUniqueInput[]
    delete?: NotificacaoWhereUniqueInput | NotificacaoWhereUniqueInput[]
    connect?: NotificacaoWhereUniqueInput | NotificacaoWhereUniqueInput[]
    update?: NotificacaoUpdateWithWhereUniqueWithoutUsuarioInput | NotificacaoUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: NotificacaoUpdateManyWithWhereWithoutUsuarioInput | NotificacaoUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: NotificacaoScalarWhereInput | NotificacaoScalarWhereInput[]
  }

  export type AgendamentoUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<AgendamentoCreateWithoutUsuarioInput, AgendamentoUncheckedCreateWithoutUsuarioInput> | AgendamentoCreateWithoutUsuarioInput[] | AgendamentoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: AgendamentoCreateOrConnectWithoutUsuarioInput | AgendamentoCreateOrConnectWithoutUsuarioInput[]
    upsert?: AgendamentoUpsertWithWhereUniqueWithoutUsuarioInput | AgendamentoUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: AgendamentoCreateManyUsuarioInputEnvelope
    set?: AgendamentoWhereUniqueInput | AgendamentoWhereUniqueInput[]
    disconnect?: AgendamentoWhereUniqueInput | AgendamentoWhereUniqueInput[]
    delete?: AgendamentoWhereUniqueInput | AgendamentoWhereUniqueInput[]
    connect?: AgendamentoWhereUniqueInput | AgendamentoWhereUniqueInput[]
    update?: AgendamentoUpdateWithWhereUniqueWithoutUsuarioInput | AgendamentoUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: AgendamentoUpdateManyWithWhereWithoutUsuarioInput | AgendamentoUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: AgendamentoScalarWhereInput | AgendamentoScalarWhereInput[]
  }

  export type NotificacaoUncheckedUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<NotificacaoCreateWithoutUsuarioInput, NotificacaoUncheckedCreateWithoutUsuarioInput> | NotificacaoCreateWithoutUsuarioInput[] | NotificacaoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: NotificacaoCreateOrConnectWithoutUsuarioInput | NotificacaoCreateOrConnectWithoutUsuarioInput[]
    upsert?: NotificacaoUpsertWithWhereUniqueWithoutUsuarioInput | NotificacaoUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: NotificacaoCreateManyUsuarioInputEnvelope
    set?: NotificacaoWhereUniqueInput | NotificacaoWhereUniqueInput[]
    disconnect?: NotificacaoWhereUniqueInput | NotificacaoWhereUniqueInput[]
    delete?: NotificacaoWhereUniqueInput | NotificacaoWhereUniqueInput[]
    connect?: NotificacaoWhereUniqueInput | NotificacaoWhereUniqueInput[]
    update?: NotificacaoUpdateWithWhereUniqueWithoutUsuarioInput | NotificacaoUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: NotificacaoUpdateManyWithWhereWithoutUsuarioInput | NotificacaoUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: NotificacaoScalarWhereInput | NotificacaoScalarWhereInput[]
  }

  export type AgendamentoUncheckedUpdateManyWithoutUsuarioNestedInput = {
    create?: XOR<AgendamentoCreateWithoutUsuarioInput, AgendamentoUncheckedCreateWithoutUsuarioInput> | AgendamentoCreateWithoutUsuarioInput[] | AgendamentoUncheckedCreateWithoutUsuarioInput[]
    connectOrCreate?: AgendamentoCreateOrConnectWithoutUsuarioInput | AgendamentoCreateOrConnectWithoutUsuarioInput[]
    upsert?: AgendamentoUpsertWithWhereUniqueWithoutUsuarioInput | AgendamentoUpsertWithWhereUniqueWithoutUsuarioInput[]
    createMany?: AgendamentoCreateManyUsuarioInputEnvelope
    set?: AgendamentoWhereUniqueInput | AgendamentoWhereUniqueInput[]
    disconnect?: AgendamentoWhereUniqueInput | AgendamentoWhereUniqueInput[]
    delete?: AgendamentoWhereUniqueInput | AgendamentoWhereUniqueInput[]
    connect?: AgendamentoWhereUniqueInput | AgendamentoWhereUniqueInput[]
    update?: AgendamentoUpdateWithWhereUniqueWithoutUsuarioInput | AgendamentoUpdateWithWhereUniqueWithoutUsuarioInput[]
    updateMany?: AgendamentoUpdateManyWithWhereWithoutUsuarioInput | AgendamentoUpdateManyWithWhereWithoutUsuarioInput[]
    deleteMany?: AgendamentoScalarWhereInput | AgendamentoScalarWhereInput[]
  }

  export type UsuarioCreateNestedOneWithoutNotificacoesInput = {
    create?: XOR<UsuarioCreateWithoutNotificacoesInput, UsuarioUncheckedCreateWithoutNotificacoesInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutNotificacoesInput
    connect?: UsuarioWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UsuarioUpdateOneWithoutNotificacoesNestedInput = {
    create?: XOR<UsuarioCreateWithoutNotificacoesInput, UsuarioUncheckedCreateWithoutNotificacoesInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutNotificacoesInput
    upsert?: UsuarioUpsertWithoutNotificacoesInput
    disconnect?: UsuarioWhereInput | boolean
    delete?: UsuarioWhereInput | boolean
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutNotificacoesInput, UsuarioUpdateWithoutNotificacoesInput>, UsuarioUncheckedUpdateWithoutNotificacoesInput>
  }

  export type DocumentoCreateNestedManyWithoutProcessoInput = {
    create?: XOR<DocumentoCreateWithoutProcessoInput, DocumentoUncheckedCreateWithoutProcessoInput> | DocumentoCreateWithoutProcessoInput[] | DocumentoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: DocumentoCreateOrConnectWithoutProcessoInput | DocumentoCreateOrConnectWithoutProcessoInput[]
    createMany?: DocumentoCreateManyProcessoInputEnvelope
    connect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
  }

  export type DocumentoUncheckedCreateNestedManyWithoutProcessoInput = {
    create?: XOR<DocumentoCreateWithoutProcessoInput, DocumentoUncheckedCreateWithoutProcessoInput> | DocumentoCreateWithoutProcessoInput[] | DocumentoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: DocumentoCreateOrConnectWithoutProcessoInput | DocumentoCreateOrConnectWithoutProcessoInput[]
    createMany?: DocumentoCreateManyProcessoInputEnvelope
    connect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
  }

  export type DocumentoUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<DocumentoCreateWithoutProcessoInput, DocumentoUncheckedCreateWithoutProcessoInput> | DocumentoCreateWithoutProcessoInput[] | DocumentoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: DocumentoCreateOrConnectWithoutProcessoInput | DocumentoCreateOrConnectWithoutProcessoInput[]
    upsert?: DocumentoUpsertWithWhereUniqueWithoutProcessoInput | DocumentoUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: DocumentoCreateManyProcessoInputEnvelope
    set?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    disconnect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    delete?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    connect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    update?: DocumentoUpdateWithWhereUniqueWithoutProcessoInput | DocumentoUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: DocumentoUpdateManyWithWhereWithoutProcessoInput | DocumentoUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: DocumentoScalarWhereInput | DocumentoScalarWhereInput[]
  }

  export type DocumentoUncheckedUpdateManyWithoutProcessoNestedInput = {
    create?: XOR<DocumentoCreateWithoutProcessoInput, DocumentoUncheckedCreateWithoutProcessoInput> | DocumentoCreateWithoutProcessoInput[] | DocumentoUncheckedCreateWithoutProcessoInput[]
    connectOrCreate?: DocumentoCreateOrConnectWithoutProcessoInput | DocumentoCreateOrConnectWithoutProcessoInput[]
    upsert?: DocumentoUpsertWithWhereUniqueWithoutProcessoInput | DocumentoUpsertWithWhereUniqueWithoutProcessoInput[]
    createMany?: DocumentoCreateManyProcessoInputEnvelope
    set?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    disconnect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    delete?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    connect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    update?: DocumentoUpdateWithWhereUniqueWithoutProcessoInput | DocumentoUpdateWithWhereUniqueWithoutProcessoInput[]
    updateMany?: DocumentoUpdateManyWithWhereWithoutProcessoInput | DocumentoUpdateManyWithWhereWithoutProcessoInput[]
    deleteMany?: DocumentoScalarWhereInput | DocumentoScalarWhereInput[]
  }

  export type DocumentoCreateNestedManyWithoutDependenteInput = {
    create?: XOR<DocumentoCreateWithoutDependenteInput, DocumentoUncheckedCreateWithoutDependenteInput> | DocumentoCreateWithoutDependenteInput[] | DocumentoUncheckedCreateWithoutDependenteInput[]
    connectOrCreate?: DocumentoCreateOrConnectWithoutDependenteInput | DocumentoCreateOrConnectWithoutDependenteInput[]
    createMany?: DocumentoCreateManyDependenteInputEnvelope
    connect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
  }

  export type DocumentoUncheckedCreateNestedManyWithoutDependenteInput = {
    create?: XOR<DocumentoCreateWithoutDependenteInput, DocumentoUncheckedCreateWithoutDependenteInput> | DocumentoCreateWithoutDependenteInput[] | DocumentoUncheckedCreateWithoutDependenteInput[]
    connectOrCreate?: DocumentoCreateOrConnectWithoutDependenteInput | DocumentoCreateOrConnectWithoutDependenteInput[]
    createMany?: DocumentoCreateManyDependenteInputEnvelope
    connect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
  }

  export type DocumentoUpdateManyWithoutDependenteNestedInput = {
    create?: XOR<DocumentoCreateWithoutDependenteInput, DocumentoUncheckedCreateWithoutDependenteInput> | DocumentoCreateWithoutDependenteInput[] | DocumentoUncheckedCreateWithoutDependenteInput[]
    connectOrCreate?: DocumentoCreateOrConnectWithoutDependenteInput | DocumentoCreateOrConnectWithoutDependenteInput[]
    upsert?: DocumentoUpsertWithWhereUniqueWithoutDependenteInput | DocumentoUpsertWithWhereUniqueWithoutDependenteInput[]
    createMany?: DocumentoCreateManyDependenteInputEnvelope
    set?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    disconnect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    delete?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    connect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    update?: DocumentoUpdateWithWhereUniqueWithoutDependenteInput | DocumentoUpdateWithWhereUniqueWithoutDependenteInput[]
    updateMany?: DocumentoUpdateManyWithWhereWithoutDependenteInput | DocumentoUpdateManyWithWhereWithoutDependenteInput[]
    deleteMany?: DocumentoScalarWhereInput | DocumentoScalarWhereInput[]
  }

  export type DocumentoUncheckedUpdateManyWithoutDependenteNestedInput = {
    create?: XOR<DocumentoCreateWithoutDependenteInput, DocumentoUncheckedCreateWithoutDependenteInput> | DocumentoCreateWithoutDependenteInput[] | DocumentoUncheckedCreateWithoutDependenteInput[]
    connectOrCreate?: DocumentoCreateOrConnectWithoutDependenteInput | DocumentoCreateOrConnectWithoutDependenteInput[]
    upsert?: DocumentoUpsertWithWhereUniqueWithoutDependenteInput | DocumentoUpsertWithWhereUniqueWithoutDependenteInput[]
    createMany?: DocumentoCreateManyDependenteInputEnvelope
    set?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    disconnect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    delete?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    connect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    update?: DocumentoUpdateWithWhereUniqueWithoutDependenteInput | DocumentoUpdateWithWhereUniqueWithoutDependenteInput[]
    updateMany?: DocumentoUpdateManyWithWhereWithoutDependenteInput | DocumentoUpdateManyWithWhereWithoutDependenteInput[]
    deleteMany?: DocumentoScalarWhereInput | DocumentoScalarWhereInput[]
  }

  export type DocumentoCreateNestedManyWithoutRequerimentoInput = {
    create?: XOR<DocumentoCreateWithoutRequerimentoInput, DocumentoUncheckedCreateWithoutRequerimentoInput> | DocumentoCreateWithoutRequerimentoInput[] | DocumentoUncheckedCreateWithoutRequerimentoInput[]
    connectOrCreate?: DocumentoCreateOrConnectWithoutRequerimentoInput | DocumentoCreateOrConnectWithoutRequerimentoInput[]
    createMany?: DocumentoCreateManyRequerimentoInputEnvelope
    connect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
  }

  export type DocumentoUncheckedCreateNestedManyWithoutRequerimentoInput = {
    create?: XOR<DocumentoCreateWithoutRequerimentoInput, DocumentoUncheckedCreateWithoutRequerimentoInput> | DocumentoCreateWithoutRequerimentoInput[] | DocumentoUncheckedCreateWithoutRequerimentoInput[]
    connectOrCreate?: DocumentoCreateOrConnectWithoutRequerimentoInput | DocumentoCreateOrConnectWithoutRequerimentoInput[]
    createMany?: DocumentoCreateManyRequerimentoInputEnvelope
    connect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
  }

  export type DocumentoUpdateManyWithoutRequerimentoNestedInput = {
    create?: XOR<DocumentoCreateWithoutRequerimentoInput, DocumentoUncheckedCreateWithoutRequerimentoInput> | DocumentoCreateWithoutRequerimentoInput[] | DocumentoUncheckedCreateWithoutRequerimentoInput[]
    connectOrCreate?: DocumentoCreateOrConnectWithoutRequerimentoInput | DocumentoCreateOrConnectWithoutRequerimentoInput[]
    upsert?: DocumentoUpsertWithWhereUniqueWithoutRequerimentoInput | DocumentoUpsertWithWhereUniqueWithoutRequerimentoInput[]
    createMany?: DocumentoCreateManyRequerimentoInputEnvelope
    set?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    disconnect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    delete?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    connect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    update?: DocumentoUpdateWithWhereUniqueWithoutRequerimentoInput | DocumentoUpdateWithWhereUniqueWithoutRequerimentoInput[]
    updateMany?: DocumentoUpdateManyWithWhereWithoutRequerimentoInput | DocumentoUpdateManyWithWhereWithoutRequerimentoInput[]
    deleteMany?: DocumentoScalarWhereInput | DocumentoScalarWhereInput[]
  }

  export type DocumentoUncheckedUpdateManyWithoutRequerimentoNestedInput = {
    create?: XOR<DocumentoCreateWithoutRequerimentoInput, DocumentoUncheckedCreateWithoutRequerimentoInput> | DocumentoCreateWithoutRequerimentoInput[] | DocumentoUncheckedCreateWithoutRequerimentoInput[]
    connectOrCreate?: DocumentoCreateOrConnectWithoutRequerimentoInput | DocumentoCreateOrConnectWithoutRequerimentoInput[]
    upsert?: DocumentoUpsertWithWhereUniqueWithoutRequerimentoInput | DocumentoUpsertWithWhereUniqueWithoutRequerimentoInput[]
    createMany?: DocumentoCreateManyRequerimentoInputEnvelope
    set?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    disconnect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    delete?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    connect?: DocumentoWhereUniqueInput | DocumentoWhereUniqueInput[]
    update?: DocumentoUpdateWithWhereUniqueWithoutRequerimentoInput | DocumentoUpdateWithWhereUniqueWithoutRequerimentoInput[]
    updateMany?: DocumentoUpdateManyWithWhereWithoutRequerimentoInput | DocumentoUpdateManyWithWhereWithoutRequerimentoInput[]
    deleteMany?: DocumentoScalarWhereInput | DocumentoScalarWhereInput[]
  }

  export type ProcessoCreateNestedOneWithoutDocumentosInput = {
    create?: XOR<ProcessoCreateWithoutDocumentosInput, ProcessoUncheckedCreateWithoutDocumentosInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutDocumentosInput
    connect?: ProcessoWhereUniqueInput
  }

  export type DependenteCreateNestedOneWithoutDocumentosInput = {
    create?: XOR<DependenteCreateWithoutDocumentosInput, DependenteUncheckedCreateWithoutDocumentosInput>
    connectOrCreate?: DependenteCreateOrConnectWithoutDocumentosInput
    connect?: DependenteWhereUniqueInput
  }

  export type RequerimentoCreateNestedOneWithoutDocumentosInput = {
    create?: XOR<RequerimentoCreateWithoutDocumentosInput, RequerimentoUncheckedCreateWithoutDocumentosInput>
    connectOrCreate?: RequerimentoCreateOrConnectWithoutDocumentosInput
    connect?: RequerimentoWhereUniqueInput
  }

  export type ApostilamentoCreateNestedOneWithoutDocumentoInput = {
    create?: XOR<ApostilamentoCreateWithoutDocumentoInput, ApostilamentoUncheckedCreateWithoutDocumentoInput>
    connectOrCreate?: ApostilamentoCreateOrConnectWithoutDocumentoInput
    connect?: ApostilamentoWhereUniqueInput
  }

  export type ApostilamentoUncheckedCreateNestedOneWithoutDocumentoInput = {
    create?: XOR<ApostilamentoCreateWithoutDocumentoInput, ApostilamentoUncheckedCreateWithoutDocumentoInput>
    connectOrCreate?: ApostilamentoCreateOrConnectWithoutDocumentoInput
    connect?: ApostilamentoWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumStatusDocumentoFieldUpdateOperationsInput = {
    set?: $Enums.StatusDocumento
  }

  export type ProcessoUpdateOneWithoutDocumentosNestedInput = {
    create?: XOR<ProcessoCreateWithoutDocumentosInput, ProcessoUncheckedCreateWithoutDocumentosInput>
    connectOrCreate?: ProcessoCreateOrConnectWithoutDocumentosInput
    upsert?: ProcessoUpsertWithoutDocumentosInput
    disconnect?: ProcessoWhereInput | boolean
    delete?: ProcessoWhereInput | boolean
    connect?: ProcessoWhereUniqueInput
    update?: XOR<XOR<ProcessoUpdateToOneWithWhereWithoutDocumentosInput, ProcessoUpdateWithoutDocumentosInput>, ProcessoUncheckedUpdateWithoutDocumentosInput>
  }

  export type DependenteUpdateOneWithoutDocumentosNestedInput = {
    create?: XOR<DependenteCreateWithoutDocumentosInput, DependenteUncheckedCreateWithoutDocumentosInput>
    connectOrCreate?: DependenteCreateOrConnectWithoutDocumentosInput
    upsert?: DependenteUpsertWithoutDocumentosInput
    disconnect?: DependenteWhereInput | boolean
    delete?: DependenteWhereInput | boolean
    connect?: DependenteWhereUniqueInput
    update?: XOR<XOR<DependenteUpdateToOneWithWhereWithoutDocumentosInput, DependenteUpdateWithoutDocumentosInput>, DependenteUncheckedUpdateWithoutDocumentosInput>
  }

  export type RequerimentoUpdateOneWithoutDocumentosNestedInput = {
    create?: XOR<RequerimentoCreateWithoutDocumentosInput, RequerimentoUncheckedCreateWithoutDocumentosInput>
    connectOrCreate?: RequerimentoCreateOrConnectWithoutDocumentosInput
    upsert?: RequerimentoUpsertWithoutDocumentosInput
    disconnect?: RequerimentoWhereInput | boolean
    delete?: RequerimentoWhereInput | boolean
    connect?: RequerimentoWhereUniqueInput
    update?: XOR<XOR<RequerimentoUpdateToOneWithWhereWithoutDocumentosInput, RequerimentoUpdateWithoutDocumentosInput>, RequerimentoUncheckedUpdateWithoutDocumentosInput>
  }

  export type ApostilamentoUpdateOneWithoutDocumentoNestedInput = {
    create?: XOR<ApostilamentoCreateWithoutDocumentoInput, ApostilamentoUncheckedCreateWithoutDocumentoInput>
    connectOrCreate?: ApostilamentoCreateOrConnectWithoutDocumentoInput
    upsert?: ApostilamentoUpsertWithoutDocumentoInput
    disconnect?: ApostilamentoWhereInput | boolean
    delete?: ApostilamentoWhereInput | boolean
    connect?: ApostilamentoWhereUniqueInput
    update?: XOR<XOR<ApostilamentoUpdateToOneWithWhereWithoutDocumentoInput, ApostilamentoUpdateWithoutDocumentoInput>, ApostilamentoUncheckedUpdateWithoutDocumentoInput>
  }

  export type ApostilamentoUncheckedUpdateOneWithoutDocumentoNestedInput = {
    create?: XOR<ApostilamentoCreateWithoutDocumentoInput, ApostilamentoUncheckedCreateWithoutDocumentoInput>
    connectOrCreate?: ApostilamentoCreateOrConnectWithoutDocumentoInput
    upsert?: ApostilamentoUpsertWithoutDocumentoInput
    disconnect?: ApostilamentoWhereInput | boolean
    delete?: ApostilamentoWhereInput | boolean
    connect?: ApostilamentoWhereUniqueInput
    update?: XOR<XOR<ApostilamentoUpdateToOneWithWhereWithoutDocumentoInput, ApostilamentoUpdateWithoutDocumentoInput>, ApostilamentoUncheckedUpdateWithoutDocumentoInput>
  }

  export type UsuarioCreateNestedOneWithoutAgendamentosInput = {
    create?: XOR<UsuarioCreateWithoutAgendamentosInput, UsuarioUncheckedCreateWithoutAgendamentosInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutAgendamentosInput
    connect?: UsuarioWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UsuarioUpdateOneWithoutAgendamentosNestedInput = {
    create?: XOR<UsuarioCreateWithoutAgendamentosInput, UsuarioUncheckedCreateWithoutAgendamentosInput>
    connectOrCreate?: UsuarioCreateOrConnectWithoutAgendamentosInput
    upsert?: UsuarioUpsertWithoutAgendamentosInput
    disconnect?: UsuarioWhereInput | boolean
    delete?: UsuarioWhereInput | boolean
    connect?: UsuarioWhereUniqueInput
    update?: XOR<XOR<UsuarioUpdateToOneWithWhereWithoutAgendamentosInput, UsuarioUpdateWithoutAgendamentosInput>, UsuarioUncheckedUpdateWithoutAgendamentosInput>
  }

  export type ServicoRequisitoCreateNestedManyWithoutServicoInput = {
    create?: XOR<ServicoRequisitoCreateWithoutServicoInput, ServicoRequisitoUncheckedCreateWithoutServicoInput> | ServicoRequisitoCreateWithoutServicoInput[] | ServicoRequisitoUncheckedCreateWithoutServicoInput[]
    connectOrCreate?: ServicoRequisitoCreateOrConnectWithoutServicoInput | ServicoRequisitoCreateOrConnectWithoutServicoInput[]
    createMany?: ServicoRequisitoCreateManyServicoInputEnvelope
    connect?: ServicoRequisitoWhereUniqueInput | ServicoRequisitoWhereUniqueInput[]
  }

  export type ServicoRequisitoUncheckedCreateNestedManyWithoutServicoInput = {
    create?: XOR<ServicoRequisitoCreateWithoutServicoInput, ServicoRequisitoUncheckedCreateWithoutServicoInput> | ServicoRequisitoCreateWithoutServicoInput[] | ServicoRequisitoUncheckedCreateWithoutServicoInput[]
    connectOrCreate?: ServicoRequisitoCreateOrConnectWithoutServicoInput | ServicoRequisitoCreateOrConnectWithoutServicoInput[]
    createMany?: ServicoRequisitoCreateManyServicoInputEnvelope
    connect?: ServicoRequisitoWhereUniqueInput | ServicoRequisitoWhereUniqueInput[]
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type ServicoRequisitoUpdateManyWithoutServicoNestedInput = {
    create?: XOR<ServicoRequisitoCreateWithoutServicoInput, ServicoRequisitoUncheckedCreateWithoutServicoInput> | ServicoRequisitoCreateWithoutServicoInput[] | ServicoRequisitoUncheckedCreateWithoutServicoInput[]
    connectOrCreate?: ServicoRequisitoCreateOrConnectWithoutServicoInput | ServicoRequisitoCreateOrConnectWithoutServicoInput[]
    upsert?: ServicoRequisitoUpsertWithWhereUniqueWithoutServicoInput | ServicoRequisitoUpsertWithWhereUniqueWithoutServicoInput[]
    createMany?: ServicoRequisitoCreateManyServicoInputEnvelope
    set?: ServicoRequisitoWhereUniqueInput | ServicoRequisitoWhereUniqueInput[]
    disconnect?: ServicoRequisitoWhereUniqueInput | ServicoRequisitoWhereUniqueInput[]
    delete?: ServicoRequisitoWhereUniqueInput | ServicoRequisitoWhereUniqueInput[]
    connect?: ServicoRequisitoWhereUniqueInput | ServicoRequisitoWhereUniqueInput[]
    update?: ServicoRequisitoUpdateWithWhereUniqueWithoutServicoInput | ServicoRequisitoUpdateWithWhereUniqueWithoutServicoInput[]
    updateMany?: ServicoRequisitoUpdateManyWithWhereWithoutServicoInput | ServicoRequisitoUpdateManyWithWhereWithoutServicoInput[]
    deleteMany?: ServicoRequisitoScalarWhereInput | ServicoRequisitoScalarWhereInput[]
  }

  export type ServicoRequisitoUncheckedUpdateManyWithoutServicoNestedInput = {
    create?: XOR<ServicoRequisitoCreateWithoutServicoInput, ServicoRequisitoUncheckedCreateWithoutServicoInput> | ServicoRequisitoCreateWithoutServicoInput[] | ServicoRequisitoUncheckedCreateWithoutServicoInput[]
    connectOrCreate?: ServicoRequisitoCreateOrConnectWithoutServicoInput | ServicoRequisitoCreateOrConnectWithoutServicoInput[]
    upsert?: ServicoRequisitoUpsertWithWhereUniqueWithoutServicoInput | ServicoRequisitoUpsertWithWhereUniqueWithoutServicoInput[]
    createMany?: ServicoRequisitoCreateManyServicoInputEnvelope
    set?: ServicoRequisitoWhereUniqueInput | ServicoRequisitoWhereUniqueInput[]
    disconnect?: ServicoRequisitoWhereUniqueInput | ServicoRequisitoWhereUniqueInput[]
    delete?: ServicoRequisitoWhereUniqueInput | ServicoRequisitoWhereUniqueInput[]
    connect?: ServicoRequisitoWhereUniqueInput | ServicoRequisitoWhereUniqueInput[]
    update?: ServicoRequisitoUpdateWithWhereUniqueWithoutServicoInput | ServicoRequisitoUpdateWithWhereUniqueWithoutServicoInput[]
    updateMany?: ServicoRequisitoUpdateManyWithWhereWithoutServicoInput | ServicoRequisitoUpdateManyWithWhereWithoutServicoInput[]
    deleteMany?: ServicoRequisitoScalarWhereInput | ServicoRequisitoScalarWhereInput[]
  }

  export type CatalogoServicoCreateNestedOneWithoutRequisitosInput = {
    create?: XOR<CatalogoServicoCreateWithoutRequisitosInput, CatalogoServicoUncheckedCreateWithoutRequisitosInput>
    connectOrCreate?: CatalogoServicoCreateOrConnectWithoutRequisitosInput
    connect?: CatalogoServicoWhereUniqueInput
  }

  export type CatalogoServicoUpdateOneRequiredWithoutRequisitosNestedInput = {
    create?: XOR<CatalogoServicoCreateWithoutRequisitosInput, CatalogoServicoUncheckedCreateWithoutRequisitosInput>
    connectOrCreate?: CatalogoServicoCreateOrConnectWithoutRequisitosInput
    upsert?: CatalogoServicoUpsertWithoutRequisitosInput
    connect?: CatalogoServicoWhereUniqueInput
    update?: XOR<XOR<CatalogoServicoUpdateToOneWithWhereWithoutRequisitosInput, CatalogoServicoUpdateWithoutRequisitosInput>, CatalogoServicoUncheckedUpdateWithoutRequisitosInput>
  }

  export type DocumentoCreateNestedOneWithoutApostilamentoInput = {
    create?: XOR<DocumentoCreateWithoutApostilamentoInput, DocumentoUncheckedCreateWithoutApostilamentoInput>
    connectOrCreate?: DocumentoCreateOrConnectWithoutApostilamentoInput
    connect?: DocumentoWhereUniqueInput
  }

  export type DocumentoUpdateOneRequiredWithoutApostilamentoNestedInput = {
    create?: XOR<DocumentoCreateWithoutApostilamentoInput, DocumentoUncheckedCreateWithoutApostilamentoInput>
    connectOrCreate?: DocumentoCreateOrConnectWithoutApostilamentoInput
    upsert?: DocumentoUpsertWithoutApostilamentoInput
    connect?: DocumentoWhereUniqueInput
    update?: XOR<XOR<DocumentoUpdateToOneWithWhereWithoutApostilamentoInput, DocumentoUpdateWithoutApostilamentoInput>, DocumentoUncheckedUpdateWithoutApostilamentoInput>
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumTipoUsuarioFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoUsuario | EnumTipoUsuarioFieldRefInput<$PrismaModel>
    in?: $Enums.TipoUsuario[] | ListEnumTipoUsuarioFieldRefInput<$PrismaModel>
    notIn?: $Enums.TipoUsuario[] | ListEnumTipoUsuarioFieldRefInput<$PrismaModel>
    not?: NestedEnumTipoUsuarioFilter<$PrismaModel> | $Enums.TipoUsuario
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumTipoUsuarioWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TipoUsuario | EnumTipoUsuarioFieldRefInput<$PrismaModel>
    in?: $Enums.TipoUsuario[] | ListEnumTipoUsuarioFieldRefInput<$PrismaModel>
    notIn?: $Enums.TipoUsuario[] | ListEnumTipoUsuarioFieldRefInput<$PrismaModel>
    not?: NestedEnumTipoUsuarioWithAggregatesFilter<$PrismaModel> | $Enums.TipoUsuario
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTipoUsuarioFilter<$PrismaModel>
    _max?: NestedEnumTipoUsuarioFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedUuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedUuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedEnumStatusDocumentoFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusDocumento | EnumStatusDocumentoFieldRefInput<$PrismaModel>
    in?: $Enums.StatusDocumento[] | ListEnumStatusDocumentoFieldRefInput<$PrismaModel>
    notIn?: $Enums.StatusDocumento[] | ListEnumStatusDocumentoFieldRefInput<$PrismaModel>
    not?: NestedEnumStatusDocumentoFilter<$PrismaModel> | $Enums.StatusDocumento
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumStatusDocumentoWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.StatusDocumento | EnumStatusDocumentoFieldRefInput<$PrismaModel>
    in?: $Enums.StatusDocumento[] | ListEnumStatusDocumentoFieldRefInput<$PrismaModel>
    notIn?: $Enums.StatusDocumento[] | ListEnumStatusDocumentoFieldRefInput<$PrismaModel>
    not?: NestedEnumStatusDocumentoWithAggregatesFilter<$PrismaModel> | $Enums.StatusDocumento
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumStatusDocumentoFilter<$PrismaModel>
    _max?: NestedEnumStatusDocumentoFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NotificacaoCreateWithoutUsuarioInput = {
    id?: string
    titulo: string
    mensagem: string
    lida?: boolean
    tipo?: string
    dataPrazo?: Date | string | null
    criadoEm?: Date | string
    clienteId?: string | null
    criadorId?: string | null
  }

  export type NotificacaoUncheckedCreateWithoutUsuarioInput = {
    id?: string
    titulo: string
    mensagem: string
    lida?: boolean
    tipo?: string
    dataPrazo?: Date | string | null
    criadoEm?: Date | string
    clienteId?: string | null
    criadorId?: string | null
  }

  export type NotificacaoCreateOrConnectWithoutUsuarioInput = {
    where: NotificacaoWhereUniqueInput
    create: XOR<NotificacaoCreateWithoutUsuarioInput, NotificacaoUncheckedCreateWithoutUsuarioInput>
  }

  export type NotificacaoCreateManyUsuarioInputEnvelope = {
    data: NotificacaoCreateManyUsuarioInput | NotificacaoCreateManyUsuarioInput[]
    skipDuplicates?: boolean
  }

  export type AgendamentoCreateWithoutUsuarioInput = {
    id?: string
    nome: string
    email: string
    telefone: string
    dataHora: Date | string
    produtoId: string
    duracaoMinutos?: number
    status?: string
    clienteId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AgendamentoUncheckedCreateWithoutUsuarioInput = {
    id?: string
    nome: string
    email: string
    telefone: string
    dataHora: Date | string
    produtoId: string
    duracaoMinutos?: number
    status?: string
    clienteId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AgendamentoCreateOrConnectWithoutUsuarioInput = {
    where: AgendamentoWhereUniqueInput
    create: XOR<AgendamentoCreateWithoutUsuarioInput, AgendamentoUncheckedCreateWithoutUsuarioInput>
  }

  export type AgendamentoCreateManyUsuarioInputEnvelope = {
    data: AgendamentoCreateManyUsuarioInput | AgendamentoCreateManyUsuarioInput[]
    skipDuplicates?: boolean
  }

  export type NotificacaoUpsertWithWhereUniqueWithoutUsuarioInput = {
    where: NotificacaoWhereUniqueInput
    update: XOR<NotificacaoUpdateWithoutUsuarioInput, NotificacaoUncheckedUpdateWithoutUsuarioInput>
    create: XOR<NotificacaoCreateWithoutUsuarioInput, NotificacaoUncheckedCreateWithoutUsuarioInput>
  }

  export type NotificacaoUpdateWithWhereUniqueWithoutUsuarioInput = {
    where: NotificacaoWhereUniqueInput
    data: XOR<NotificacaoUpdateWithoutUsuarioInput, NotificacaoUncheckedUpdateWithoutUsuarioInput>
  }

  export type NotificacaoUpdateManyWithWhereWithoutUsuarioInput = {
    where: NotificacaoScalarWhereInput
    data: XOR<NotificacaoUpdateManyMutationInput, NotificacaoUncheckedUpdateManyWithoutUsuarioInput>
  }

  export type NotificacaoScalarWhereInput = {
    AND?: NotificacaoScalarWhereInput | NotificacaoScalarWhereInput[]
    OR?: NotificacaoScalarWhereInput[]
    NOT?: NotificacaoScalarWhereInput | NotificacaoScalarWhereInput[]
    id?: StringFilter<"Notificacao"> | string
    titulo?: StringFilter<"Notificacao"> | string
    mensagem?: StringFilter<"Notificacao"> | string
    lida?: BoolFilter<"Notificacao"> | boolean
    tipo?: StringFilter<"Notificacao"> | string
    dataPrazo?: DateTimeNullableFilter<"Notificacao"> | Date | string | null
    criadoEm?: DateTimeFilter<"Notificacao"> | Date | string
    clienteId?: UuidNullableFilter<"Notificacao"> | string | null
    criadorId?: UuidNullableFilter<"Notificacao"> | string | null
    usuarioId?: UuidNullableFilter<"Notificacao"> | string | null
  }

  export type AgendamentoUpsertWithWhereUniqueWithoutUsuarioInput = {
    where: AgendamentoWhereUniqueInput
    update: XOR<AgendamentoUpdateWithoutUsuarioInput, AgendamentoUncheckedUpdateWithoutUsuarioInput>
    create: XOR<AgendamentoCreateWithoutUsuarioInput, AgendamentoUncheckedCreateWithoutUsuarioInput>
  }

  export type AgendamentoUpdateWithWhereUniqueWithoutUsuarioInput = {
    where: AgendamentoWhereUniqueInput
    data: XOR<AgendamentoUpdateWithoutUsuarioInput, AgendamentoUncheckedUpdateWithoutUsuarioInput>
  }

  export type AgendamentoUpdateManyWithWhereWithoutUsuarioInput = {
    where: AgendamentoScalarWhereInput
    data: XOR<AgendamentoUpdateManyMutationInput, AgendamentoUncheckedUpdateManyWithoutUsuarioInput>
  }

  export type AgendamentoScalarWhereInput = {
    AND?: AgendamentoScalarWhereInput | AgendamentoScalarWhereInput[]
    OR?: AgendamentoScalarWhereInput[]
    NOT?: AgendamentoScalarWhereInput | AgendamentoScalarWhereInput[]
    id?: UuidFilter<"Agendamento"> | string
    nome?: StringFilter<"Agendamento"> | string
    email?: StringFilter<"Agendamento"> | string
    telefone?: StringFilter<"Agendamento"> | string
    dataHora?: DateTimeFilter<"Agendamento"> | Date | string
    produtoId?: StringFilter<"Agendamento"> | string
    duracaoMinutos?: IntFilter<"Agendamento"> | number
    status?: StringFilter<"Agendamento"> | string
    usuarioId?: UuidNullableFilter<"Agendamento"> | string | null
    clienteId?: UuidNullableFilter<"Agendamento"> | string | null
    createdAt?: DateTimeFilter<"Agendamento"> | Date | string
    updatedAt?: DateTimeFilter<"Agendamento"> | Date | string
  }

  export type UsuarioCreateWithoutNotificacoesInput = {
    id: string
    email: string
    nome?: string | null
    tipo?: $Enums.TipoUsuario
    bucketRootPath?: string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    agendamentos?: AgendamentoCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutNotificacoesInput = {
    id: string
    email: string
    nome?: string | null
    tipo?: $Enums.TipoUsuario
    bucketRootPath?: string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    agendamentos?: AgendamentoUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutNotificacoesInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutNotificacoesInput, UsuarioUncheckedCreateWithoutNotificacoesInput>
  }

  export type UsuarioUpsertWithoutNotificacoesInput = {
    update: XOR<UsuarioUpdateWithoutNotificacoesInput, UsuarioUncheckedUpdateWithoutNotificacoesInput>
    create: XOR<UsuarioCreateWithoutNotificacoesInput, UsuarioUncheckedCreateWithoutNotificacoesInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutNotificacoesInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutNotificacoesInput, UsuarioUncheckedUpdateWithoutNotificacoesInput>
  }

  export type UsuarioUpdateWithoutNotificacoesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: EnumTipoUsuarioFieldUpdateOperationsInput | $Enums.TipoUsuario
    bucketRootPath?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    agendamentos?: AgendamentoUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutNotificacoesInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: EnumTipoUsuarioFieldUpdateOperationsInput | $Enums.TipoUsuario
    bucketRootPath?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    agendamentos?: AgendamentoUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type DocumentoCreateWithoutProcessoInput = {
    id?: string
    clienteId: string
    tipo: string
    nomeOriginal: string
    nomeArquivo: string
    storagePath: string
    publicUrl?: string | null
    contentType?: string | null
    tamanho?: number | null
    status?: $Enums.StatusDocumento
    apostilado?: boolean
    traduzido?: boolean
    motivoRejeicao?: string | null
    analisadoPor?: string | null
    analisadoEm?: Date | string | null
    solicitadoPeloJuridico?: boolean
    dataSolicitacaoJuridico?: Date | string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    dependente?: DependenteCreateNestedOneWithoutDocumentosInput
    requerimento?: RequerimentoCreateNestedOneWithoutDocumentosInput
    apostilamento?: ApostilamentoCreateNestedOneWithoutDocumentoInput
  }

  export type DocumentoUncheckedCreateWithoutProcessoInput = {
    id?: string
    clienteId: string
    dependenteId?: string | null
    requerimentoId?: string | null
    tipo: string
    nomeOriginal: string
    nomeArquivo: string
    storagePath: string
    publicUrl?: string | null
    contentType?: string | null
    tamanho?: number | null
    status?: $Enums.StatusDocumento
    apostilado?: boolean
    traduzido?: boolean
    motivoRejeicao?: string | null
    analisadoPor?: string | null
    analisadoEm?: Date | string | null
    solicitadoPeloJuridico?: boolean
    dataSolicitacaoJuridico?: Date | string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    apostilamento?: ApostilamentoUncheckedCreateNestedOneWithoutDocumentoInput
  }

  export type DocumentoCreateOrConnectWithoutProcessoInput = {
    where: DocumentoWhereUniqueInput
    create: XOR<DocumentoCreateWithoutProcessoInput, DocumentoUncheckedCreateWithoutProcessoInput>
  }

  export type DocumentoCreateManyProcessoInputEnvelope = {
    data: DocumentoCreateManyProcessoInput | DocumentoCreateManyProcessoInput[]
    skipDuplicates?: boolean
  }

  export type DocumentoUpsertWithWhereUniqueWithoutProcessoInput = {
    where: DocumentoWhereUniqueInput
    update: XOR<DocumentoUpdateWithoutProcessoInput, DocumentoUncheckedUpdateWithoutProcessoInput>
    create: XOR<DocumentoCreateWithoutProcessoInput, DocumentoUncheckedCreateWithoutProcessoInput>
  }

  export type DocumentoUpdateWithWhereUniqueWithoutProcessoInput = {
    where: DocumentoWhereUniqueInput
    data: XOR<DocumentoUpdateWithoutProcessoInput, DocumentoUncheckedUpdateWithoutProcessoInput>
  }

  export type DocumentoUpdateManyWithWhereWithoutProcessoInput = {
    where: DocumentoScalarWhereInput
    data: XOR<DocumentoUpdateManyMutationInput, DocumentoUncheckedUpdateManyWithoutProcessoInput>
  }

  export type DocumentoScalarWhereInput = {
    AND?: DocumentoScalarWhereInput | DocumentoScalarWhereInput[]
    OR?: DocumentoScalarWhereInput[]
    NOT?: DocumentoScalarWhereInput | DocumentoScalarWhereInput[]
    id?: UuidFilter<"Documento"> | string
    clienteId?: UuidFilter<"Documento"> | string
    processoId?: UuidNullableFilter<"Documento"> | string | null
    dependenteId?: UuidNullableFilter<"Documento"> | string | null
    requerimentoId?: UuidNullableFilter<"Documento"> | string | null
    tipo?: StringFilter<"Documento"> | string
    nomeOriginal?: StringFilter<"Documento"> | string
    nomeArquivo?: StringFilter<"Documento"> | string
    storagePath?: StringFilter<"Documento"> | string
    publicUrl?: StringNullableFilter<"Documento"> | string | null
    contentType?: StringNullableFilter<"Documento"> | string | null
    tamanho?: IntNullableFilter<"Documento"> | number | null
    status?: EnumStatusDocumentoFilter<"Documento"> | $Enums.StatusDocumento
    apostilado?: BoolFilter<"Documento"> | boolean
    traduzido?: BoolFilter<"Documento"> | boolean
    motivoRejeicao?: StringNullableFilter<"Documento"> | string | null
    analisadoPor?: UuidNullableFilter<"Documento"> | string | null
    analisadoEm?: DateTimeNullableFilter<"Documento"> | Date | string | null
    solicitadoPeloJuridico?: BoolFilter<"Documento"> | boolean
    dataSolicitacaoJuridico?: DateTimeNullableFilter<"Documento"> | Date | string | null
    criadoEm?: DateTimeFilter<"Documento"> | Date | string
    atualizadoEm?: DateTimeFilter<"Documento"> | Date | string
  }

  export type DocumentoCreateWithoutDependenteInput = {
    id?: string
    clienteId: string
    tipo: string
    nomeOriginal: string
    nomeArquivo: string
    storagePath: string
    publicUrl?: string | null
    contentType?: string | null
    tamanho?: number | null
    status?: $Enums.StatusDocumento
    apostilado?: boolean
    traduzido?: boolean
    motivoRejeicao?: string | null
    analisadoPor?: string | null
    analisadoEm?: Date | string | null
    solicitadoPeloJuridico?: boolean
    dataSolicitacaoJuridico?: Date | string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    processo?: ProcessoCreateNestedOneWithoutDocumentosInput
    requerimento?: RequerimentoCreateNestedOneWithoutDocumentosInput
    apostilamento?: ApostilamentoCreateNestedOneWithoutDocumentoInput
  }

  export type DocumentoUncheckedCreateWithoutDependenteInput = {
    id?: string
    clienteId: string
    processoId?: string | null
    requerimentoId?: string | null
    tipo: string
    nomeOriginal: string
    nomeArquivo: string
    storagePath: string
    publicUrl?: string | null
    contentType?: string | null
    tamanho?: number | null
    status?: $Enums.StatusDocumento
    apostilado?: boolean
    traduzido?: boolean
    motivoRejeicao?: string | null
    analisadoPor?: string | null
    analisadoEm?: Date | string | null
    solicitadoPeloJuridico?: boolean
    dataSolicitacaoJuridico?: Date | string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    apostilamento?: ApostilamentoUncheckedCreateNestedOneWithoutDocumentoInput
  }

  export type DocumentoCreateOrConnectWithoutDependenteInput = {
    where: DocumentoWhereUniqueInput
    create: XOR<DocumentoCreateWithoutDependenteInput, DocumentoUncheckedCreateWithoutDependenteInput>
  }

  export type DocumentoCreateManyDependenteInputEnvelope = {
    data: DocumentoCreateManyDependenteInput | DocumentoCreateManyDependenteInput[]
    skipDuplicates?: boolean
  }

  export type DocumentoUpsertWithWhereUniqueWithoutDependenteInput = {
    where: DocumentoWhereUniqueInput
    update: XOR<DocumentoUpdateWithoutDependenteInput, DocumentoUncheckedUpdateWithoutDependenteInput>
    create: XOR<DocumentoCreateWithoutDependenteInput, DocumentoUncheckedCreateWithoutDependenteInput>
  }

  export type DocumentoUpdateWithWhereUniqueWithoutDependenteInput = {
    where: DocumentoWhereUniqueInput
    data: XOR<DocumentoUpdateWithoutDependenteInput, DocumentoUncheckedUpdateWithoutDependenteInput>
  }

  export type DocumentoUpdateManyWithWhereWithoutDependenteInput = {
    where: DocumentoScalarWhereInput
    data: XOR<DocumentoUpdateManyMutationInput, DocumentoUncheckedUpdateManyWithoutDependenteInput>
  }

  export type DocumentoCreateWithoutRequerimentoInput = {
    id?: string
    clienteId: string
    tipo: string
    nomeOriginal: string
    nomeArquivo: string
    storagePath: string
    publicUrl?: string | null
    contentType?: string | null
    tamanho?: number | null
    status?: $Enums.StatusDocumento
    apostilado?: boolean
    traduzido?: boolean
    motivoRejeicao?: string | null
    analisadoPor?: string | null
    analisadoEm?: Date | string | null
    solicitadoPeloJuridico?: boolean
    dataSolicitacaoJuridico?: Date | string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    processo?: ProcessoCreateNestedOneWithoutDocumentosInput
    dependente?: DependenteCreateNestedOneWithoutDocumentosInput
    apostilamento?: ApostilamentoCreateNestedOneWithoutDocumentoInput
  }

  export type DocumentoUncheckedCreateWithoutRequerimentoInput = {
    id?: string
    clienteId: string
    processoId?: string | null
    dependenteId?: string | null
    tipo: string
    nomeOriginal: string
    nomeArquivo: string
    storagePath: string
    publicUrl?: string | null
    contentType?: string | null
    tamanho?: number | null
    status?: $Enums.StatusDocumento
    apostilado?: boolean
    traduzido?: boolean
    motivoRejeicao?: string | null
    analisadoPor?: string | null
    analisadoEm?: Date | string | null
    solicitadoPeloJuridico?: boolean
    dataSolicitacaoJuridico?: Date | string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    apostilamento?: ApostilamentoUncheckedCreateNestedOneWithoutDocumentoInput
  }

  export type DocumentoCreateOrConnectWithoutRequerimentoInput = {
    where: DocumentoWhereUniqueInput
    create: XOR<DocumentoCreateWithoutRequerimentoInput, DocumentoUncheckedCreateWithoutRequerimentoInput>
  }

  export type DocumentoCreateManyRequerimentoInputEnvelope = {
    data: DocumentoCreateManyRequerimentoInput | DocumentoCreateManyRequerimentoInput[]
    skipDuplicates?: boolean
  }

  export type DocumentoUpsertWithWhereUniqueWithoutRequerimentoInput = {
    where: DocumentoWhereUniqueInput
    update: XOR<DocumentoUpdateWithoutRequerimentoInput, DocumentoUncheckedUpdateWithoutRequerimentoInput>
    create: XOR<DocumentoCreateWithoutRequerimentoInput, DocumentoUncheckedCreateWithoutRequerimentoInput>
  }

  export type DocumentoUpdateWithWhereUniqueWithoutRequerimentoInput = {
    where: DocumentoWhereUniqueInput
    data: XOR<DocumentoUpdateWithoutRequerimentoInput, DocumentoUncheckedUpdateWithoutRequerimentoInput>
  }

  export type DocumentoUpdateManyWithWhereWithoutRequerimentoInput = {
    where: DocumentoScalarWhereInput
    data: XOR<DocumentoUpdateManyMutationInput, DocumentoUncheckedUpdateManyWithoutRequerimentoInput>
  }

  export type ProcessoCreateWithoutDocumentosInput = {
    id?: string
  }

  export type ProcessoUncheckedCreateWithoutDocumentosInput = {
    id?: string
  }

  export type ProcessoCreateOrConnectWithoutDocumentosInput = {
    where: ProcessoWhereUniqueInput
    create: XOR<ProcessoCreateWithoutDocumentosInput, ProcessoUncheckedCreateWithoutDocumentosInput>
  }

  export type DependenteCreateWithoutDocumentosInput = {
    id?: string
  }

  export type DependenteUncheckedCreateWithoutDocumentosInput = {
    id?: string
  }

  export type DependenteCreateOrConnectWithoutDocumentosInput = {
    where: DependenteWhereUniqueInput
    create: XOR<DependenteCreateWithoutDocumentosInput, DependenteUncheckedCreateWithoutDocumentosInput>
  }

  export type RequerimentoCreateWithoutDocumentosInput = {
    id?: string
    clienteId: string
    processoId?: string | null
    tipo: string
    status?: string
    observacoes?: string | null
    criadorId?: string | null
    createdAt?: Date | string
    updated_at?: Date | string
  }

  export type RequerimentoUncheckedCreateWithoutDocumentosInput = {
    id?: string
    clienteId: string
    processoId?: string | null
    tipo: string
    status?: string
    observacoes?: string | null
    criadorId?: string | null
    createdAt?: Date | string
    updated_at?: Date | string
  }

  export type RequerimentoCreateOrConnectWithoutDocumentosInput = {
    where: RequerimentoWhereUniqueInput
    create: XOR<RequerimentoCreateWithoutDocumentosInput, RequerimentoUncheckedCreateWithoutDocumentosInput>
  }

  export type ApostilamentoCreateWithoutDocumentoInput = {
    id?: string
    status?: string
    observacoes?: string | null
    solicitadoEm?: Date | string
    concluidoEm?: Date | string | null
  }

  export type ApostilamentoUncheckedCreateWithoutDocumentoInput = {
    id?: string
    status?: string
    observacoes?: string | null
    solicitadoEm?: Date | string
    concluidoEm?: Date | string | null
  }

  export type ApostilamentoCreateOrConnectWithoutDocumentoInput = {
    where: ApostilamentoWhereUniqueInput
    create: XOR<ApostilamentoCreateWithoutDocumentoInput, ApostilamentoUncheckedCreateWithoutDocumentoInput>
  }

  export type ProcessoUpsertWithoutDocumentosInput = {
    update: XOR<ProcessoUpdateWithoutDocumentosInput, ProcessoUncheckedUpdateWithoutDocumentosInput>
    create: XOR<ProcessoCreateWithoutDocumentosInput, ProcessoUncheckedCreateWithoutDocumentosInput>
    where?: ProcessoWhereInput
  }

  export type ProcessoUpdateToOneWithWhereWithoutDocumentosInput = {
    where?: ProcessoWhereInput
    data: XOR<ProcessoUpdateWithoutDocumentosInput, ProcessoUncheckedUpdateWithoutDocumentosInput>
  }

  export type ProcessoUpdateWithoutDocumentosInput = {
    id?: StringFieldUpdateOperationsInput | string
  }

  export type ProcessoUncheckedUpdateWithoutDocumentosInput = {
    id?: StringFieldUpdateOperationsInput | string
  }

  export type DependenteUpsertWithoutDocumentosInput = {
    update: XOR<DependenteUpdateWithoutDocumentosInput, DependenteUncheckedUpdateWithoutDocumentosInput>
    create: XOR<DependenteCreateWithoutDocumentosInput, DependenteUncheckedCreateWithoutDocumentosInput>
    where?: DependenteWhereInput
  }

  export type DependenteUpdateToOneWithWhereWithoutDocumentosInput = {
    where?: DependenteWhereInput
    data: XOR<DependenteUpdateWithoutDocumentosInput, DependenteUncheckedUpdateWithoutDocumentosInput>
  }

  export type DependenteUpdateWithoutDocumentosInput = {
    id?: StringFieldUpdateOperationsInput | string
  }

  export type DependenteUncheckedUpdateWithoutDocumentosInput = {
    id?: StringFieldUpdateOperationsInput | string
  }

  export type RequerimentoUpsertWithoutDocumentosInput = {
    update: XOR<RequerimentoUpdateWithoutDocumentosInput, RequerimentoUncheckedUpdateWithoutDocumentosInput>
    create: XOR<RequerimentoCreateWithoutDocumentosInput, RequerimentoUncheckedCreateWithoutDocumentosInput>
    where?: RequerimentoWhereInput
  }

  export type RequerimentoUpdateToOneWithWhereWithoutDocumentosInput = {
    where?: RequerimentoWhereInput
    data: XOR<RequerimentoUpdateWithoutDocumentosInput, RequerimentoUncheckedUpdateWithoutDocumentosInput>
  }

  export type RequerimentoUpdateWithoutDocumentosInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    processoId?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadorId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequerimentoUncheckedUpdateWithoutDocumentosInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    processoId?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    criadorId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApostilamentoUpsertWithoutDocumentoInput = {
    update: XOR<ApostilamentoUpdateWithoutDocumentoInput, ApostilamentoUncheckedUpdateWithoutDocumentoInput>
    create: XOR<ApostilamentoCreateWithoutDocumentoInput, ApostilamentoUncheckedCreateWithoutDocumentoInput>
    where?: ApostilamentoWhereInput
  }

  export type ApostilamentoUpdateToOneWithWhereWithoutDocumentoInput = {
    where?: ApostilamentoWhereInput
    data: XOR<ApostilamentoUpdateWithoutDocumentoInput, ApostilamentoUncheckedUpdateWithoutDocumentoInput>
  }

  export type ApostilamentoUpdateWithoutDocumentoInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    solicitadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    concluidoEm?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ApostilamentoUncheckedUpdateWithoutDocumentoInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    observacoes?: NullableStringFieldUpdateOperationsInput | string | null
    solicitadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    concluidoEm?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type UsuarioCreateWithoutAgendamentosInput = {
    id: string
    email: string
    nome?: string | null
    tipo?: $Enums.TipoUsuario
    bucketRootPath?: string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    notificacoes?: NotificacaoCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioUncheckedCreateWithoutAgendamentosInput = {
    id: string
    email: string
    nome?: string | null
    tipo?: $Enums.TipoUsuario
    bucketRootPath?: string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    notificacoes?: NotificacaoUncheckedCreateNestedManyWithoutUsuarioInput
  }

  export type UsuarioCreateOrConnectWithoutAgendamentosInput = {
    where: UsuarioWhereUniqueInput
    create: XOR<UsuarioCreateWithoutAgendamentosInput, UsuarioUncheckedCreateWithoutAgendamentosInput>
  }

  export type UsuarioUpsertWithoutAgendamentosInput = {
    update: XOR<UsuarioUpdateWithoutAgendamentosInput, UsuarioUncheckedUpdateWithoutAgendamentosInput>
    create: XOR<UsuarioCreateWithoutAgendamentosInput, UsuarioUncheckedCreateWithoutAgendamentosInput>
    where?: UsuarioWhereInput
  }

  export type UsuarioUpdateToOneWithWhereWithoutAgendamentosInput = {
    where?: UsuarioWhereInput
    data: XOR<UsuarioUpdateWithoutAgendamentosInput, UsuarioUncheckedUpdateWithoutAgendamentosInput>
  }

  export type UsuarioUpdateWithoutAgendamentosInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: EnumTipoUsuarioFieldUpdateOperationsInput | $Enums.TipoUsuario
    bucketRootPath?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    notificacoes?: NotificacaoUpdateManyWithoutUsuarioNestedInput
  }

  export type UsuarioUncheckedUpdateWithoutAgendamentosInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    nome?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: EnumTipoUsuarioFieldUpdateOperationsInput | $Enums.TipoUsuario
    bucketRootPath?: NullableStringFieldUpdateOperationsInput | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    notificacoes?: NotificacaoUncheckedUpdateManyWithoutUsuarioNestedInput
  }

  export type ServicoRequisitoCreateWithoutServicoInput = {
    id?: string
    nome: string
    etapa: string
    obrigatorio?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ServicoRequisitoUncheckedCreateWithoutServicoInput = {
    id?: string
    nome: string
    etapa: string
    obrigatorio?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ServicoRequisitoCreateOrConnectWithoutServicoInput = {
    where: ServicoRequisitoWhereUniqueInput
    create: XOR<ServicoRequisitoCreateWithoutServicoInput, ServicoRequisitoUncheckedCreateWithoutServicoInput>
  }

  export type ServicoRequisitoCreateManyServicoInputEnvelope = {
    data: ServicoRequisitoCreateManyServicoInput | ServicoRequisitoCreateManyServicoInput[]
    skipDuplicates?: boolean
  }

  export type ServicoRequisitoUpsertWithWhereUniqueWithoutServicoInput = {
    where: ServicoRequisitoWhereUniqueInput
    update: XOR<ServicoRequisitoUpdateWithoutServicoInput, ServicoRequisitoUncheckedUpdateWithoutServicoInput>
    create: XOR<ServicoRequisitoCreateWithoutServicoInput, ServicoRequisitoUncheckedCreateWithoutServicoInput>
  }

  export type ServicoRequisitoUpdateWithWhereUniqueWithoutServicoInput = {
    where: ServicoRequisitoWhereUniqueInput
    data: XOR<ServicoRequisitoUpdateWithoutServicoInput, ServicoRequisitoUncheckedUpdateWithoutServicoInput>
  }

  export type ServicoRequisitoUpdateManyWithWhereWithoutServicoInput = {
    where: ServicoRequisitoScalarWhereInput
    data: XOR<ServicoRequisitoUpdateManyMutationInput, ServicoRequisitoUncheckedUpdateManyWithoutServicoInput>
  }

  export type ServicoRequisitoScalarWhereInput = {
    AND?: ServicoRequisitoScalarWhereInput | ServicoRequisitoScalarWhereInput[]
    OR?: ServicoRequisitoScalarWhereInput[]
    NOT?: ServicoRequisitoScalarWhereInput | ServicoRequisitoScalarWhereInput[]
    id?: UuidFilter<"ServicoRequisito"> | string
    servicoId?: UuidFilter<"ServicoRequisito"> | string
    nome?: StringFilter<"ServicoRequisito"> | string
    etapa?: StringFilter<"ServicoRequisito"> | string
    obrigatorio?: BoolFilter<"ServicoRequisito"> | boolean
    createdAt?: DateTimeFilter<"ServicoRequisito"> | Date | string
    updatedAt?: DateTimeFilter<"ServicoRequisito"> | Date | string
  }

  export type CatalogoServicoCreateWithoutRequisitosInput = {
    id?: string
    nome: string
    valor?: Decimal | DecimalJsLike | number | string
    duracao?: string | null
    exibirComercial?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CatalogoServicoUncheckedCreateWithoutRequisitosInput = {
    id?: string
    nome: string
    valor?: Decimal | DecimalJsLike | number | string
    duracao?: string | null
    exibirComercial?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type CatalogoServicoCreateOrConnectWithoutRequisitosInput = {
    where: CatalogoServicoWhereUniqueInput
    create: XOR<CatalogoServicoCreateWithoutRequisitosInput, CatalogoServicoUncheckedCreateWithoutRequisitosInput>
  }

  export type CatalogoServicoUpsertWithoutRequisitosInput = {
    update: XOR<CatalogoServicoUpdateWithoutRequisitosInput, CatalogoServicoUncheckedUpdateWithoutRequisitosInput>
    create: XOR<CatalogoServicoCreateWithoutRequisitosInput, CatalogoServicoUncheckedCreateWithoutRequisitosInput>
    where?: CatalogoServicoWhereInput
  }

  export type CatalogoServicoUpdateToOneWithWhereWithoutRequisitosInput = {
    where?: CatalogoServicoWhereInput
    data: XOR<CatalogoServicoUpdateWithoutRequisitosInput, CatalogoServicoUncheckedUpdateWithoutRequisitosInput>
  }

  export type CatalogoServicoUpdateWithoutRequisitosInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    valor?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    duracao?: NullableStringFieldUpdateOperationsInput | string | null
    exibirComercial?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type CatalogoServicoUncheckedUpdateWithoutRequisitosInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    valor?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    duracao?: NullableStringFieldUpdateOperationsInput | string | null
    exibirComercial?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentoCreateWithoutApostilamentoInput = {
    id?: string
    clienteId: string
    tipo: string
    nomeOriginal: string
    nomeArquivo: string
    storagePath: string
    publicUrl?: string | null
    contentType?: string | null
    tamanho?: number | null
    status?: $Enums.StatusDocumento
    apostilado?: boolean
    traduzido?: boolean
    motivoRejeicao?: string | null
    analisadoPor?: string | null
    analisadoEm?: Date | string | null
    solicitadoPeloJuridico?: boolean
    dataSolicitacaoJuridico?: Date | string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
    processo?: ProcessoCreateNestedOneWithoutDocumentosInput
    dependente?: DependenteCreateNestedOneWithoutDocumentosInput
    requerimento?: RequerimentoCreateNestedOneWithoutDocumentosInput
  }

  export type DocumentoUncheckedCreateWithoutApostilamentoInput = {
    id?: string
    clienteId: string
    processoId?: string | null
    dependenteId?: string | null
    requerimentoId?: string | null
    tipo: string
    nomeOriginal: string
    nomeArquivo: string
    storagePath: string
    publicUrl?: string | null
    contentType?: string | null
    tamanho?: number | null
    status?: $Enums.StatusDocumento
    apostilado?: boolean
    traduzido?: boolean
    motivoRejeicao?: string | null
    analisadoPor?: string | null
    analisadoEm?: Date | string | null
    solicitadoPeloJuridico?: boolean
    dataSolicitacaoJuridico?: Date | string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
  }

  export type DocumentoCreateOrConnectWithoutApostilamentoInput = {
    where: DocumentoWhereUniqueInput
    create: XOR<DocumentoCreateWithoutApostilamentoInput, DocumentoUncheckedCreateWithoutApostilamentoInput>
  }

  export type DocumentoUpsertWithoutApostilamentoInput = {
    update: XOR<DocumentoUpdateWithoutApostilamentoInput, DocumentoUncheckedUpdateWithoutApostilamentoInput>
    create: XOR<DocumentoCreateWithoutApostilamentoInput, DocumentoUncheckedCreateWithoutApostilamentoInput>
    where?: DocumentoWhereInput
  }

  export type DocumentoUpdateToOneWithWhereWithoutApostilamentoInput = {
    where?: DocumentoWhereInput
    data: XOR<DocumentoUpdateWithoutApostilamentoInput, DocumentoUncheckedUpdateWithoutApostilamentoInput>
  }

  export type DocumentoUpdateWithoutApostilamentoInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    nomeOriginal?: StringFieldUpdateOperationsInput | string
    nomeArquivo?: StringFieldUpdateOperationsInput | string
    storagePath?: StringFieldUpdateOperationsInput | string
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    contentType?: NullableStringFieldUpdateOperationsInput | string | null
    tamanho?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumStatusDocumentoFieldUpdateOperationsInput | $Enums.StatusDocumento
    apostilado?: BoolFieldUpdateOperationsInput | boolean
    traduzido?: BoolFieldUpdateOperationsInput | boolean
    motivoRejeicao?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoEm?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    solicitadoPeloJuridico?: BoolFieldUpdateOperationsInput | boolean
    dataSolicitacaoJuridico?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    processo?: ProcessoUpdateOneWithoutDocumentosNestedInput
    dependente?: DependenteUpdateOneWithoutDocumentosNestedInput
    requerimento?: RequerimentoUpdateOneWithoutDocumentosNestedInput
  }

  export type DocumentoUncheckedUpdateWithoutApostilamentoInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    processoId?: NullableStringFieldUpdateOperationsInput | string | null
    dependenteId?: NullableStringFieldUpdateOperationsInput | string | null
    requerimentoId?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    nomeOriginal?: StringFieldUpdateOperationsInput | string
    nomeArquivo?: StringFieldUpdateOperationsInput | string
    storagePath?: StringFieldUpdateOperationsInput | string
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    contentType?: NullableStringFieldUpdateOperationsInput | string | null
    tamanho?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumStatusDocumentoFieldUpdateOperationsInput | $Enums.StatusDocumento
    apostilado?: BoolFieldUpdateOperationsInput | boolean
    traduzido?: BoolFieldUpdateOperationsInput | boolean
    motivoRejeicao?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoEm?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    solicitadoPeloJuridico?: BoolFieldUpdateOperationsInput | boolean
    dataSolicitacaoJuridico?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificacaoCreateManyUsuarioInput = {
    id?: string
    titulo: string
    mensagem: string
    lida?: boolean
    tipo?: string
    dataPrazo?: Date | string | null
    criadoEm?: Date | string
    clienteId?: string | null
    criadorId?: string | null
  }

  export type AgendamentoCreateManyUsuarioInput = {
    id?: string
    nome: string
    email: string
    telefone: string
    dataHora: Date | string
    produtoId: string
    duracaoMinutos?: number
    status?: string
    clienteId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type NotificacaoUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    mensagem?: StringFieldUpdateOperationsInput | string
    lida?: BoolFieldUpdateOperationsInput | boolean
    tipo?: StringFieldUpdateOperationsInput | string
    dataPrazo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: NullableStringFieldUpdateOperationsInput | string | null
    criadorId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type NotificacaoUncheckedUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    mensagem?: StringFieldUpdateOperationsInput | string
    lida?: BoolFieldUpdateOperationsInput | boolean
    tipo?: StringFieldUpdateOperationsInput | string
    dataPrazo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: NullableStringFieldUpdateOperationsInput | string | null
    criadorId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type NotificacaoUncheckedUpdateManyWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    mensagem?: StringFieldUpdateOperationsInput | string
    lida?: BoolFieldUpdateOperationsInput | boolean
    tipo?: StringFieldUpdateOperationsInput | string
    dataPrazo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    clienteId?: NullableStringFieldUpdateOperationsInput | string | null
    criadorId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AgendamentoUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefone?: StringFieldUpdateOperationsInput | string
    dataHora?: DateTimeFieldUpdateOperationsInput | Date | string
    produtoId?: StringFieldUpdateOperationsInput | string
    duracaoMinutos?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    clienteId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgendamentoUncheckedUpdateWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefone?: StringFieldUpdateOperationsInput | string
    dataHora?: DateTimeFieldUpdateOperationsInput | Date | string
    produtoId?: StringFieldUpdateOperationsInput | string
    duracaoMinutos?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    clienteId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AgendamentoUncheckedUpdateManyWithoutUsuarioInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    telefone?: StringFieldUpdateOperationsInput | string
    dataHora?: DateTimeFieldUpdateOperationsInput | Date | string
    produtoId?: StringFieldUpdateOperationsInput | string
    duracaoMinutos?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    clienteId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentoCreateManyProcessoInput = {
    id?: string
    clienteId: string
    dependenteId?: string | null
    requerimentoId?: string | null
    tipo: string
    nomeOriginal: string
    nomeArquivo: string
    storagePath: string
    publicUrl?: string | null
    contentType?: string | null
    tamanho?: number | null
    status?: $Enums.StatusDocumento
    apostilado?: boolean
    traduzido?: boolean
    motivoRejeicao?: string | null
    analisadoPor?: string | null
    analisadoEm?: Date | string | null
    solicitadoPeloJuridico?: boolean
    dataSolicitacaoJuridico?: Date | string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
  }

  export type DocumentoUpdateWithoutProcessoInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    nomeOriginal?: StringFieldUpdateOperationsInput | string
    nomeArquivo?: StringFieldUpdateOperationsInput | string
    storagePath?: StringFieldUpdateOperationsInput | string
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    contentType?: NullableStringFieldUpdateOperationsInput | string | null
    tamanho?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumStatusDocumentoFieldUpdateOperationsInput | $Enums.StatusDocumento
    apostilado?: BoolFieldUpdateOperationsInput | boolean
    traduzido?: BoolFieldUpdateOperationsInput | boolean
    motivoRejeicao?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoEm?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    solicitadoPeloJuridico?: BoolFieldUpdateOperationsInput | boolean
    dataSolicitacaoJuridico?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    dependente?: DependenteUpdateOneWithoutDocumentosNestedInput
    requerimento?: RequerimentoUpdateOneWithoutDocumentosNestedInput
    apostilamento?: ApostilamentoUpdateOneWithoutDocumentoNestedInput
  }

  export type DocumentoUncheckedUpdateWithoutProcessoInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    dependenteId?: NullableStringFieldUpdateOperationsInput | string | null
    requerimentoId?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    nomeOriginal?: StringFieldUpdateOperationsInput | string
    nomeArquivo?: StringFieldUpdateOperationsInput | string
    storagePath?: StringFieldUpdateOperationsInput | string
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    contentType?: NullableStringFieldUpdateOperationsInput | string | null
    tamanho?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumStatusDocumentoFieldUpdateOperationsInput | $Enums.StatusDocumento
    apostilado?: BoolFieldUpdateOperationsInput | boolean
    traduzido?: BoolFieldUpdateOperationsInput | boolean
    motivoRejeicao?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoEm?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    solicitadoPeloJuridico?: BoolFieldUpdateOperationsInput | boolean
    dataSolicitacaoJuridico?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    apostilamento?: ApostilamentoUncheckedUpdateOneWithoutDocumentoNestedInput
  }

  export type DocumentoUncheckedUpdateManyWithoutProcessoInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    dependenteId?: NullableStringFieldUpdateOperationsInput | string | null
    requerimentoId?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    nomeOriginal?: StringFieldUpdateOperationsInput | string
    nomeArquivo?: StringFieldUpdateOperationsInput | string
    storagePath?: StringFieldUpdateOperationsInput | string
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    contentType?: NullableStringFieldUpdateOperationsInput | string | null
    tamanho?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumStatusDocumentoFieldUpdateOperationsInput | $Enums.StatusDocumento
    apostilado?: BoolFieldUpdateOperationsInput | boolean
    traduzido?: BoolFieldUpdateOperationsInput | boolean
    motivoRejeicao?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoEm?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    solicitadoPeloJuridico?: BoolFieldUpdateOperationsInput | boolean
    dataSolicitacaoJuridico?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentoCreateManyDependenteInput = {
    id?: string
    clienteId: string
    processoId?: string | null
    requerimentoId?: string | null
    tipo: string
    nomeOriginal: string
    nomeArquivo: string
    storagePath: string
    publicUrl?: string | null
    contentType?: string | null
    tamanho?: number | null
    status?: $Enums.StatusDocumento
    apostilado?: boolean
    traduzido?: boolean
    motivoRejeicao?: string | null
    analisadoPor?: string | null
    analisadoEm?: Date | string | null
    solicitadoPeloJuridico?: boolean
    dataSolicitacaoJuridico?: Date | string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
  }

  export type DocumentoUpdateWithoutDependenteInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    nomeOriginal?: StringFieldUpdateOperationsInput | string
    nomeArquivo?: StringFieldUpdateOperationsInput | string
    storagePath?: StringFieldUpdateOperationsInput | string
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    contentType?: NullableStringFieldUpdateOperationsInput | string | null
    tamanho?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumStatusDocumentoFieldUpdateOperationsInput | $Enums.StatusDocumento
    apostilado?: BoolFieldUpdateOperationsInput | boolean
    traduzido?: BoolFieldUpdateOperationsInput | boolean
    motivoRejeicao?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoEm?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    solicitadoPeloJuridico?: BoolFieldUpdateOperationsInput | boolean
    dataSolicitacaoJuridico?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    processo?: ProcessoUpdateOneWithoutDocumentosNestedInput
    requerimento?: RequerimentoUpdateOneWithoutDocumentosNestedInput
    apostilamento?: ApostilamentoUpdateOneWithoutDocumentoNestedInput
  }

  export type DocumentoUncheckedUpdateWithoutDependenteInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    processoId?: NullableStringFieldUpdateOperationsInput | string | null
    requerimentoId?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    nomeOriginal?: StringFieldUpdateOperationsInput | string
    nomeArquivo?: StringFieldUpdateOperationsInput | string
    storagePath?: StringFieldUpdateOperationsInput | string
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    contentType?: NullableStringFieldUpdateOperationsInput | string | null
    tamanho?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumStatusDocumentoFieldUpdateOperationsInput | $Enums.StatusDocumento
    apostilado?: BoolFieldUpdateOperationsInput | boolean
    traduzido?: BoolFieldUpdateOperationsInput | boolean
    motivoRejeicao?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoEm?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    solicitadoPeloJuridico?: BoolFieldUpdateOperationsInput | boolean
    dataSolicitacaoJuridico?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    apostilamento?: ApostilamentoUncheckedUpdateOneWithoutDocumentoNestedInput
  }

  export type DocumentoUncheckedUpdateManyWithoutDependenteInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    processoId?: NullableStringFieldUpdateOperationsInput | string | null
    requerimentoId?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    nomeOriginal?: StringFieldUpdateOperationsInput | string
    nomeArquivo?: StringFieldUpdateOperationsInput | string
    storagePath?: StringFieldUpdateOperationsInput | string
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    contentType?: NullableStringFieldUpdateOperationsInput | string | null
    tamanho?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumStatusDocumentoFieldUpdateOperationsInput | $Enums.StatusDocumento
    apostilado?: BoolFieldUpdateOperationsInput | boolean
    traduzido?: BoolFieldUpdateOperationsInput | boolean
    motivoRejeicao?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoEm?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    solicitadoPeloJuridico?: BoolFieldUpdateOperationsInput | boolean
    dataSolicitacaoJuridico?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DocumentoCreateManyRequerimentoInput = {
    id?: string
    clienteId: string
    processoId?: string | null
    dependenteId?: string | null
    tipo: string
    nomeOriginal: string
    nomeArquivo: string
    storagePath: string
    publicUrl?: string | null
    contentType?: string | null
    tamanho?: number | null
    status?: $Enums.StatusDocumento
    apostilado?: boolean
    traduzido?: boolean
    motivoRejeicao?: string | null
    analisadoPor?: string | null
    analisadoEm?: Date | string | null
    solicitadoPeloJuridico?: boolean
    dataSolicitacaoJuridico?: Date | string | null
    criadoEm?: Date | string
    atualizadoEm?: Date | string
  }

  export type DocumentoUpdateWithoutRequerimentoInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    tipo?: StringFieldUpdateOperationsInput | string
    nomeOriginal?: StringFieldUpdateOperationsInput | string
    nomeArquivo?: StringFieldUpdateOperationsInput | string
    storagePath?: StringFieldUpdateOperationsInput | string
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    contentType?: NullableStringFieldUpdateOperationsInput | string | null
    tamanho?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumStatusDocumentoFieldUpdateOperationsInput | $Enums.StatusDocumento
    apostilado?: BoolFieldUpdateOperationsInput | boolean
    traduzido?: BoolFieldUpdateOperationsInput | boolean
    motivoRejeicao?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoEm?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    solicitadoPeloJuridico?: BoolFieldUpdateOperationsInput | boolean
    dataSolicitacaoJuridico?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    processo?: ProcessoUpdateOneWithoutDocumentosNestedInput
    dependente?: DependenteUpdateOneWithoutDocumentosNestedInput
    apostilamento?: ApostilamentoUpdateOneWithoutDocumentoNestedInput
  }

  export type DocumentoUncheckedUpdateWithoutRequerimentoInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    processoId?: NullableStringFieldUpdateOperationsInput | string | null
    dependenteId?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    nomeOriginal?: StringFieldUpdateOperationsInput | string
    nomeArquivo?: StringFieldUpdateOperationsInput | string
    storagePath?: StringFieldUpdateOperationsInput | string
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    contentType?: NullableStringFieldUpdateOperationsInput | string | null
    tamanho?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumStatusDocumentoFieldUpdateOperationsInput | $Enums.StatusDocumento
    apostilado?: BoolFieldUpdateOperationsInput | boolean
    traduzido?: BoolFieldUpdateOperationsInput | boolean
    motivoRejeicao?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoEm?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    solicitadoPeloJuridico?: BoolFieldUpdateOperationsInput | boolean
    dataSolicitacaoJuridico?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    apostilamento?: ApostilamentoUncheckedUpdateOneWithoutDocumentoNestedInput
  }

  export type DocumentoUncheckedUpdateManyWithoutRequerimentoInput = {
    id?: StringFieldUpdateOperationsInput | string
    clienteId?: StringFieldUpdateOperationsInput | string
    processoId?: NullableStringFieldUpdateOperationsInput | string | null
    dependenteId?: NullableStringFieldUpdateOperationsInput | string | null
    tipo?: StringFieldUpdateOperationsInput | string
    nomeOriginal?: StringFieldUpdateOperationsInput | string
    nomeArquivo?: StringFieldUpdateOperationsInput | string
    storagePath?: StringFieldUpdateOperationsInput | string
    publicUrl?: NullableStringFieldUpdateOperationsInput | string | null
    contentType?: NullableStringFieldUpdateOperationsInput | string | null
    tamanho?: NullableIntFieldUpdateOperationsInput | number | null
    status?: EnumStatusDocumentoFieldUpdateOperationsInput | $Enums.StatusDocumento
    apostilado?: BoolFieldUpdateOperationsInput | boolean
    traduzido?: BoolFieldUpdateOperationsInput | boolean
    motivoRejeicao?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoPor?: NullableStringFieldUpdateOperationsInput | string | null
    analisadoEm?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    solicitadoPeloJuridico?: BoolFieldUpdateOperationsInput | boolean
    dataSolicitacaoJuridico?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    criadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
    atualizadoEm?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServicoRequisitoCreateManyServicoInput = {
    id?: string
    nome: string
    etapa: string
    obrigatorio?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ServicoRequisitoUpdateWithoutServicoInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    etapa?: StringFieldUpdateOperationsInput | string
    obrigatorio?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServicoRequisitoUncheckedUpdateWithoutServicoInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    etapa?: StringFieldUpdateOperationsInput | string
    obrigatorio?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ServicoRequisitoUncheckedUpdateManyWithoutServicoInput = {
    id?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    etapa?: StringFieldUpdateOperationsInput | string
    obrigatorio?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use UsuarioCountOutputTypeDefaultArgs instead
     */
    export type UsuarioCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UsuarioCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProcessoCountOutputTypeDefaultArgs instead
     */
    export type ProcessoCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessoCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DependenteCountOutputTypeDefaultArgs instead
     */
    export type DependenteCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DependenteCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RequerimentoCountOutputTypeDefaultArgs instead
     */
    export type RequerimentoCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RequerimentoCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CatalogoServicoCountOutputTypeDefaultArgs instead
     */
    export type CatalogoServicoCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CatalogoServicoCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UsuarioDefaultArgs instead
     */
    export type UsuarioArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UsuarioDefaultArgs<ExtArgs>
    /**
     * @deprecated Use NotificacaoDefaultArgs instead
     */
    export type NotificacaoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = NotificacaoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProcessoDefaultArgs instead
     */
    export type ProcessoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProcessoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DependenteDefaultArgs instead
     */
    export type DependenteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DependenteDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RequerimentoDefaultArgs instead
     */
    export type RequerimentoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RequerimentoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DocumentoDefaultArgs instead
     */
    export type DocumentoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DocumentoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ConfiguracaoDefaultArgs instead
     */
    export type ConfiguracaoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ConfiguracaoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AgendamentoDefaultArgs instead
     */
    export type AgendamentoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AgendamentoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use CatalogoServicoDefaultArgs instead
     */
    export type CatalogoServicoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = CatalogoServicoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ServicoRequisitoDefaultArgs instead
     */
    export type ServicoRequisitoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ServicoRequisitoDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AssessoriaJuridicaDefaultArgs instead
     */
    export type AssessoriaJuridicaArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AssessoriaJuridicaDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ApostilamentoDefaultArgs instead
     */
    export type ApostilamentoArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ApostilamentoDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}