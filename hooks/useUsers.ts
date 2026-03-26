import { useQuery } from "@tanstack/react-query";
import UserService, {
  UserDetailResponse,
  UsersListResponse,
  UsersQueryParams,
  UseUsersSelected,
} from "@/lib/api/services/fetchUsers";

export function useUsers(params: UsersQueryParams, enabled = true) {
  const query = useQuery<UsersListResponse, Error, UseUsersSelected>({
    queryKey: ["users", "list", JSON.stringify(params)],
    queryFn: () => UserService.getUsers(params),
    enabled: enabled && params.PageNumber > 0 && params.PageSize > 0,
    select: (data) => ({
      users: data.data ?? [],
      metadata: data.metadata,
      message: data.message,
      isSuccess: data.isSuccess,
    }),
    staleTime: 30_000,
  });

  return {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    users: query.data?.users ?? [],
    metadata: query.data?.metadata,
    message: query.data?.message,
    isSuccess: query.data?.isSuccess,
  };
}

export function useUserById(id: string, enabled = true) {
  const query = useQuery<UserDetailResponse, Error>({
    queryKey: ["users", "detail", id],
    queryFn: () => UserService.getUserById(id),
    enabled: enabled && !!id,
    staleTime: 30_000,
  });

  return {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    user: query.data?.data,
    message: query.data?.message,
    isSuccess: query.data?.isSuccess,
  };
}
