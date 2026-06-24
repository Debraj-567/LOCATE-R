import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Pencil, Trash2, MapPin, Radio } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { officesApi } from '@/api/offices';
import { Office } from '@/types';
import { toast } from '@/hooks/useToast';

const officeSchema = z.object({
  name: z.string().min(1, 'Name required'),
  address: z.string().min(1, 'Address required'),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(10).max(500),
});

type OfficeFormData = z.infer<typeof officeSchema>;

export function AdminOfficesPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOffice, setEditOffice] = useState<Office | null>(null);

  const { data: offices, isLoading } = useQuery<Office[]>({ queryKey: ['offices'], queryFn: officesApi.getAll });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm<OfficeFormData>({
    resolver: zodResolver(officeSchema),
    defaultValues: { radius: 50 },
  });

  const createMutation = useMutation({
    mutationFn: officesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offices'] });
      toast({ title: 'Office created' });
      setCreateOpen(false);
      reset();
    },
    onError: () => toast({ title: 'Failed to create office', variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Office> }) => officesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offices'] });
      toast({ title: 'Office updated' });
      setEditOffice(null);
    },
    onError: () => toast({ title: 'Update failed', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: officesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offices'] });
      toast({ title: 'Office deactivated' });
    },
    onError: () => toast({ title: 'Failed', variant: 'destructive' }),
  });

  const openEdit = (office: Office) => {
    setEditOffice(office);
    setValue('name', office.name);
    setValue('address', office.address);
    setValue('latitude', office.latitude);
    setValue('longitude', office.longitude);
    setValue('radius', office.radius);
  };

  const onSubmit = (data: OfficeFormData) => {
    if (editOffice) {
      updateMutation.mutate({ id: editOffice.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const isFormOpen = createOpen || !!editOffice;
  const closeForm = () => { setCreateOpen(false); setEditOffice(null); reset({ radius: 50 }); };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Offices</h1>
          <p className="text-muted-foreground">Manage office locations and geofencing</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Office
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : !offices?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No offices yet. Create one to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
              {offices?.map((office: Office) => (
            <Card key={office.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{office.name}</CardTitle>
                  <Badge variant={office.isActive ? 'success' : 'destructive'}>
                    {office.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{office.address}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Radio className="w-3 h-3" />
                    <span>{office.radius}m radius</span>
                  </div>
                  <span className="text-muted-foreground font-mono text-xs">
                    {office.latitude.toFixed(4)}, {office.longitude.toFixed(4)}
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => openEdit(office)} className="gap-1">
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  {office.isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 text-destructive hover:text-destructive"
                      onClick={() => deleteMutation.mutate(office.id)}
                    >
                      <Trash2 className="w-3 h-3" /> Deactivate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={(o: boolean) => !o && closeForm()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editOffice ? 'Edit Office' : 'Create Office'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input placeholder="Headquarters" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input placeholder="123 Main St, City" {...register('address')} />
              {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input type="number" step="any" placeholder="40.7128" {...register('latitude')} />
                {errors.latitude && <p className="text-xs text-destructive">{errors.latitude.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input type="number" step="any" placeholder="-74.0060" {...register('longitude')} />
                {errors.longitude && <p className="text-xs text-destructive">{errors.longitude.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Geofence Radius</Label>
              <Select onValueChange={(v: string) => setValue('radius', parseInt(v))} defaultValue={String(editOffice?.radius ?? 50)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 meters</SelectItem>
                  <SelectItem value="20">20 meters</SelectItem>
                  <SelectItem value="50">50 meters</SelectItem>
                  <SelectItem value="100">100 meters</SelectItem>
                  <SelectItem value="200">200 meters</SelectItem>
                  <SelectItem value="500">500 meters</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}>
                {editOffice ? 'Save changes' : 'Create office'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
