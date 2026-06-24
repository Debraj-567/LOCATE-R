import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, BarChart3, LogIn, LogOut, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { attendanceApi } from '@/api/attendance';
import { officesApi } from '@/api/offices';
import { AttendanceStatus } from '@/types';

const statusVariant: Record<AttendanceStatus, 'success' | 'warning' | 'destructive'> = {
  PRESENT: 'success', LATE: 'warning', ABSENT: 'destructive',
};

export function AdminAttendancePage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [officeFilter, setOfficeFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const limit = 20;

  const { data: offices } = useQuery({ queryKey: ['offices'], queryFn: officesApi.getAll });

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', 'all', page, statusFilter, officeFilter, startDate, endDate],
    queryFn: () => attendanceApi.getAll({
      page,
      limit,
      ...(statusFilter !== 'all' && { status: statusFilter }),
      ...(officeFilter !== 'all' && { officeId: officeFilter }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    }),
  });

  const { data: stats } = useQuery({
    queryKey: ['attendance', 'stats', officeFilter, startDate, endDate],
    queryFn: () => attendanceApi.getStats({
      ...(officeFilter !== 'all' && { officeId: officeFilter }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    }),
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold">Attendance Analytics</h1>
        <p className="text-muted-foreground">Company-wide attendance overview</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-blue-600' },
            { label: 'Present', value: stats.present, color: 'text-green-600' },
            { label: 'Late', value: stats.late, color: 'text-yellow-600' },
            { label: 'Absent', value: stats.absent, color: 'text-red-600' },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="w-4 h-4" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="PRESENT">Present</SelectItem>
                <SelectItem value="LATE">Late</SelectItem>
                <SelectItem value="ABSENT">Absent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={officeFilter} onValueChange={(v) => { setOfficeFilter(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Office" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All offices</SelectItem>
                {offices?.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} placeholder="Start date" />
            <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} placeholder="End date" />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Records {data && `(${data.total})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : !data?.attendances.length ? (
            <div className="text-center py-8 text-muted-foreground">No records found.</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Office</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.attendances.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{a.user?.firstName} {a.user?.lastName}</p>
                          <p className="text-xs text-muted-foreground">{a.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{a.office?.name}</TableCell>
                      <TableCell>{format(new Date(a.checkInAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1 text-green-600">
                          <LogIn className="w-3 h-3" /> {format(new Date(a.checkInAt), 'h:mm a')}
                        </span>
                      </TableCell>
                      <TableCell>
                        {a.checkOutAt
                          ? <span className="flex items-center gap-1 text-blue-600"><LogOut className="w-3 h-3" /> {format(new Date(a.checkOutAt), 'h:mm a')}</span>
                          : <span className="text-muted-foreground text-sm">—</span>}
                      </TableCell>
                      <TableCell><Badge variant={statusVariant[a.status]}>{a.status}</Badge></TableCell>
                    </TableRow>
                  ))}
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
    </div>
  );
}
