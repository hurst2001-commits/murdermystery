import { format, parseISO } from 'date-fns';
import { MapPin, MessageCircle, Phone } from 'lucide-react';
import type { PublicEventDate, PublicEventSignup } from '@workspace/api-client-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PublicEventParticipantEditor } from './PublicEventParticipantEditor';

function RegistrationGroup({
  number, groupKey, registrations, allSignups,
}: {
  number: number;
  groupKey: string;
  registrations: PublicEventSignup[];
  allSignups: PublicEventSignup[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border" data-testid={`registration-group-${groupKey}-${number}`}>
      <div className="flex items-center justify-between gap-3 bg-muted/30 px-4 py-3">
        <h4 className="font-serif text-lg font-bold">Group {number}</h4>
        <Badge variant="outline">{registrations.length} of 6 registered</Badge>
      </div>
      {registrations.length === 0 ? (
        <p className="px-4 py-4 text-sm text-muted-foreground">No registrations yet for this group.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Contact details</TableHead>
                <TableHead>Signed up on</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((signup) => (
                <TableRow key={signup.id}>
                  <TableCell className="font-medium">{signup.name}</TableCell>
                  <TableCell>{signup.email ? <a href={`mailto:${signup.email}`} className="hover:text-primary">{signup.email}</a> : '—'}</TableCell>
                  <TableCell>
                    <span className="flex min-w-48 items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      {signup.address || 'Not supplied'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-44 flex-col gap-2 text-sm">
                      <a href={`tel:${signup.phone}`} className="flex items-center gap-2 hover:text-primary">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {signup.phone}
                      </a>
                      <a href={`https://wa.me/${signup.whatsapp.replace(/\D/g, '')}`} target="_blank"
                        rel="noreferrer" className="flex items-center gap-2 hover:text-primary">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        {signup.whatsapp}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(signup.createdAt), 'PPP')}</TableCell>
                  <TableCell><PublicEventParticipantEditor signup={signup} signups={allSignups} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export function PublicEventRegistrationGroups({
  signups, dates,
}: {
  signups: PublicEventSignup[];
  dates: PublicEventDate[];
}) {
  const earlier = signups.filter((signup) => signup.eventDateId === null);
  const sections = [
    ...(earlier.length ? [{
      key: 'earlier',
      title: 'Earlier registrations',
      description: 'Event date and mystery title were not recorded for these registrations. The dates in the table show when participants registered, not the event date.',
      registrations: earlier,
    }] : []),
    ...dates.map((date) => ({
      key: String(date.id),
      title: date.title ?? 'Title to be announced',
      description: `${format(parseISO(date.date), 'EEEE, d MMMM yyyy')} at ${date.time} · Venue TBA`,
      registrations: signups.filter((signup) => signup.eventDateId === date.id),
    })),
  ];

  if (sections.length === 0) {
    return <p className="p-10 text-center text-muted-foreground">No public event dates or registrations yet.</p>;
  }

  return (
    <div className="space-y-8 p-4 sm:p-6">
      {sections.map((section) => {
        const highestGroup = Math.max(3, ...section.registrations.map((signup) => signup.eventNumber));
        return (
          <section key={section.key} aria-label={section.title} className="space-y-4">
            <div>
              <h3 className="font-serif text-xl font-bold">{section.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
            </div>
            {Array.from({ length: highestGroup }, (_, index) => {
              const number = index + 1;
              return <RegistrationGroup key={number} number={number} groupKey={section.key} allSignups={signups}
                registrations={section.registrations.filter((signup) => signup.eventNumber === number)} />;
            })}
          </section>
        );
      })}
    </div>
  );
}