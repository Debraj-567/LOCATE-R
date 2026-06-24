import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, ChevronLeft, ChevronRight, UserX, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { usersApi } from '@/api/users';
import { officesApi } from '@/api/offices';
import { User } from '@/types';
import { toast } from '@/hooks/useToast';

export function AdminEmployeesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editData, setEditData] = useState<Partial<User>>({});
  const limit = 15;

  const { data, isLoading } = useQuery({
    queryKey: ['users', page],
    queryFn: () => usersApi.getAll(page, limit),
  });

  const { data: offices } = useQuery({ queryKey: ['offices'], queryFn: officesApi.getAll });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Employee updated' });
      setEditUser(null);
    },
    onError: () => toast({ title: 'Update failed', variant: 'destructive' }),
  });

  const deactivateMutation = useMutation({
    mutationFn: usersApi.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: 'Employee deactivated' });
    },
    onError: () => toast({ title: 'Failed', variant: 'destructive' }),
  });

  const openEdit = (user: User) => {
    setEditUser(user);
    setEditData({ firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, officeId: user.officeId ?? '' });
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">Employees</h1>
        <p className="text-muted-foreground">Manage employee accounts and assignments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            All Employees {data && `(${data.total})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Office</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.users.map((u) => {
                    const initials = `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
                    return (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{u.firstName} {u.lastName}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>{u.role}</Badge>
                        </TableCell>
                        <TableCell>{(u as User & { office?: { name: string } }).office?.name ?? '—'}</TableCell>
                        <TableCell>
                          <Badge variant={u.isActive ? 'success' : 'destructive'}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(u)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            {u.isActive && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => deactivateMutation.mutate(u.id)}
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>First name</Label>
                <Input value={editData.firstName ?? ''} onChange={(e) => setEditData(d => ({ ...d, firstName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input value={editData.lastName ?? ''} onChange={(e) => setEditData(d => ({ ...d, lastName: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={editData.email ?? ''} onChange={(e) => setEditData(d => ({ ...d, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editData.role ?? 'EMPLOYEE'} onValueChange={(v) => setEditData(d => ({ ...d, role: v as 'ADMIN' | 'EMPLOYEE' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Office</Label>
              <Select value={editData.officeId ?? ''} onValueChange={(v) => setEditData(d => ({ ...d, officeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Assign office" /></SelectTrigger>
                <SelectContent>
                  {offices?.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button
              onClick={() => editUser && updateMutation.mutate({ id: editUser.id, data: editData })}
              disabled={updateMutation.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
