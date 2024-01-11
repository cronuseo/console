import { options } from '@/app/api/auth/[...nextauth]/options'
import { DataTable } from '@/components/data_table/data_table'
import { Button } from '@/components/ui/button'
import { PersonIcon } from '@radix-ui/react-icons'
import { Session, getServerSession } from 'next-auth'
import { user_columns } from '../../../components/data_table/columns/user_columns'
import { User } from '@/types'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { AddUserForm } from '@/components/data_table/toolbars/user_toolbar'
import { redirect } from 'next/navigation'



const fetchUsers = async (session:Session): Promise<User[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_CRONUSEO_MGT_API_BASE!}/api/v1/o/${session.user.organization_id}/users`, {
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
  return data;
};

export default async function Users() {

  const session = await getServerSession(options);
  if (!session) {
    redirect("/signin")
  }
  const users = await fetchUsers(session)
  return (
    <div className='flex-1 flex-col mb-10'>
      <div className='flex flex-none h-20 justify-between items-center px-10'>
        <h2 className="text-2xl font-semibold">Users</h2>
      </div>
      <div className='flex flex-1 h-full ml-10 mr-10 mb-20'>
        {users.length > 0 ?
          <div className="flex-1">
            <DataTable data={users} columns={user_columns} />
          </div>
          :
          <div className="flex flex-1 justify-center rounded-md border border-dashed ">
            <div className="flex flex-col justify-center items-center">
              <PersonIcon width="18" height="18" style={{ marginRight: 8 }} color='gray' />
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                There are no Users available at the moment.
              </p>
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="sm" className="relative" variant="outline">
                    Create User
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>New User</SheetTitle>
                  </SheetHeader>
                  <AddUserForm session={session} />
                </SheetContent>
              </Sheet>
            </div>
          </div>}
      </div>
    </div>

  )
}