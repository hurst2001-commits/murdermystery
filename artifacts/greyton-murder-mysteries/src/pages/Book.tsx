import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage 
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useCreateBooking, useCreateCustomEnquiry } from '@workspace/api-client-react';
import { toast } from 'sonner';
import { CalendarIcon, Loader2, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CaseIllustration } from '@/components/CaseIllustration';

// --- SCHEMAS ---

const bookingSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(5, "Mobile number is required"),
  preferredDate: z.date({ required_error: "Preferred date is required" }),
  alternativeDate: z.date().optional().nullable(),
  guests: z.literal(6),
  experience: z.enum(['signature', 'custom', 'unsure']),
  occasion: z.string().min(1, "Please select an occasion"),
  stayingInGreyton: z.enum(['yes', 'no', 'not_yet_booked']),
  accommodation: z.string().optional().nullable(),
  specialRequests: z.string().optional().nullable(),
  consent: z.literal(true, { errorMap: () => ({ message: "You must agree to the terms" }) }),
});

const playerSchema = z.object({
  name: z.string().min(1, "Name required"),
  ageRange: z.string().min(1, "Required"),
  occupation: z.string().min(1, "Required"),
  relationshipStatus: z.string().optional().nullable(),
  personality: z.string().min(1, "Required"),
  hobbies: z.string().min(1, "Required"),
  nickname: z.string().min(1, "Required"),
  funniestHabit: z.string().min(1, "Required"),
  groupReputation: z.string().min(1, "Required"),
  favouriteSaying: z.string().min(1, "Required"),
  closestTo: z.string().min(1, "Required"),
  arguesWith: z.string().min(1, "Required"),
  embarrassingStory: z.string().min(1, "Required"),
  fictionalRole: z.string().min(1, "Required"),
  offLimits: z.string().min(1, "Required"),
});

const emptyPlayer = {
  name: '',
  ageRange: '',
  occupation: '',
  relationshipStatus: '',
  personality: '',
  hobbies: '',
  nickname: '',
  funniestHabit: '',
  groupReputation: '',
  favouriteSaying: '',
  closestTo: '',
  arguesWith: '',
  embarrassingStory: '',
  fictionalRole: '',
  offLimits: '',
};

