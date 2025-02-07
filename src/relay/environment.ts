import {
  Environment,
  Network,
  RecordSource,
  Store,
  RequestParameters,
  QueryResponseCache,
  Variables,
  GraphQLResponse,
  CacheConfig,
} from 'relay-runtime'

const HTTP_ENDPOINT = 'http://api.firstcontributions.com/v1/graphql'
const IS_SERVER = typeof window === typeof undefined
const CACHE_TTL = 5 * 1000 // 5 seconds, to resolve preloaded results

export async function networkFetch(
  request: RequestParameters,
  variables: Variables,
  cookie: string | undefined
): Promise<GraphQLResponse> {
  const resp = await fetch(HTTP_ENDPOINT, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Cookie: cookie ?? '',
    },
    body: JSON.stringify({
      query: request.text,
      variables,
    }),
  })
  const json = await resp.json()
  // GraphQL returns exceptions (for example, a missing required variable) in the "errors"
  // property of the response. If any exceptions occurred when processing the request,
  // throw an error to indicate to the developer what went wrong.
  if (Array.isArray(json.errors)) {
    console.error(json.errors)
    throw new Error(
      `Error fetching GraphQL query '${
        request.name
      }' with variables '${JSON.stringify(variables)}': ${JSON.stringify(
        json.errors
      )}`
    )
  }

  return json
}

export const responseCache: QueryResponseCache | null = IS_SERVER
  ? null
  : new QueryResponseCache({
      size: 100,
      ttl: CACHE_TTL,
    })

function createNetwork(cookie?: string) {
  function fetchResponse(
    params: RequestParameters,
    variables: Variables,
    cacheConfig: CacheConfig
  ) {
    const isQuery = params.operationKind === 'query'
    const cacheKey = params.id ?? params.cacheID
    const forceFetch = cacheConfig && cacheConfig.force
    if (responseCache !== null && isQuery && !forceFetch) {
      const fromCache = responseCache.get(cacheKey, variables)
      if (fromCache !== null) {
        return Promise.resolve(fromCache)
      }
    }

    return networkFetch(params, variables, cookie)
  }

  const network = Network.create(fetchResponse)
  return network
}

function createEnvironment(cookie?: string) {
  return new Environment({
    network: createNetwork(cookie),
    store: new Store(RecordSource.create()),
    isServer: IS_SERVER,
  })
}

export const environment = createEnvironment()

export function getCurrentEnvironment(cookie: string) {
  if (IS_SERVER) {
    return createEnvironment(cookie)
  }

  return environment
}
