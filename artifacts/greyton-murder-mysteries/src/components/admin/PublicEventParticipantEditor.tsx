import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetPublicEventQueryKey,
  getListAdminPublicEventSignupsQueryKey,
  useDeleteAdminPublicEventSignup,
  useMoveAdminPublicEventSignup,
  useUpdateAdminPublicEventSignup,
  type PublicEventSignup,
  type PublicEventSignupUpdate,
} from '@workspace/api-client-react';
import { ArrowRightLeft, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function PublicEventParticipantEditor({
  signup, signups,
}: { signup: PublicEventSignup; signups: PublicEventSignup[] }) {
  const [open, setOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [targetGroup, setTargetGroup] = useState('');
  const queryClient = useQueryClient();
  const update = useUpdateAdminPublicEventSignup();
  const move = useMoveAdminPublicEventSignup();
  const remove = useDeleteAdminPublicEventSignup();
  const sameDate = signups.filter((person) => person.eventDateId === signup.eventDateId);
  const maxGroup = Math.max(1, ...sameDate.map((person) => person.eventNumber));
  const destinations = Array.from({ length: maxGroup + 1 }, (_, index) => index + 1)
    .map((number) => ({
      number,
      count: sameDate.filter((person) => person.eventNumber === number).length,
    }))
    .filter(({ number, count }) => number !== signup.eventNumber && count < 6);
  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getListAdminPublicEventSignupsQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getGetPublicEventQueryKey() }),
    ]);
  };
  const form = useForm<PublicEventSignupUpdate>({
    defaultValues: {
      name: signup.name,
      address: signup.address,
      phone: signup.phone,
      whatsapp: signup.whatsapp,
    },
  });

  const onOpenChange = (next: boolean) => {
    if (update.isPending) return;
    if (next) {
      form.reset({
        name: signup.name,
        address: signup.address,
        phone: signup.phone,
        whatsapp: signup.whatsapp,
      });
    }
    setOpen(next);
  };

  const save = form.handleSubmit(async (values) => {
    const data = {
      name: values.name.trim(),
      address: values.address.trim(),
      phone: values.phone.trim(),
      whatsapp: values.whatsapp.trim(),
    };
    try {
      await update.mutateAsync({ id: signup.id, data });
      await queryClient.invalidateQueries({ queryKey: getListAdminPublicEventSignupsQueryKey() });
      setOpen(false);
      toast.success('Participant updated');
    } catch {
      toast.error('Could not update participant. Please try again.');
    }
  });

  const saveMove = async () => {
    if (!targetGroup) return;
    try {
      await move.mutateAsync({ id: signup.id, data: { eventNumber: Number(targetGroup) } });
      await refresh();
      setMoveOpen(false);
      toast.success('Participant moved to another group');
    } catch {
      toast.error('Could not move participant. The destination group may be full.');
    }
  };

  const deleteParticipant = async () => {
    try {
      await remove.mutateAsync({ id: signup.id });
      await refresh();
      setDeleteOpen(false);
      toast.success('Participant removed');
    } catch {
      toast.error('Could not remove participant. Please try again.');
    }
  };

  return (
    <>
      <div className="flex min-w-max items-center gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => onOpenChange(true)}
          data-testid={`button-edit-participant-${signup.id}`}>
          <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
        </Button>
        <Button type="button" size="sm" variant="outline"
          onClick={() => { setTargetGroup(''); setMoveOpen(true); }}
          data-testid={`button-move-participant-${signup.id}`}>
          <ArrowRightLeft className="mr-2 h-3.5 w-3.5" /> Move
        </Button>
        <Button type="button" size="sm" variant="outline" className="text-destructive"
          onClick={() => setDeleteOpen(true)} data-testid={`button-delete-participant-${signup.id}`}>
          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
        </Button>
      </div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit participant</DialogTitle>
            <DialogDescription>Correct contact details without changing the participant’s date or group.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={save} className="space-y-4">
              <FormField control={form.control} name="name"
                rules={{ validate: (value) => value.trim().length >= 2 || 'Enter a name of at least 2 characters.' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input {...field} maxLength={100} autoComplete="name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl><Input {...field} maxLength={300} autoComplete="street-address" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="phone"
                rules={{ validate: (value) => value.trim().length >= 5 || 'Enter a valid phone number.' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl><Input {...field} type="tel" maxLength={30} autoComplete="tel" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="whatsapp"
                rules={{ validate: (value) => value.trim().length >= 5 || 'Enter a valid WhatsApp number.' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp</FormLabel>
                    <FormControl><Input {...field} type="tel" maxLength={30} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={update.isPending}>Cancel</Button>
                <Button type="submit" disabled={update.isPending}>
                  {update.isPending ? 'Saving…' : 'Save changes'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Dialog open={moveOpen} onOpenChange={(next) => { if (!move.isPending) setMoveOpen(next); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Move {signup.name}</DialogTitle>
            <DialogDescription>
              Currently in Group {signup.eventNumber}. Choose another group
              {signup.eventDateId === null ? ' among the earlier registrations.' : ' for the same event date.'}
              Each group can have up to six participants.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor={`target-group-${signup.id}`} className="text-sm font-medium">Destination group</label>
            <Select value={targetGroup} onValueChange={setTargetGroup}>
              <SelectTrigger id={`target-group-${signup.id}`}>
                <SelectValue placeholder="Choose a group" />
              </SelectTrigger>
              <SelectContent>
                {destinations.map(({ number, count }) => (
                  <SelectItem key={number} value={String(number)}>
                    Group {number} · {count} of 6 registered
                    {number === maxGroup + 1 ? ' (new group)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setMoveOpen(false)} disabled={move.isPending}>Cancel</Button>
            <Button type="button" onClick={saveMove} disabled={!targetGroup || move.isPending}>
              {move.isPending ? 'Moving…' : 'Move participant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={deleteOpen} onOpenChange={(next) => { if (!remove.isPending) setDeleteOpen(next); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {signup.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes their registration from Group {signup.eventNumber}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={remove.isPending}
              onClick={(event) => { event.preventDefault(); void deleteParticipant(); }}>
              {remove.isPending ? 'Deleting…' : 'Delete participant'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}