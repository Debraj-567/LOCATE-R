import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Clock, MapPin, LogIn, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { attendanceApi } from '@/api/attendance';
import { AttendanceStatus } from '@/types';

const statusVariant: Record<AttendanceStatus, 'success' | 'warning' | 'destructive'> = {
  PRESENT: 'success',
  LATE: 'warning',
  ABSENT: 'destructive',
};

export function AttendancePage() {
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', 'my', page],
    queryFn: () => attendanceApi.getMyAttendance(page, limit),
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 1;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">My Attendance</h1>
        <p className="text-muted-foreground">Your full attendance history</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Attendance History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : !data?.attendances.length ? (
            <div className="text-center py-8 text-muted-foreground">No attendance records yet.</div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Office</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.attendances.map((a) => {
                      const duration = a.checkOutAt
                        ? Math.round((new Date(a.checkOutAt).getTime() - new Date(a.checkInAt).getTime()) / 60000)
                        : null;
                      return (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium">{format(new Date(a.checkInAt), 'MMM d, yyyy')}</TableCell>
                          <TableCell>{a.office?.name ?? '—'}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1">
                              <LogIn className="w-3 h-3 text-green-500" />
                              {format(new Date(a.checkInAt), 'h:mm a')}
                            </span>
                          </TableCell>
                          <TableCell>
                            {a.checkOutAt ? (
                              <span className="flex items-center gap-1">
                                <LogOut className="w-3 h-3 text-blue-500" />
                                {format(new Date(a.checkOutAt), 'h:mm a')}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {duration !== null ? (
                              <span className="text-sm">{Math.floor(duration / 60)}h {duration % 60}m</span>
                            ) : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant[a.status]}>{a.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              {a.latitude.toFixed(3)}, {a.longitude.toFixed(3)}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {data.attendances.map((a) => (
                  <div key={a.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{format(new Date(a.checkInAt), 'MMM d, yyyy')}</span>
                      <Badge variant={statusVariant[a.status]}>{a.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{a.office?.name}</p>
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1 text-green-600">
                        <LogIn className="w-3 h-3" /> {format(new Date(a.checkInAt), 'h:mm a')}
                      </span>
                      {a.checkOutAt && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <LogOut className="w-3 h-3" /> {format(new Date(a.checkOutAt), 'h:mm a')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} · {data.total} records
                  </p>
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
