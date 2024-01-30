import { Log } from "../../internal/logger";
import {
  FSRouterFormat,
  FSRouterFormattedParams,
  FSRouterFormattedRoute,
} from "../format";

export type NextJSFormatOptions = {
  fileExtensions?: string[];
};

const NextRegex = {
  RouteGroup: /\([a-zA-Z0-9]*\)/,
  Slug: /\[([a-zA-Z0-9]*)\]/,
  CatchAll: /\[\.\.\.([a-zA-Z0-9]*)\]/,
  OptionalCatchAll: /\[\[\.\.\.([a-zA-Z0-9]*)\]\]/,
};

const getPathParts = (path: string) => {
  return path
    .split("/")
    .filter((x) => x.length > 0 && !NextRegex.RouteGroup.test(x));
};

export const NextJS = (opts?: NextJSFormatOptions): FSRouterFormat => {
  const { fileExtensions = ["tsx", "jsx", "ts", "js"] } = opts ?? {};

  return (path) => {
    if (!fileExtensions.some((ext) => path.endsWith(`.${ext}`))) {
      Log("File does not match extensions. Exiting.");
      return;
    }

    for (const ext of fileExtensions) {
      path = path.replace(`.${ext}`, "");
    }

    const parts = getPathParts(path);

    let catchAllType: "catch-all" | "optional" | undefined;

    const paramParts: {
      index: number;
      key: string;
      catchAll?: boolean;
    }[] = [];
    const expressPathPart: string[] = [];

    for (const _idx in parts) {
      const idx = Number(_idx);
      let part = parts[idx];

      if (part === "index") {
        continue;
      }

      if (NextRegex.Slug.test(part)) {
        Log("Adding dynamic part", part);
        const paramName = part.replace(NextRegex.Slug, "$1");
        paramParts.push({ index: idx, key: paramName });
        expressPathPart.push(`:${paramName}`);
        continue;
      }

      if (NextRegex.CatchAll.test(part)) {
        const isLast = idx === parts.length - 1;
        if (!isLast) {
          const nextIdx = idx + 1;
          const isTerminalIndexFile =
            parts[nextIdx] === "index" && parts.length - 1 === nextIdx;

          if (!isTerminalIndexFile) {
            throw new Error(
              'NextJS "catch-all" route must be at the end of the path.'
            );
          }
        }

        Log("Adding catch all part", part);
        const paramName = part.replace(NextRegex.CatchAll, "$1");
        paramParts.push({ index: idx, catchAll: true, key: paramName });
        expressPathPart.push(`:${paramName}*`);
        catchAllType === "catch-all";
        continue;
      }

      if (NextRegex.OptionalCatchAll.test(part)) {
        const isLast = idx === parts.length - 1;

        if (!isLast) {
          const nextIdx = idx + 1;
          const isTerminalIndexFile =
            parts[nextIdx] === "index" && parts.length - 1 === nextIdx;

          if (!isTerminalIndexFile) {
            throw new Error(
              'NextJS "optional-catch-all" route must be at the end of the path.'
            );
          }
        }

        Log("Adding optional catch all part", part);
        const paramName = part.replace(NextRegex.OptionalCatchAll, "$1");
        paramParts.push({ index: idx, catchAll: true, key: paramName });
        expressPathPart.push("*");
        catchAllType === "optional";
        continue;
      }

      Log("Adding statis part", part);
      expressPathPart.push(part);
    }

    const deriveParams: FSRouterFormattedRoute["deriveParams"] = (url) => {
      const params: FSRouterFormattedParams = {};
      const pathname = url.pathname;

      const pathParts = getPathParts(pathname);

      for (const part of paramParts) {
        const value = pathParts.slice(part.index);

        params[part.key] = part.catchAll ? value : value[0];
      }

      return params;
    };

    const pathMatch = `/${expressPathPart.join("/")}`;

    return { pathMatch, methods: "*", deriveParams };
  };
};
