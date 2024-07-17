import { describe, expect, test } from "vitest";
import { appRoutes } from "./routes";
import { ZodError } from "zod";
import { route, Route } from "@webroute/route";

describe("Routes", () => {
  test("GET /post errors on non-numeric id param", () => {
    const req = new Request("https://google.com/api/post/abc");

    expect(() => appRoutes.getPostRoute(req)).rejects.toBeInstanceOf(ZodError);
  });

  test("GET /post works with numeric id", async () => {
    const req = new Request("https://google.com/api/post/123");

    const res = await appRoutes.getPostRoute(req);

    expect(res).toBeInstanceOf(Response);
    expect(await res.json()).toBe(123);
  });

  test("Can override providers", async () => {
    const overridden = Route.withProviders(appRoutes.routeWithFooProvider, {
      foo: () => "bar",
    });

    const res = await overridden(new Request("https://test.com"));
    const data = await res.text();

    expect(data).toBe('"bar"');
  });
});
