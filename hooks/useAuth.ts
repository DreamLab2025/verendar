"use client";

import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { loginAsync, logout, selectAuth } from "@/lib/redux/slices/authSlice";

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const auth = useAppSelector(selectAuth);

  const login = async (email: string, password: string) => {
    const result = await dispatch(loginAsync({ email, password })).unwrap();
    if (result.accessToken) router.push("/user/dashboard");
    return result;
  };

  const signOut = () => {
    dispatch(logout());
    router.push("/login");
  };

  return { ...auth, login, signOut };
}
