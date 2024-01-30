import { URL } from "node:url";
import { HttpMethod } from "../route/handler/types";

export type FSRouterFormattedParams = Record<PropertyKey, any> | undefined;

export type FSRouterFormattedRoute = {
  /** Express-style path map, e.g. user/[id] -> user/:id */
  pathMatch: string;
  methods: (HttpMethod | "*") | (HttpMethod | "*")[];
  deriveParams?: (url: URL) => FSRouterFormattedParams;
};

export type FSRouterFormat = (
  path: string
) => FSRouterFormattedRoute | undefined;
