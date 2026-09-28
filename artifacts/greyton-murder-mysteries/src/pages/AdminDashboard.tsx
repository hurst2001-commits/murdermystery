import {
  getGetAdminDashboardQueryKey,
  getGetAdminPricingQueryKey,
  getGetSiteContentQueryKey,
  getListAdminBookingsQueryKey,
  useGetAdminDashboard,
  useGetAdminPricing,
  useListAdminPublicEventSignups,
  useListAdminPublicEventDates,
  useListAdminBookings,
  useUpdateAdminBooking,
  useUpdateAdminPricing,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { exportPublicEventSignups } from '@/lib/export-public-event-signups';
import { PublicEventDates } from '@/components/admin/PublicEventDates';
import { PublicEventRegistrationGroups } from '@/components/admin/PublicEventRegistrationGroups';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Save, Calendar as CalendarIcon, Users, Phone, Mail, Loader2, BadgeDollarSign, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const { data: dashboard, isLoading: dashLoading } = useGetAdminDashboard();
  const { data: bookings, isLoading: bookingsLoading } = useListAdminBookings();
  const { data: pricing, isLoading: pricingLoading } = useGetAdminPricing();
  const {
    data: publicEventSignups,
    isLoading: publicEventSignupsLoading,
    isError: publicEventSignupsError,
    refetch: refetchPublicEventSignups,
  } = useListAdminPublicEventSignups();
  const {
    data: publicEventDates,
    isLoading: publicEventDatesLoading,
    isError: publicEventDatesError,
    refetch: refetchPublicEventDates,
  } = useListAdminPublicEventDates();
  const updateBooking = useUpdateAdminBooking();
  const updatePricing = useUpdateAdminPricing();

  const [savingId, setSavingId] = useState<number | null>(null);
  const [exportingSignups, setExportingSignups] = useState(false);
  const [localNotes, setLocalNotes] = useState<Record<number, string>>({});
  const [signaturePriceLabel, setSignaturePriceLabel] = useState('');
  const [customPriceLabel, setCustomPriceLabel] = useState('');

  useEffect(() => {
    if (!pricing) return;
    setSignaturePriceLabel(pricing.signaturePriceLabel);
    setCustomPriceLabel(pricing.customPriceLabel);
  }, [pricing]);

  const handlePricingSave = async () => {
    const signature = signaturePriceLabel.trim();
    const custom = customPriceLabel.trim();
    if (!signature || !custom) {
      toast.error('Both price labels are required');
      return;
    }

    try {
      await updatePricing.mutateAsync({
        data: {
          signaturePriceLabel: signature,
          customPriceLabel: custom,
        },
      });
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getGetAdminPricingQueryKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: getGetSiteContentQueryKey(),
        }),
      ]);
      toast.success('Website prices updated');
    } catch {
      toast.error('Failed to update prices');
    }
  };

  const handleStatusChange = async (id: number, newStatus: any) => {
    try {
      await updateBooking.mutateAsync({
        id,
        data: { status: newStatus }
      });
      queryClient.invalidateQueries({ queryKey: getListAdminBookingsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetAdminDashboardQueryKey() });
      toast.success("Status updated");
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleNotesSave = async (id: number) => {
    const notes = localNotes[id];
    if (notes === undefined) return;
    
    setSavingId(id);
    try {
      await updateBooking.mutateAsync({
        id,
        data: { notes }
      });
      queryClient.invalidateQueries({ queryKey: getListAdminBookingsQueryKey() });
      toast.success("Notes saved");
    } catch (e) {
      toast.error("Failed to save notes");
    } finally {
      setSavingId(null);
    }
  };

  const handleNotesChange = (id: number, value: string) => {
    setLocalNotes(prev => ({ ...prev, [id]: value }));
  };

  const handleSignupsExport = async () => {
    setExportingSignups(true);
    try {
      const result = await refetchPublicEventSignups();
      if (result.error) throw result.error;
      if (!result.data?.length) {
        toast.info('No public-event registrations to export');
        return;
      }
      await exportPublicEventSignups(result.data, publicEventDates ?? []);
      toast.success('Excel file downloaded');
    } catch {
      toast.error('Could not export registrations. Please try again.');
    } finally {
      setExportingSignups(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'NEW': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 border-blue-200';
      case 'CONTACTED': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 border-amber-200';
      case 'AWAITING_DEPOSIT': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100 border-orange-200';
      case 'CONFIRMED': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border-green-200';
      case 'COMPLETED': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 border-gray-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 border-red-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (
    dashLoading ||
    bookingsLoading ||
    pricingLoading ||
    publicEventSignupsLoading ||
    publicEventDatesLoading
  ) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="case-admin w-full bg-background min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage bookings and enquiries</p>
          </div>
          <Link
            href="/"
            className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
            data-testid="link-back-to-website"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to website
          </Link>
        </div>

        {/* STATS */}
        {dashboard && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Total</h3>
              <p className="text-4xl font-serif font-bold">{dashboard.total}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900 p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2 uppercase tracking-wider">New</h3>
              <p className="text-4xl font-serif font-bold text-blue-900 dark:text-blue-100">{dashboard.newCount}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900 p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2 uppercase tracking-wider">Confirmed</h3>
              <p className="text-4xl font-serif font-bold text-green-900 dark:text-green-100">{dashboard.confirmedCount}</p>
            </div>
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Upcoming</h3>
              <p className="text-4xl font-serif font-bold">{dashboard.upcomingCount}</p>
            </div>
          </div>
        )}

        <section className="mb-12 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b border-border p-6">
            <BadgeDollarSign className="h-6 w-6 text-primary" />
            <div>
              <h2 className="font-serif text-xl font-bold">Website Pricing</h2>
              <p className="text-sm text-muted-foreground">
                These labels appear immediately on the public Packages section.
              </p>
            </div>
          </div>
          <div className="grid gap-6 p-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="signature-price">Greyton murder mystery</Label>
              <Input
                id="signature-price"
                value={signaturePriceLabel}
                onChange={(event) =>
                  setSignaturePriceLabel(event.target.value)
                }
                maxLength={80}
                placeholder="Example: R3,500 per group"
              />
              <p className="text-xs text-muted-foreground">
                Enter the complete wording visitors should see.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="custom-price">Personalised murder mystery</Label>
              <Input
                id="custom-price"
                value={customPriceLabel}
                onChange={(event) => setCustomPriceLabel(event.target.value)}
                maxLength={80}
                placeholder="Example: From R6,500"
              />
              <p className="text-xs text-muted-foreground">
                You can use a price or wording such as “Bespoke quote”.
              </p>
            </div>
          </div>
          <div className="flex justify-end border-t border-border bg-muted/20 p-6">
            <Button
              onClick={handlePricingSave}
              disabled={
                updatePricing.isPending ||
                !signaturePriceLabel.trim() ||
                !customPriceLabel.trim()
              }
            >
              {updatePricing.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save website prices
            </Button>
          </div>
        </section>

        <PublicEventDates />

        <section className="mb-12 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-2 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold">
                Public Event Registrations
              </h2>
              <p className="text-sm text-muted-foreground">
                Groups 1–3 are shown for each mystery and date. Empty groups are marked clearly; more groups appear as needed.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleSignupsExport}
                disabled={exportingSignups}
                data-testid="button-export-public-event-signups"
              >
                {exportingSignups ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export to Excel
              </Button>
            </div>
          </div>

          {publicEventSignupsError || publicEventDatesError ? (
            <div className="p-10 text-center text-muted-foreground">
              <p>Could not load public-event registrations or dates.</p>
              <Button type="button" variant="outline" className="mt-4"
                onClick={() => { void Promise.all([refetchPublicEventSignups(), refetchPublicEventDates()]); }}>
                Try again
              </Button>
            </div>
          ) : (
            <PublicEventRegistrationGroups signups={publicEventSignups ?? []} dates={publicEventDates ?? []} />
          )}
        </section>

        {/* BOOKINGS TABLE */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold">Recent Enquiries</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="w-[180px]">Status</TableHead>
                  <TableHead className="min-w-[250px]">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!bookings?.length ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      No enquiries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow key={booking.id} className="group">
                      <TableCell className="align-top pt-4">
                        <div className="flex items-center gap-1.5 text-sm">
                          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{format(new Date(booking.createdAt), 'MMM d')}</span>
                        </div>
                        <span className="text-xs text-muted-foreground ml-5">{format(new Date(booking.createdAt), 'HH:mm')}</span>
                      </TableCell>
                      
                      <TableCell className="align-top pt-4">
                        <div className="font-medium">{booking.firstName} {booking.surname}</div>
                        <div className="text-sm text-muted-foreground mt-1 flex flex-col gap-1">
                          <a href={`mailto:${booking.email}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                            <Mail className="w-3.5 h-3.5" />
                            {booking.email}
                          </a>
                          <a href={`tel:${booking.mobile}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                            <Phone className="w-3.5 h-3.5" />
                            {booking.mobile}
                          </a>
                        </div>
                      </TableCell>
                      
                      <TableCell className="align-top pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="uppercase font-semibold tracking-wider text-[10px]">
                            {booking.experience === 'signature' ? 'Signature' : booking.experience === 'custom' ? 'Custom' : 'Unsure'}
                          </Badge>
                          <span className="text-sm flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                            {booking.guests}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Date:</span> {format(new Date(booking.preferredDate), 'PPP')}
                          {booking.alternativeDate && <span> (Alt: {format(new Date(booking.alternativeDate), 'PPP')})</span>}
                        </div>
                        {booking.occasion && (
                          <div className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium text-foreground">Occasion:</span> {booking.occasion}
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell className="align-top pt-4">
                        <Select 
                          defaultValue={booking.status} 
                          onValueChange={(val) => handleStatusChange(booking.id, val)}
                        >
                          <SelectTrigger className={cn("h-8 text-xs font-semibold tracking-wider", getStatusColor(booking.status))}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NEW">NEW</SelectItem>
                            <SelectItem value="CONTACTED">CONTACTED</SelectItem>
                            <SelectItem value="AWAITING_DEPOSIT">AWAITING DEPOSIT</SelectItem>
                            <SelectItem value="CONFIRMED">CONFIRMED</SelectItem>
                            <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                            <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      
                      <TableCell className="align-top pt-4">
                        <div className="relative">
                          <Textarea 
                            className="min-h-[80px] text-sm resize-none pr-10 bg-background/50"
                            placeholder="Add notes..."
                            defaultValue={booking.notes || ''}
                            onChange={(e) => handleNotesChange(booking.id, e.target.value)}
                          />
                          {localNotes[booking.id] !== undefined && localNotes[booking.id] !== (booking.notes || '') && (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="absolute bottom-2 right-2 h-6 w-6"
                              onClick={() => handleNotesSave(booking.id)}
                              disabled={savingId === booking.id}
                            >
                              {savingId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-primary" />}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
