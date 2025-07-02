import { UserAuthEmailForm } from '@/modules/auth/components/user-auth-email-form'

function LoginPage() {
  return (
    <>
      <div className="container relative h-[100vh] flex-col items-center justify-center grid grid-cols-1 md:grid-cols-2 md:max-w-none md:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r md:flex">
          <div
            className="absolute inset-0 bg-zinc-900"
            style={{
              // backgroundImage: 'url(/images/food-table.jpg)',
              backgroundSize: 'auto 100vh',
              backgroundPosition: 'center right',
            }}
          />
          <div className="relative z-20 flex items-center text-lg font-medium">Admin</div>
        </div>
        <div className="mx-auto h-full flex flex-col justify-center w-[300px]">
          <div className="space-y-2 text-center mb-4">
            <h1 className="text-2xl font-semibold tracking-tight">Sign In</h1>
            <p className="text-sm text-muted-foreground">Enter your credentials below to sign in</p>
          </div>
          <UserAuthEmailForm />
        </div>
      </div>
    </>
  )
}
LoginPage.public = true

export default LoginPage
