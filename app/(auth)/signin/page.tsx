import { options } from "@/app/api/auth/[...nextauth]/options"
import Logo from "@/components/logo"
import { UserAuthForm } from "@/components/user-auth-form"
import { getServerSession } from "next-auth"
import { getProviders } from "next-auth/react"
import { redirect } from "next/navigation"

export default async function SignIn() {
  const session = await getServerSession(options);
  if (session) {
    redirect("/")
  }
  const providers = await getProviders()
  console.log(providers)
  return (
    <>
      <div className="container relative hidden h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-yellow-400" />
          <div className="relative z-20 flex items-center -ml-7 -mt-2">
            <Logo width={200} height={30} fill="white"/>
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              Authorization as a Service
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <UserAuthForm providers={providers}/>
          </div>
        </div>
      </div>
    </>
  )
}