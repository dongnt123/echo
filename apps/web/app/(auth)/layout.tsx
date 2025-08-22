import AuthLayout from "@/modules/auth/ui/layouts/auth-layout";

export default function AuthMainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthLayout>
      {children}
    </AuthLayout>
  )
}