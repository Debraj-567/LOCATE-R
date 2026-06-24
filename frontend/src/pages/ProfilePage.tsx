import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, User, Mail, Building2, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/authStore';
import { usersApi } from '@/api/users';
import { toast } from '@/hooks/useToast';

const schema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof schema>;

export function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [editing, setEditing] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { firstName: user?.firstName, lastName: user?.lastName, email: user?.email },
  });

  if (!user) return null;

  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

  const onSubmit = async (data: FormData) => {
    try {
      const updated = await usersApi.update(user.id, data);
      updateUser({ ...user, ...updated });
      toast({ title: 'Profile updated', variant: 'default' });
      setEditing(false);
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    }
  };

  const onCancel = () => {
    reset({ firstName: user.firstName, lastName: user.lastName, email: user.email });
    setEditing(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account details</p>
      </div>

      {/* Profile card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'} className="mt-1">
                {user.role}
              </Badge>
            </div>
          </div>

          <Separator className="mb-6" />

          {editing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" {...register('firstName')} />
                  {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" {...register('lastName')} />
                  {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save changes
                </Button>
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {[
                { icon: User, label: 'Name', value: `${user.firstName} ${user.lastName}` },
                { icon: Mail, label: 'Email', value: user.email },
                { icon: Building2, label: 'Office', value: user.office?.name ?? 'Unassigned' },
                { icon: Shield, label: 'Role', value: user.role },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                </div>
              ))}
              <Button onClick={() => setEditing(true)} variant="outline" className="mt-2">
                Edit profile
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account information</CardTitle>
          <CardDescription>Read-only details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">User ID</span>
            <span className="font-mono text-xs">{user.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={user.isActive ? 'success' : 'destructive'}>
              {user.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
