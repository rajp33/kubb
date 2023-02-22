import { useQuery, useMutation } from '@tanstack/react-query'
import axios from 'axios'

import type { QueryKey, UseQueryResult, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import type {
  ListPetsResponse,
  ListPetsQueryParams,
  CreatePetsRequest,
  CreatePetsResponse,
  ShowPetByIdResponse,
  ShowPetByIdPathParams,
  ShowPetByIdQueryParams,
} from './models'

export const listPetsQueryKey = (params?: ListPetsQueryParams) => [`/pets`, ...(params ? [params] : [])] as const

/**
 * @summary List all pets
 * @link /pets
 */
export const useListPets = <TData = ListPetsResponse>(
  params: ListPetsQueryParams,
  options?: { query?: UseQueryOptions<TData> }
): UseQueryResult<TData> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? listPetsQueryKey(params)

  const query = useQuery<TData>({
    queryKey,
    queryFn: () => {
      return axios.get(`/pets`).then((res) => res.data)
    },
    ...queryOptions,
  }) as UseQueryResult<TData> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}

/**
 * @summary Create a pet
 * @link /pets
 */
export const useCreatePets = <TData = CreatePetsResponse, TVariables = CreatePetsRequest>(options?: {
  mutation?: UseMutationOptions<TData, unknown, TVariables>
}) => {
  const { mutation: mutationOptions } = options ?? {}

  return useMutation<TData, unknown, TVariables>({
    mutationFn: (data) => {
      return axios.post(`/pets`, data).then((res) => res.data)
    },
    ...mutationOptions,
  })
}

export const showPetByIdQueryKey = (petId: ShowPetByIdPathParams['petId'], testId: ShowPetByIdPathParams['testId'], params?: ShowPetByIdQueryParams) =>
  [`/pets/${petId}`, ...(params ? [params] : [])] as const

/**
 * @summary Info for a specific pet
 * @link /pets/{petId}
 */
export const useShowPetById = <TData = ShowPetByIdResponse>(
  petId: ShowPetByIdPathParams['petId'],
  testId: ShowPetByIdPathParams['testId'],
  params: ShowPetByIdQueryParams,
  options?: { query?: UseQueryOptions<TData> }
): UseQueryResult<TData> & { queryKey: QueryKey } => {
  const { query: queryOptions } = options ?? {}
  const queryKey = queryOptions?.queryKey ?? showPetByIdQueryKey(petId, testId, params)

  const query = useQuery<TData>({
    queryKey,
    queryFn: () => {
      return axios.get(`/pets/${petId}`).then((res) => res.data)
    },
    ...queryOptions,
  }) as UseQueryResult<TData> & { queryKey: QueryKey }

  query.queryKey = queryKey

  return query
}
