import { options } from '@/app/api/auth/[...nextauth]/options'
import { DataTable } from '@/components/data_table/data_table'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PersonIcon } from '@radix-ui/react-icons'
import { Session, getServerSession } from 'next-auth'
import { role_columns } from './resource_columns'
import { ResourceEntity } from '@/types'
import { redirect } from 'next/navigation'



const fetchResources = async (session: Session) : Promise<ResourceEntity[]> => {
  
  const response = await fetch(`${process.env.CRONUSEO_MGT_API_BASE!}/api/v1/o/${session.user.organization_id}/resources`, {
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

export default async function Resources() {

  const session = await getServerSession(options);
  if (!session) {
    redirect("/signin")
  }
  const resources = await fetchResources(session)
  return (
    <div className='flex-1 flex-col mb-10'>
      <div className='flex flex-none h-20 justify-between items-center px-10'>
        <h2 className="text-2xl font-semibold">Resources</h2>
      </div>
      <div className='flex flex-1 h-full ml-10 mr-10 mb-20'>
        {resources.length > 0 ?
          <div  className="flex-1">
            <DataTable data={resources} columns={role_columns} />
          </div>
          :
          <div className="flex flex-1 justify-center rounded-md border border-dashed ">
            <div className="flex flex-col justify-center items-center">
              <PersonIcon width="18" height="18" style={{ marginRight: 8 }} color='gray' />
              <p className="mb-4 mt-2 text-sm text-muted-foreground">
                There are no resources available at the moment.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="relative">
                    Add Resource
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Podcast</DialogTitle>
                    <DialogDescription>
                      Copy and paste the podcast feed URL to import.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="url">Podcast URL</Label>
                      <Input id="url" placeholder="https://example.com/feed.xml" />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>}
      </div>
    </div>

  )
}