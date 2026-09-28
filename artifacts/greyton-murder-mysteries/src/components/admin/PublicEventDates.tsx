import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetPublicEventQueryKey,
  getListAdminPublicEventDatesQueryKey,
  useCreateAdminPublicEventDate,
  useDeleteAdminPublicEventDate,
  useListAdminPublicEventDates,
  useUpdateAdminPublicEventDate,
} from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function PublicEventDates() {
  const queryClient = useQueryClient();
  const { data: dates, isLoading, isError, refetch } = useListAdminPublicEventDates();
  const create = useCreateAdminPublicEventDate();
  const update = useUpdateAdminPublicEventDate();
  const remove = useDeleteAdminPublicEventDate();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const today = format(new Date(), 'yyyy-MM-dd');
  const upcomingCount = dates?.filter((item) => item.date >= today).length ?? 0;

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getListAdminPublicEventDatesQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getGetPublicEventQueryKey() }),
    ]);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!date || !time || !title.trim()) return;
    setBusyId(editingId ?? 0);
    try {
      if (editingId !== null) {
        await update.mutateAsync({ id: editingId, data: { date, time, title: title.trim() } });
      } else {
        await create.mutateAsync({ data: { date, time, title: title.trim() } });
      }
      await refresh();
      setEditingId(null);
      setDate('');
      setTime('');
      setTitle('');
      toast.success(editingId === null ? 'Public date added' : 'Public date updated');
    } catch {
      toast.error('Could not save. Check the title and date; dates with registrations cannot be rescheduled.');
    } finally {
      setBusyId(null);
    }
  };

  const deleteDate = async (id: number) => {
    if (!window.confirm('Remove this public event date?')) return;
    setBusyId(id);
    try {
      await remove.mutateAsync({ id });
      await refresh();
      if (editingId === id) {
        setEditingId(null);
        setDate('');
        setTime('');
        setTitle('');
      }
      toast.success('Date removed');
    } catch {
      toast.error('Cannot remove a date that has registrations.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="mb-12 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="font-serif text-xl font-bold">Public Event Dates</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Set up to six upcoming dates. The day is shown automatically from the date; venue is TBA.
        Dates with registrations cannot be rescheduled or removed, but their titles can be edited.
      </p>
      <form onSubmit={submit} className="mt-6 flex flex-wrap items-end gap-3">
        <div className="space-y-2">
          <Label htmlFor="public-event-title">Murder mystery title</Label>
          <Input id="public-event-title" data-testid="input-public-event-title" type="text"
            required minLength={2} maxLength={120} placeholder="e.g. Murder at Maanskyn"
            value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="public-event-date">Date</Label>
          <Input id="public-event-date" data-testid="input-public-event-date" type="date" required min={today}
            value={date} onChange={(event) => setDate(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="public-event-time">Time</Label>
          <Input id="public-event-time" data-testid="input-public-event-time" type="time" required
            value={time} onChange={(event) => setTime(event.target.value)} />
        </div>
        <Button type="submit" data-testid="button-save-public-event-date"
          disabled={busyId !== null || (editingId === null && upcomingCount >= 6)}>
          {busyId !== null ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          {editingId === null ? 'Add date' : 'Save changes'}
        </Button>
        {editingId !== null && (
          <Button type="button" variant="ghost" onClick={() => { setEditingId(null); setDate(''); setTime(''); setTitle(''); }}>
            Cancel
          </Button>
        )}
      </form>
      <p className="mt-3 text-sm text-muted-foreground">{upcomingCount} of 6 upcoming dates set · Venue TBA</p>
      {isLoading ? <p className="mt-6 text-sm">Loading dates...</p> : isError ? (
        <Button className="mt-6" variant="outline" onClick={() => void refetch()}>Could not load dates. Retry</Button>
      ) : !dates?.length ? (
        <p className="mt-6 text-sm text-muted-foreground">No dates set yet. Add a date to open registration.</p>
      ) : (
        <div className="mt-6 space-y-2">
          {dates.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
              <span data-testid={`text-public-event-date-${item.id}`}>
                <strong>{item.title ?? 'Title to be announced'}</strong>
                <span className="block text-sm text-muted-foreground">
                  {format(parseISO(item.date), 'EEEE, d MMMM yyyy')} at {item.time} · Venue TBA
                </span>
              </span>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm"
                  data-testid={`button-edit-public-event-date-${item.id}`}
                  disabled={busyId !== null || item.date < today}
                  onClick={() => { setEditingId(item.id); setDate(item.date); setTime(item.time); setTitle(item.title ?? ''); }}>
                  Edit
                </Button>
                <Button type="button" variant="outline" size="sm"
                  data-testid={`button-delete-public-event-date-${item.id}`}
                  disabled={busyId !== null} onClick={() => void deleteDate(item.id)}>
                  <Trash2 className="mr-1 h-4 w-4" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}