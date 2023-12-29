"use client"
import { Button } from "@/components/ui/button"
import { TokensIcon, ReaderIcon, LockClosedIcon, PersonIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Sidebar() {
    const path = usePathname()
    return (
        <div className="w-64 space-y-4 py-4 border-r">
            <div className="px-3 py-2">
                <div className="space-y-1">
                    <Button variant={"/" === path ? "secondary" : "ghost"} className="w-full justify-start">
                        <TokensIcon width="18" height="18" style={{ marginRight: 8 }} />
                        Dashboard
                    </Button>
                    <Button variant={"/resources" === path ? "secondary" : "ghost"} className="w-full justify-start">
                        <ReaderIcon width="18" height="18" style={{ marginRight: 8 }} />
                        Resources
                    </Button>
                    <Button variant={"/policies" === path ? "secondary" : "ghost"} className="w-full justify-start">
                        <LockClosedIcon width="18" height="18" style={{ marginRight: 8 }} />
                        Policies
                    </Button>
                </div>
            </div>
            <div className="px-3 py-2">
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                    User Management
                </h2>
                <div className="space-y-1">
                    <Link href="/users">
                    <Button variant={"/users" === path ? "secondary" : "ghost"} className="w-full justify-start">
                        <PersonIcon width="18" height="18" style={{ marginRight: 8 }} />
                        Users
                    </Button>
                    </Link>
                    <Button variant={"/groups" === path ? "secondary" : "ghost"} className="w-full justify-start">
                        <PersonIcon width="18" height="18" style={{ marginRight: 8 }} />
                        Groups
                    </Button>
                    <Link href="/roles">
                    <Button variant={"/roles" === path ? "secondary" : "ghost"}className="w-full justify-start">
                        <PersonIcon width="18" height="18" style={{ marginRight: 8 }} />
                        Roles
                    </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}