import { DataProvider } from "@refinedev/core";
import { axiosInstance } from "@refinedev/simple-rest";
import { AxiosInstance } from "axios";
import { stringify } from "query-string";

type MethodTypes = "get" | "delete" | "head" | "options";
type MethodTypesWithBody = "post" | "put" | "patch";

const dataProvider = (
  apiUrl: string,
  httpClient: AxiosInstance = axiosInstance
): Omit<
  Required<DataProvider>,
  "createMany" | "updateMany" | "deleteMany"
> => ({
  getList: async ({ resource, meta, pagination, sorters, filters }) => {
    const url = `${apiUrl}/${resource}`;

    const { headers: headersFromMeta, method, relations } = meta ?? {};
    const queryParams: Record<string, string | number> =
      meta?.queryParams ?? {};
    const requestMethod = (method as MethodTypes) ?? "get";

    if (relations && relations.length > 0) {
      queryParams["relations"] = relations.join(",");
    }

    if (pagination && pagination.mode == "server") {
      const pageSize = pagination.pageSize ?? 10;
      const offset = ((pagination.current ?? 1) - 1) * pageSize;
      queryParams["limit"] = pageSize;
      queryParams["offset"] = offset;
    }

    if (sorters && sorters.length > 0) {
      queryParams["sort"] = sorters
        .map((sort) => `${sort.field}:${sort.order}`)
        .join(",");
    }

    if (filters && filters.length > 0) {
      filters.forEach((filter) => {
        if (!("field" in filter)) {
          throw Error("Filter must be a LogicalFilter.");
        }
        queryParams[filter.field] = filter.value;
      });
    }

    const { data, headers } = await httpClient[requestMethod](url, {
      headers: headersFromMeta,
      params: queryParams,
    });

    return {
      data,
      total: parseInt(headers["x-total-count"]) ?? 0,
    };
  },

  getMany: async ({ resource, ids, meta }) => {
    const url = `${apiUrl}/${resource}`;
  
    const { headers: headersFromMeta, method } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? "get";
  
    const { data } = await httpClient[requestMethod](url, {
      headers: headersFromMeta,
      params: {
        id: ids,
      },
    });
  
    return {
      data,
    };
  },
  

  create: async ({ resource, variables, meta }) => {
    const url = `${apiUrl}/${resource}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? "post";

    const { data } = await httpClient[requestMethod](url, variables, {
      headers,
    });

    return {
      data,
    };
  },

  update: async ({ resource, id, variables, meta }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? "patch";

    const { data } = await httpClient[requestMethod](url, variables, {
      headers,
    });

    return {
      data,
    };
  },

  getOne: async ({ resource, id, meta }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers, method, relations } = meta ?? {};
    const requestMethod = (method as MethodTypes) ?? "get";

    const queryParams: Record<string, string> = {};
    if (relations && relations.length > 0) {
      queryParams["relations"] = relations.join(",");
    }

    const { data } = await httpClient[requestMethod](url, {
      headers,
      params: queryParams,
    });

    return {
      data,
    };
  },

  deleteOne: async ({ resource, id, variables, meta }) => {
    const url = `${apiUrl}/${resource}/${id}`;

    const { headers, method } = meta ?? {};
    const requestMethod = (method as MethodTypesWithBody) ?? "delete";

    const { data } = await httpClient[requestMethod](url, {
      data: variables,
      headers,
    });

    return {
      data,
    };
  },

  getApiUrl: () => {
    return apiUrl;
  },

  custom: async ({ url, method, payload, query, headers }) => {
    let requestUrl = `${url}?`;

    if (query) {
      requestUrl = `${requestUrl}&${stringify(query)}`;
    }

    if (headers) {
      httpClient.defaults.headers.common = {
        ...httpClient.defaults.headers.common,
        ...headers,
      };
    }

    let axiosResponse;
    switch (method) {
      case "put":
      case "post":
      case "patch":
        axiosResponse = await httpClient[method](url, payload);
        break;
      case "delete":
        axiosResponse = await httpClient.delete(url, {
          data: payload,
        });
        break;
      default:
        axiosResponse = await httpClient.get(requestUrl);
        break;
    }

    const { data } = axiosResponse;

    return Promise.resolve({ data });
  },
});

export default dataProvider;
