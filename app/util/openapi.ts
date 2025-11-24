import { describeRoute, DescribeRouteOptions } from "hono-openapi";
import { MiddlewareHandler } from "hono";

const defaultRouteDescription = {
  responses: {},
};

function openApiAuthDescription(opt: DescribeRouteOptions): MiddlewareHandler {
  return describeRoute({
    ...defaultRouteDescription,
    ...opt,
    ...(opt.responses &&
      {
        responses: {
          ...{
            403: {
              description: "unauthorized",
            },
          },
          ...defaultRouteDescription.responses,
          ...opt.responses,
        },
      }),
    ...{ security: [{ BearerAuth: [] }] },
  });
}

function openApiDescription(opt: DescribeRouteOptions): MiddlewareHandler {
  return describeRoute({
    ...defaultRouteDescription,
    ...opt,
    ...(opt.responses &&
      {
        responses: { ...defaultRouteDescription.responses, ...opt.responses },
      }),
  });
}

export { openApiAuthDescription, openApiDescription };
