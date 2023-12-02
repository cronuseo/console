"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"

type Props = {
  providers: any,
}

export function UserAuthForm({ providers }: Props) {

  return (
    <>
      {Object.values(providers).map((provider: any) => (
        <Button variant="outline" type="button" key={provider.id} onClick={()=>signIn(provider.id, { callbackUrl: '/'})}>
          Sign in with {provider.name}
        </Button>
      ))}
    </>
  )
}