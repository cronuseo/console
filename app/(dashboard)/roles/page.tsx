import { options } from '@/app/api/auth/[...nextauth]/options'
import { DataTable } from '@/components/data_table/data_table'
import { Button } from '@/components/ui/button'
import { PersonIcon } from '@radix-ui/react-icons'
import { Session, getServerSession } from 'next-auth'
import { role_columns } from './roles_columns'
import { RoleEntity } from '@/types'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { AddRoleForm } from '@/components/data_table/toolbars/role_toolbar'
import { redirect } from 'next/navigation'



const fetchRoles = async (session: Session): Promise<RoleEntity[]> => {

  const response = await fetch(`${process.env.CRONUSEO_MGT_API_BASE!}/api/v1/o/${session.user.organization_id}/roles`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${session.id_token}`
    }
  });

  if (!response.ok) {
    if (response.status == 401) {
      redirect("/signin")
    }
    throw new Error('Network response was not ok');
  }

  const data = await response.json();
  return data; // This now returns the array of users
};

export default async function Roles() {

  const session = await getServerSession(options);
  if (!session) {
    redirect("/signin")
  }
  const roles = await fetchRoles(session)
  return (
    <div className='flex-1 flex-col mb-10'>
      <div className='flex flex-none h-20 justify-between items-center px-10'>
        <h2 className="text-2xl font-semibold">Roles</h2>
      </div>
      <div className='flex flex-1 h-full ml-10 mr-10 mb-20'>
        {roles.length > 0 ?
          <div className="flex-1">
            <DataTable data={roles} columns={role_columns} />
          </div>
          :
          <div className="flex flex-1 justify-center rounded-md border border-dashed ">
            <div className="flex flex-col justify-center items-center">
              <PersonIcon width="18" height="18" style={{ marginRight: 8 }} color='gray' />
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                There are no roles available at the moment.
              </p>
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="sm" className="relative" variant="outline">
                    Create Role
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[450px] sm:max-w-none">
                  <div className="h-screen">
                    <SheetHeader>
                      <SheetTitle>New Role</SheetTitle>
                    </SheetHeader>
                    <AddRoleForm session={session} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>}
      </div>
    </div>

  )
}