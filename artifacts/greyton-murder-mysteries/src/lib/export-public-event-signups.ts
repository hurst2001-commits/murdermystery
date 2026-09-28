import type { PublicEventDate, PublicEventSignup } from '@workspace/api-client-react';
import { format } from 'date-fns';

export async function exportPublicEventSignups(signups: PublicEventSignup[], dates: PublicEventDate[]) {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Greyton Murder Mysteries';

  const groups = new Map<string, PublicEventSignup[]>();
  for (const signup of signups) {
    const key = `${signup.eventDateId ?? 'legacy'}:${signup.eventNumber}`;
    const group = groups.get(key) ?? [];
    group.push(signup);
    groups.set(key, group);
  }

  for (const [key, registrations] of [...groups].sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))) {
    const [dateId, number] = key.split(':');
    const scheduled = dates.find((date) => String(date.id) === dateId);
    const sheet = workbook.addWorksheet(
      scheduled ? `${scheduled.date} Group ${number}` : dateId === 'legacy' ? `Earlier Group ${number}` : `Date ${dateId} Group ${number}`,
    );
    sheet.columns = [
      { header: 'Name', key: 'name', width: 35 },
      { header: 'Cell number', key: 'phone', width: 24 },
      { header: 'Group', key: 'group', width: 12 },
      { header: 'Murder mystery', key: 'mystery', width: 35 },
      { header: 'Event date', key: 'eventDate', width: 20 },
      { header: 'Event time', key: 'eventTime', width: 16 },
      { header: 'Registered on', key: 'registeredOn', width: 20 },
    ];
    sheet.getRow(1).font = { bold: true };
    sheet.getColumn(2).numFmt = '@';

    for (const registration of registrations) {
      sheet.addRow({
        name: registration.name,
        phone: registration.phone,
        group: registration.eventNumber,
        mystery: scheduled?.title ?? (registration.eventDateId === null ? 'Not recorded' : 'Title to be announced'),
        eventDate: scheduled?.date ?? 'Not recorded',
        eventTime: scheduled?.time ?? 'Not recorded',
        registeredOn: format(new Date(registration.createdAt), 'yyyy-MM-dd'),
      });
    }
  }

  const bytes = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(
    new Blob([bytes as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = `public-event-registrations-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}