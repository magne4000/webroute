import { AnyCompiledRoute, CompiledRoute, RouteParams } from "./handler/types";
import { Def } from "./handler/util";

export type InferPart<
  TRoute extends AnyCompiledRoute,
  TPart extends keyof RouteParams
> = TRoute extends CompiledRoute<infer TParams> ? TParams[TPart] : never;

export type InferBodyIn<TRoute extends AnyCompiledRoute> = InferPart<
  TRoute,
  "BodyIn"
>;
export type InferBodyOut<TRoute extends AnyCompiledRoute> = InferPart<
  TRoute,
  "BodyOut"
>;

export type InferQueryIn<TRoute extends AnyCompiledRoute> = InferPart<
  TRoute,
  "QueryIn"
>;
export type InferQueryOut<TRoute extends AnyCompiledRoute> = InferPart<
  TRoute,
  "QueryOut"
>;

export type InferParamsIn<TRoute extends AnyCompiledRoute> = InferPart<
  TRoute,
  "ParamsIn"
> extends infer TParamsIn extends {}
  ? TParamsIn
  : InferPart<TRoute, "InferredParams">;
export type InferParamsOut<TRoute extends AnyCompiledRoute> = InferPart<
  TRoute,
  "ParamsOut"
> extends infer TParamsOut extends {}
  ? TParamsOut
  : InferPart<TRoute, "InferredParams">;

export type InferOutputIn<TRoute extends AnyCompiledRoute> = InferPart<
  TRoute,
  "OutputIn"
>;
export type InferOutputOut<TRoute extends AnyCompiledRoute> = InferPart<
  TRoute,
  "OutputOut"
>;

export type InferMeta<TRoute extends AnyCompiledRoute> = InferPart<
  TRoute,
  "Meta"
>;

export type InferPath<TRoute extends AnyCompiledRoute> = InferPart<
  TRoute,
  "Path"
>;

export type InferMethods<TRoute extends AnyCompiledRoute> = InferPart<
  TRoute,
  "Methods"
>;

export type InferProviders<TRoute extends AnyCompiledRoute> = InferPart<
  TRoute,
  "Providers"
>;

export type InferState<TRoute extends AnyCompiledRoute> = InferPart<
  TRoute,
  "State"
>;

export interface DefinedRouteDef<TParams extends RouteParams> {
  ParamsIn: unknown extends TParams["ParamsIn"]
    ? [TParams["InferredParams"]] extends [never]
      ? unknown
      : TParams["InferredParams"]
    : TParams["ParamsIn"];
  ParamsOut: unknown extends TParams["ParamsOut"]
    ? [TParams["InferredParams"]] extends [never]
      ? unknown
      : TParams["InferredParams"]
    : TParams["ParamsOut"];
  BodyIn: TParams["BodyIn"];
  BodyOut: TParams["BodyOut"];
  QueryIn: TParams["QueryIn"];
  QueryOut: TParams["QueryOut"];
  OutputIn: TParams["OutputIn"];
  OutputOut: TParams["OutputOut"];
  HeadersIn: TParams["HeadersReqIn"];
  HeadersOut: TParams["HeadersReqOut"];
  Path: TParams["Path"];
}

export type InferRouteDef<TRoute extends AnyCompiledRoute> =
  TRoute extends CompiledRoute<infer TParams>
    ? DefinedRouteDef<TParams>
    : never;

/**
 * Get the path of the route
 */
export const getPath = <T extends AnyCompiledRoute>(route: T): InferPath<T> => {
  return route[Def].path;
};

/**
 * Gets all operation keys in the form `{METHOD} {pathPattern}`.
 * Will return an empty array if either `methods` or `path` are undefined.
 */
export const getOperationKeys = <T extends AnyCompiledRoute>(
  route: T
): InferPath<T> extends infer $Path extends string
  ? InferMethods<T> extends infer $Methods extends string
    ? Array<`${Uppercase<$Methods>} ${$Path}`>
    : []
  : [] => {
  const methods = route[Def].methods;
  const path = route[Def].path;

  if (methods == null || path == null) return [] as any;

  return methods.map(
    (method: string) => `${method.toUpperCase()} ${path}`
  ) as any;
};

/**
 * Retrieves the methods registered on this route.
 */
export const getMethods = <T extends AnyCompiledRoute>(
  route: T
): InferMethods<T>[] => {
  return route[Def]["methods"] ?? [];
};

/**
 * Retrieves any route metadata you may have set.
 */
export const getMeta = <T extends AnyCompiledRoute>(route: T): InferMeta<T> => {
  return route[Def].meta;
};

export const clone = <T extends AnyCompiledRoute>(route: T): T => {
  return Object.assign(function (this: ThisType<any>, ...args: [Request]): any {
    return route.apply(this, args);
  }, route);
};

/**
 * Retrieves any providers you may have registered with the given route.
 */
export const getProviders = <T extends AnyCompiledRoute>(
  route: T
): InferProviders<T> => {
  return route[Def].providers;
};

/**
 * Partially override a route's providers.
 *
 * _This is primarily useful for testing._
 */
export const withProviders = <T extends AnyCompiledRoute>(
  route: T,
  providers: Partial<InferProviders<T>>
): T => {
  // Need to clone to avoid mutating the original route
  const cloned = clone(route);

  cloned[Def].providers ??= {};

  for (const key in providers) {
    cloned[Def].providers[key] = providers[key];
  }

  return cloned;
};