const customMysterySchema = z.object({
  contactName: z.string().min(1, "Contact name is required"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().min(5, "Mobile number is required"),
  preferredDate: z.date({ required_error: "Preferred date is required" }),
  guests: z.literal(6),
  naughtiness: z.enum(['gentle', 'cheeky', 'juicy', 'outrageous']),
  offLimits: z.string().optional().nullable(),
  consent: z.literal(true, { errorMap: () => ({ message: "You must agree to the terms" }) }),
  players: z.array(playerSchema).length(6, "Details for all six participants are required"),
});

// --- COMPONENTS ---

export default function Book() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const defaultTab = searchParams.get('type') === 'custom' ? 'custom' : 'general';
  
  const [isSuccess, setIsSuccess] = useState(false);

  const createBooking = useCreateBooking();
  const createCustom = useCreateCustomEnquiry();

  const generalForm = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: '',
      surname: '',
      email: '',
      mobile: '',
      guests: 6,
      experience: 'signature',
      occasion: '',
      stayingInGreyton: 'yes',
      accommodation: '',
      specialRequests: '',
    },
  });

  const customForm = useForm<z.infer<typeof customMysterySchema>>({
    resolver: zodResolver(customMysterySchema),
    defaultValues: {
      contactName: '',
      email: '',
      mobile: '',
      guests: 6,
      naughtiness: 'cheeky',
      offLimits: '',
      players: Array.from({ length: 6 }, () => ({ ...emptyPlayer })),
    },
  });

  const { fields } = useFieldArray({
    control: customForm.control,
    name: "players",
  });

  async function onGeneralSubmit(values: z.infer<typeof bookingSchema>) {
    try {
      await createBooking.mutateAsync({
        data: {
          ...values,
          preferredDate: format(values.preferredDate, 'yyyy-MM-dd'),
          alternativeDate: values.alternativeDate ? format(values.alternativeDate, 'yyyy-MM-dd') : null,
          consent: true,
        }
      });
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast.error("Failed to submit enquiry. Please try again or contact us directly.");
    }
  }

  async function onCustomSubmit(values: z.infer<typeof customMysterySchema>) {
    try {
      await createCustom.mutateAsync({
        data: {
          ...values,
          preferredDate: format(values.preferredDate, 'yyyy-MM-dd'),
          offLimits: values.offLimits || 'None',
          consent: true,
        }
      });
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast.error("Failed to submit questionnaire. Please try again or contact us directly.");
    }
  }

  if (isSuccess) {
    return (
      <div className="w-full min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card p-10 rounded-3xl text-center border border-border shadow-sm">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-primary" />
          </div>
          <h2 className="font-serif text-3xl font-bold mb-4">Your investigation has begun…</h2>
          <p className="text-muted-foreground mb-8">
            We'll be in touch shortly to confirm whether your chosen night is available.
          </p>
          <Button onClick={() => window.location.href = '/'} className="font-serif tracking-widest w-full">
            RETURN TO VILLAGE
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="case-book w-full py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <CaseIllustration name="confidential-dossier" className="case-book-art" />
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Book Your Murder</h1>
          <p className="text-muted-foreground text-lg">Select an experience below to begin.</p>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-12 min-h-14 h-auto p-1 bg-muted/50 rounded-xl">
            <TabsTrigger value="general" className="min-w-0 whitespace-normal text-center leading-tight px-1 sm:px-3 py-2 font-serif tracking-wide text-sm sm:text-base data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
              General Enquiry
            </TabsTrigger>
            <TabsTrigger value="custom" className="min-w-0 whitespace-normal text-center leading-tight px-1 sm:px-3 py-2 font-serif tracking-wide text-sm sm:text-base data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
              Custom Questionnaire
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm">
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-8">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={generalForm.control} name="firstName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl><Input {...field} className="bg-background" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={generalForm.control} name="surname" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Surname</FormLabel>
                        <FormControl><Input {...field} className="bg-background" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={generalForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl><Input type="email" {...field} className="bg-background" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={generalForm.control} name="mobile" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile / WhatsApp Number</FormLabel>
                        <FormControl><Input type="tel" {...field} className="bg-background" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={generalForm.control} name="preferredDate" render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Preferred Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" className={cn("w-full pl-3 text-left font-normal bg-background hover:bg-background/90", !field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={generalForm.control} name="alternativeDate" render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Alternative Date (Optional)</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" className={cn("w-full pl-3 text-left font-normal bg-background hover:bg-background/90", !field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={generalForm.control} name="experience" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Choose Experience</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background"><SelectValue placeholder="Select experience" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="signature">The Greyton Murder Mystery</SelectItem>
                            <SelectItem value="custom">Create Our Own Murder</SelectItem>
                            <SelectItem value="unsure">Not sure yet</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
                      <p className="text-sm font-medium">Number of Guests</p>
                      <p className="mt-1 font-serif text-2xl font-bold text-primary">
                        6
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Fixed for every murder mystery booking.
                      </p>
                    </div>
                  </div>

                  <FormField control={generalForm.control} name="occasion" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occasion</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background"><SelectValue placeholder="Select occasion" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Friends">Friends</SelectItem>
                          <SelectItem value="Birthday">Birthday</SelectItem>
                          <SelectItem value="Milestone birthday">Milestone birthday</SelectItem>
                          <SelectItem value="Corporate">Corporate</SelectItem>
                          <SelectItem value="Family gathering">Family gathering</SelectItem>
                          <SelectItem value="Reunion">Reunion</SelectItem>
                          <SelectItem value="Visitors to Greyton">Visitors to Greyton</SelectItem>
                          <SelectItem value="Hen / bachelor weekend">Hen / bachelor weekend</SelectItem>
                          <SelectItem value="Celebration">Celebration</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={generalForm.control} name="stayingInGreyton" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Are you staying in Greyton?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background"><SelectValue placeholder="Select option" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                            <SelectItem value="not_yet_booked">Not yet booked</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={generalForm.control} name="accommodation" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Where are you staying? (Optional)</FormLabel>
                        <FormControl><Input {...field} value={field.value || ''} className="bg-background" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={generalForm.control} name="specialRequests" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Requests</FormLabel>
                      <FormControl><Textarea {...field} value={field.value || ''} className="bg-background resize-none" rows={3} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={generalForm.control} name="consent" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border border-border rounded-xl bg-background/50">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer text-sm font-normal">
                          I consent to Greyton Murder Mysteries storing my details to contact me about this booking.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )} />

                  <Button type="submit" size="lg" className="w-full h-auto min-h-14 whitespace-normal text-center leading-tight px-3 py-3 font-serif tracking-widest text-sm sm:text-lg" disabled={createBooking.isPending}>
                    {createBooking.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    REQUEST YOUR MURDER NIGHT
                  </Button>
                </form>
              </Form>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-card border border-border rounded-3xl p-6 md:p-10 shadow-sm">
              
              <div className="mb-10 text-center">
                <h3 className="font-serif text-2xl font-bold mb-2 text-primary">Personalised Mystery Questionnaire</h3>
                <p className="text-muted-foreground text-sm">Fill out the details about your group so we can craft your unique story.</p>
              </div>

              <Form {...customForm}>
                <form onSubmit={customForm.handleSubmit(onCustomSubmit)} className="space-y-12">
                  
                  {/* ORGANISER DETAILS */}
                  <div className="space-y-6">
                    <h4 className="font-serif text-xl font-bold border-b border-border pb-2">Organiser Details</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={customForm.control} name="contactName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name</FormLabel>
                          <FormControl><Input {...field} className="bg-background" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={customForm.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl><Input type="email" {...field} className="bg-background" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField control={customForm.control} name="mobile" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile / WhatsApp</FormLabel>
                          <FormControl><Input type="tel" {...field} className="bg-background" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={customForm.control} name="preferredDate" render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Preferred Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant="outline" className={cn("w-full pl-3 text-left font-normal bg-background hover:bg-background/90", !field.value && "text-muted-foreground")}>
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
                        <p className="text-sm font-medium">Number of Participants</p>
                        <p className="mt-1 font-serif text-2xl font-bold text-primary">
                          6
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Fixed for every personalised mystery.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* NAUGHTINESS LEVEL */}
                  <div className="space-y-6">
                    <h4 className="font-serif text-xl font-bold border-b border-border pb-2">Tone of the Mystery</h4>
                    
                    <FormField control={customForm.control} name="naughtiness" render={({ field }) => (
                      <FormItem>
                        <FormLabel>How naughty can we make it?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background h-12">
                              <SelectValue placeholder="Select tone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="gentle">Very Gentle (Family-friendly fun)</SelectItem>
                            <SelectItem value="cheeky">Funny & Cheeky (Inside jokes, teasing)</SelectItem>
                            <SelectItem value="juicy">Juicy (Affairs, blackmail, scandals)</SelectItem>
                            <SelectItem value="outrageous">Absolutely Outrageous (You know your friends...)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={customForm.control} name="offLimits" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Anything completely off limits?</FormLabel>
                        <FormDescription>The game is designed to make your group laugh. Tell us what we should NOT joke about.</FormDescription>
                        <FormControl><Textarea {...field} value={field.value || ''} className="bg-background resize-none" rows={3} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  {/* SUSPECTS ARRAY */}
                  <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <div>
                        <h4 className="font-serif text-xl font-bold">The Six Participants</h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Complete every required field for all six people before submitting.
                        </p>
                      </div>
                    </div>

                    {fields.map((field, index) => (
                      <div key={field.id} className="p-6 md:p-8 bg-background border border-border rounded-2xl relative group">
                        <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary text-primary-foreground font-serif font-bold text-xl rounded-full flex items-center justify-center shadow-sm">
                          {index + 1}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                          <FormField control={customForm.control} name={`players.${index}.name`} render={({ field }) => (
                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={customForm.control} name={`players.${index}.ageRange`} render={({ field }) => (
                            <FormItem><FormLabel>Age Range</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          
                          <FormField control={customForm.control} name={`players.${index}.occupation`} render={({ field }) => (
                            <FormItem><FormLabel>Occupation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={customForm.control} name={`players.${index}.relationshipStatus`} render={({ field }) => (
                            <FormItem><FormLabel>Relationship Status (Optional)</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl><FormMessage /></FormItem>
                          )} />

                          <FormField control={customForm.control} name={`players.${index}.personality`} render={({ field }) => (
                            <FormItem><FormLabel>Personality (in 3 words)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={customForm.control} name={`players.${index}.hobbies`} render={({ field }) => (
                            <FormItem><FormLabel>Hobbies & Interests</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />

                          <FormField control={customForm.control} name={`players.${index}.nickname`} render={({ field }) => (
                            <FormItem><FormLabel>Nickname</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={customForm.control} name={`players.${index}.funniestHabit`} render={({ field }) => (
                            <FormItem><FormLabel>Funniest Habit</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />

                          <FormField control={customForm.control} name={`players.${index}.groupReputation`} render={({ field }) => (
                            <FormItem><FormLabel>What are they famous for?</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={customForm.control} name={`players.${index}.favouriteSaying`} render={({ field }) => (
                            <FormItem><FormLabel>Favourite Saying</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />

                          <FormField control={customForm.control} name={`players.${index}.closestTo`} render={({ field }) => (
                            <FormItem><FormLabel>Who are they closest to?</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={customForm.control} name={`players.${index}.arguesWith`} render={({ field }) => (
                            <FormItem><FormLabel>Who do they argue with most?</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                          <FormField control={customForm.control} name={`players.${index}.fictionalRole`} render={({ field }) => (
                            <FormItem><FormLabel>What fictional role would suit them?</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={customForm.control} name={`players.${index}.embarrassingStory`} render={({ field }) => (
                            <FormItem><FormLabel>Harmless embarrassing story</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="mt-6">
                          <FormField control={customForm.control} name={`players.${index}.offLimits`} render={({ field }) => (
                            <FormItem><FormLabel>Anything we should NOT joke about for them?</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <FormField control={customForm.control} name="consent" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border border-border rounded-xl bg-background/50 mt-12">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer text-sm font-normal">
                          I consent to Greyton Murder Mysteries storing these details for the purpose of creating our custom game.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )} />

                  <Button type="submit" size="lg" className="w-full h-auto min-h-14 whitespace-normal text-center leading-tight px-3 py-3 font-serif tracking-widest text-sm sm:text-lg" disabled={createCustom.isPending}>
                    {createCustom.isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                    SUBMIT QUESTIONNAIRE
                  </Button>
                </form>
              </Form>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
