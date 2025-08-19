"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

import AuthLayout from "../layout/auth-layout";
import SignInView from "../views/sign-in-view";

const AuthGuard = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <>
      <AuthLoading>
        <AuthLayout>
          <p>Loading...</p>
        </AuthLayout>
      </AuthLoading>
      <Authenticated>
        {children}
      </Authenticated>
      <Unauthenticated>
        <AuthLayout>
          <SignInView />
        </AuthLayout>
      </Unauthenticated>
    </>
  )
}

export default AuthGuard