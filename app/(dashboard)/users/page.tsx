import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PersonIcon, PlusIcon } from '@radix-ui/react-icons'


export default function Users() {
  return (
    <div className='flex-1 flex-col mb-10'>
      <div className='flex flex-none h-20 justify-between items-center px-10'>
        <h2 className="text-2xl font-semibold">Users</h2>
        <div className=''>
          <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="relative">
                <PlusIcon width="18" height="18" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add User</DialogTitle>
                  <DialogDescription>
                    Follow the steps to add a new user.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="url">Username</Label>
                    <Input id="url" placeholder="https://example.com/feed.xml" />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
        </div>
      </div>
      <div className='flex flex-1 h-full'>
        <div className="flex flex-1 justify-center rounded-md border border-dashed ml-10 mr-10 mb-20">
          <div className="flex flex-col justify-center items-center">
            <PersonIcon width="18" height="18" style={{ marginRight: 8 }} color='gray' />
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              There are no Users available at the moment.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="relative">
                  Add User
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
        </div>
      </div>
    </div>

  )
}