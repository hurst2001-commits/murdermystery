import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { 
  useGetPublicEvent, 
  getGetPublicEventQueryKey, 
  useCreatePublicEventSignup 
} from '@workspace/api-client-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

import sealImage from '@assets/generated_images/wax_seal_icon.png';
import { CaseIllustration } from '@/components/CaseIllustration';

const signupSchema = z.object({
  eventDateId: z.number().int().positive({ message: 'Please choose an event date' }),
  name: z.string().min(2, "Please enter your full name"),
  address: z.string().min(5, "Please enter your address"),
  phone: z.string().min(5, "Please enter a valid phone number"),
  whatsapp: z.string().min(5, "Please enter a valid WhatsApp number"),
});

type SignupValues = z.infer<typeof signupSchema>;

export default function PublicEvent() {
  const queryClient = useQueryClient();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [confirmedDate, setConfirmedDate] = useState('');
  const [confirmedTitle, setConfirmedTitle] = useState('');

  const { data: eventData, isLoading: isLoadingEvent, isError: isEventError, refetch: refetchEvent } = useGetPublicEvent();
  const signupMutation = useCreatePublicEventSignup();

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      whatsapp: '',
    },
  });

  const onSubmit = (values: SignupValues) => {
    const selected = eventData?.dates.find((date) => date.id === values.eventDateId);
    signupMutation.mutate(
      { data: values },
      {
        onSuccess: (result) => {
          // Update the cache immediately so it feels responsive
          queryClient.setQueryData(getGetPublicEventQueryKey(), (old: typeof eventData) => old ? {
            ...old,
            dates: old.dates.map((date) => date.id === result.eventDateId ? {
              ...date,
              spotsRemaining: result.spotsRemaining,
              signedUp: old.capacity - result.spotsRemaining,
              eventNumber: result.activeEventNumber,
            } : date),
          } : old);
          void queryClient.invalidateQueries({ queryKey: getGetPublicEventQueryKey() });
          if (selected) {
            setConfirmedDate(`${format(parseISO(selected.date), 'EEEE, d MMMM yyyy')} at ${selected.time}`);
            setConfirmedTitle(selected.title ?? 'Murder mystery');
          }
          setHasSubmitted(true);
          // Scroll to the top of the form area
          document.getElementById('rsvp-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        },
        onError: () => {
          toast.error("We couldn't save your RSVP. Please try again.");
        }
      }
    );
  };

  const selectedDate = eventData?.dates.find((date) => date.id === form.watch('eventDateId'));
  const spotsRemaining = selectedDate?.spotsRemaining;
  const price = eventData?.pricePerPerson ?? 150;

  return (
    <div className="case-event min-h-screen bg-background pt-20">
      
      {/* Hero Section */}
      <section className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src="/public-event-hero.jpg"
          alt="Greyton café beneath the mountains, with a detective's hat and case files"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
            <span className="text-secondary font-sans uppercase tracking-[0.3em] text-sm md:text-base font-semibold mb-4 block">
              An Open Invitation
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white max-w-4xl mx-auto leading-tight">
              A Secret Evening <br className="hidden md:block"/> in Greyton
            </h1>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* Left Column: The Narrative */}
          <div className="lg:col-span-7 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
            
            <div className="prose prose-lg dark:prose-invert prose-p:text-muted-foreground prose-headings:font-serif">
              <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-6">
                Six Strangers. One Table. A Web of Secrets.
              </h2>
              
              <p className="text-lg leading-relaxed text-muted-foreground">
                Not every mystery requires a pre-assembled party. For the bold,
                the curious, and the adventurous, we open a table to the public
                with a new murder mystery every quarter.
              </p>
              
              <p className="text-lg leading-relaxed text-muted-foreground">
                You will be seated with five strangers. Over the course of the evening, alliances will form, accusations will fly, and together, you must untangle a narrative of deception. It is an extraordinary way to meet new people and experience the theatrical charm of Greyton.
              </p>

              <div className="my-10 pl-6 border-l-2 border-primary/30">
                <h3 className="text-xl font-serif text-foreground mb-4">The Arrangements</h3>
                <ul className="space-y-4 text-muted-foreground font-sans">
                  <li className="flex items-start gap-3">
                    <span className="font-semibold text-foreground min-w-[80px]">Cost:</span>
                    <span>R{price} per person.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-semibold text-foreground min-w-[80px]">Dining:</span>
                    <span>A generous snack platter is included. Please bring your own alcohol or preferred beverages.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-semibold text-foreground min-w-[80px]">Timing:</span>
                    <span>
                       Select one of the available dates when registering.
                       A new group of six opens for that date when a group fills.
                       The venue will be confirmed later.
                    </span>
                  </li>
                   <li className="flex items-start gap-3">
                     <span className="font-semibold text-foreground min-w-[80px]">Venue:</span>
                     <span>TBA. We will confirm the location before your event.</span>
                   </li>
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-4 py-8 border-t border-border">
              <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 shadow-lg border border-border/50">
                <img src={sealImage} alt="Wax seal" className="w-full h-full object-cover scale-110" />
              </div>
              <p className="text-sm text-muted-foreground italic font-serif">
                "There are no strangers here; Only fellow suspects you haven't met yet."
              </p>
            </div>

          </div>

          {/* Right Column: The RSVP Card */}
          <div className="lg:col-span-5" id="rsvp-section">
            <div className="sticky top-28 bg-card border border-border rounded-xl shadow-xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
              
              {isLoadingEvent ? (
                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                  <p>Checking the guest list...</p>
                </div>
              ) : isEventError && !hasSubmitted ? (
                <div className="py-8 text-center">
                  <p className="mb-4 text-muted-foreground">We couldn't check the available places right now.</p>
                  <Button onClick={() => void refetchEvent()}>Try again</Button>
                </div>
              ) : hasSubmitted ? (
                <div className="text-center py-8 space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-serif text-foreground">Your Name is on the List</h3>
                  <p className="text-muted-foreground leading-relaxed">
                     We have reserved your place for {confirmedTitle} on {confirmedDate}. Venue TBA.
                     The Game Master will contact you via WhatsApp with details.
                  </p>
                  <p className="text-sm font-serif italic text-muted-foreground pt-4">
                    Prepare your alibi.
                  </p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="text-center border-b border-border/50 pb-6">
                    <CaseIllustration name="greyton-detective" className="case-event-art" />
                    <h3 className="text-2xl font-serif text-foreground mb-2">Claim Your Seat</h3>
                     {selectedDate ? (
                       <>
                         <p className="mb-3 font-serif text-lg text-foreground">
                           {selectedDate.title ?? 'Title to be announced'}
                         </p>
                         <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                           {spotsRemaining} {spotsRemaining === 1 ? 'spot' : 'spots'} remaining
                         </div>
                         <p className="mt-3 text-sm text-muted-foreground">
                           Group {selectedDate.eventNumber} · A new group of six opens automatically when this one fills.
                         </p>
                       </>
                     ) : (
                       <p className="text-sm text-muted-foreground">
                         {eventData?.dates.length ? 'Choose a date below to see available places.' : 'No dates are scheduled yet. Please check back soon.'}
                       </p>
                     )}
                  </div>

                   {Boolean(eventData?.dates.length) && (
                     <div className="space-y-2">
                       <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Upcoming mysteries</p>
                       {eventData?.dates.map((date) => (
                         <p key={date.id} className="text-sm text-muted-foreground">
                           <span className="font-medium text-foreground">{date.title ?? 'Title to be announced'}</span>
                           {' · '}{format(parseISO(date.date), 'EEE, d MMM yyyy')} at {date.time} · Venue TBA
                         </p>
                       ))}
                     </div>
                   )}

                   {Boolean(eventData?.dates.length) && <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                         <FormField
                           control={form.control}
                           name="eventDateId"
                           render={({ field }) => (
                             <FormItem>
                               <FormLabel className="text-foreground/80 uppercase text-xs tracking-wider">Choose your date</FormLabel>
                               <Select value={field.value ? String(field.value) : undefined}
                                 onValueChange={(value) => field.onChange(Number(value))}>
                                 <FormControl>
                                   <SelectTrigger data-testid="select-public-event-date" className="h-12">
                                     <SelectValue placeholder="Select an event date" />
                                   </SelectTrigger>
                                 </FormControl>
                                 <SelectContent>
                                   {eventData?.dates.map((date) => (
                                     <SelectItem key={date.id} value={String(date.id)}>
                                       {date.title ?? 'Title to be announced'} · {format(parseISO(date.date), 'EEE, d MMM yyyy')} · {date.time} · Venue TBA
                                     </SelectItem>
                                   ))}
                                 </SelectContent>
                               </Select>
                               <FormMessage />
                             </FormItem>
                           )}
                         />
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/80 uppercase text-xs tracking-wider">Full Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Jane Doe" 
                                className="bg-background/50 border-border focus-visible:ring-primary h-12" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/80 uppercase text-xs tracking-wider">Address</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your residential address"
                                autoComplete="street-address"
                                className="bg-background/50 border-border focus-visible:ring-primary h-12"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/80 uppercase text-xs tracking-wider">Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="082 123 4567" 
                                type="tel"
                                className="bg-background/50 border-border focus-visible:ring-primary h-12" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="whatsapp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground/80 uppercase text-xs tracking-wider">WhatsApp Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="082 123 4567" 
                                type="tel"
                                className="bg-background/50 border-border focus-visible:ring-primary h-12" 
                                {...field} 
                              />
                            </FormControl>
                            <p className="text-xs text-muted-foreground mt-1.5">
                               We use WhatsApp to confirm venue and event details.
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full h-12 font-serif text-lg tracking-wide mt-4 hover:shadow-lg transition-all"
                         disabled={signupMutation.isPending || !eventData?.dates.length}
                      >
                        {signupMutation.isPending ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Reserving...
                          </span>
                        ) : (
                          "RSVP Now"
                        )}
                      </Button>
                    </form>
                   </Form>}
                  
                </div>
              )}
            </div>
          </div>
          
        </div>
      </section>
    </div>
  );
}
