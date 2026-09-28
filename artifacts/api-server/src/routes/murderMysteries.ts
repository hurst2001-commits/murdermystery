import { Router, type IRouter, type RequestHandler } from "express";
import { and, asc, count, desc, eq, gte, isNull, max, sql } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import {
  CreateBookingBody,
  CreateBookingResponse,
  CreateCustomEnquiryBody,
  CreateCustomEnquiryResponse,
  CreatePublicEventSignupBody,
  CreatePublicEventSignupResponse,
  CreateAdminPublicEventDateBody,
  CreateAdminPublicEventDateResponse,
  DeleteAdminPublicEventSignupParams,
  DeleteAdminPublicEventDateParams,
  GetAdminDashboardResponse,
  GetAdminPricingResponse,
  GetPublicEventResponse,
  GetSiteContentResponse,
  ListAdminPublicEventSignupsResponse,
  ListAdminPublicEventDatesResponse,
  ListAdminBookingsResponse,
  MoveAdminPublicEventSignupBody,
  MoveAdminPublicEventSignupParams,
  MoveAdminPublicEventSignupResponse,
  UpdateAdminBookingBody,
  UpdateAdminBookingParams,
  UpdateAdminBookingResponse,
  UpdateAdminPublicEventSignupBody,
  UpdateAdminPublicEventSignupParams,
  UpdateAdminPublicEventSignupResponse,
  UpdateAdminPricingBody,
  UpdateAdminPricingResponse,
  UpdateAdminPublicEventDateBody,
  UpdateAdminPublicEventDateParams,
  UpdateAdminPublicEventDateResponse,
} from "@workspace/api-zod";
import {
  bookingsTable,
  customMysteryEnquiriesTable,
  db,
  murderMysterySettingsTable,
  publicEventDatesTable,
  publicEventSignupsTable,
} from "@workspace/db";
import { sendCustomerConfirmation, sendOwnerNotification } from "../lib/ownerEmail";

const router: IRouter = Router();

const toDateOnly = (value: Date): string => value.toISOString().slice(0, 10);
const defaultPricing = {
  signaturePriceLabel: "Price on enquiry",
  customPriceLabel: "Bespoke quote",
};
const publicEventCapacity = 6;
const publicEventPricePerPerson = 150;
const venue = "TBA";
const nowInGreyton = () => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const value = (part: string) => parts.find((item) => item.type === part)?.value;
  return { date: `${value("year")}-${value("month")}-${value("day")}`, time: `${value("hour")}:${value("minute")}` };
};
const todayInGreyton = () => nowInGreyton().date;
const isUpcoming = (date: string, time: string) => {
  const now = nowInGreyton();
  return date > now.date || (date === now.date && time > now.time);
};
const isValidSchedule = (date: string, time: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(date) &&
  !Number.isNaN(Date.parse(`${date}T00:00:00Z`)) &&
  new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date &&
  /^([01]\d|2[0-3]):[0-5]\d$/.test(time) &&
  isUpcoming(date, time);

const getPricing = async () => {
  const [settings] = await db
    .select({
      signaturePriceLabel: murderMysterySettingsTable.signaturePriceLabel,
      customPriceLabel: murderMysterySettingsTable.customPriceLabel,
    })
    .from(murderMysterySettingsTable)
    .where(eq(murderMysterySettingsTable.id, 1));
  return settings ?? defaultPricing;
};

const requireAuth: RequestHandler = (req, res, next) => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId ?? auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  if (
    process.env.EXTERNAL_DEPLOYMENT === "true" &&
    auth.userId !== process.env.EXTERNAL_ADMIN_USER_ID
  ) {
    res.status(403).json({ error: "Administrator access required" });
    return;
  }
  next();
};

const siteContent = {
  brand: {
    name: "Greyton Murder Mysteries",
    tagline: "Secrets. Lies. Murder. A night in Greyton you won't forget.",
    heroTitle: "There's been a murder in Greyton.",
    heroSubtitle: "Six suspects. Six secrets. One murderer.",
    heroCopy:
      "Gather your friends, step into character and spend an evening uncovering the secrets behind an original Greyton murder mystery.",
  },
  experiences: [
    {
      id: "signature",
      name: "The Greyton Murder Mystery",
      label: "The Original Greyton Murder Mystery",
      description:
        "A ready-to-play signature Greyton murder mystery for six players.",
      priceLabel: "Price on enquiry",
      features: [
        "Six character packs",
        "Personal invitations",
        "Six rounds of evidence and clues",
        "Game host",
        "Approximately three hours of entertainment",
      ],
    },
    {
      id: "custom",
      name: "Create Our Own Murder",
      label: "Premium Personalised Experience",
      description:
        "A completely original mystery inspired by your friends, family or colleagues.",
      priceLabel: "Bespoke quote",
      features: [
        "Original storyline",
        "Characters inspired by your group",
        "Personalised evidence and invitations",
        "Custom motives, secrets and clues",
        "Hosted final reveal",
      ],
    },
  ],
  steps: [
    { number: 1, title: "Book your evening", description: "Choose an available date for your group." },
    { number: 2, title: "Meet the suspects", description: "Each guest is secretly assigned a character." },
    { number: 3, title: "Get your private invitation", description: "Receive what you may share—and what you definitely may not." },
    { number: 4, title: "Dress the part", description: "Come as your character. Enthusiasm helps enormously." },
    { number: 5, title: "Six rounds. More secrets.", description: "Interrogate your friends, defend yourself and lie if necessary." },
    { number: 6, title: "Solve the murder", description: "Make your final accusation before the murderer is revealed." },
  ],
  suspects: [
    { name: "Helen Botha", role: "The respected Greyton social figure", description: "Elegant. Connected. Composed. But somebody knows something about her past." },
    { name: "Sophie Jacobs", role: "The passionate campaigner", description: "Intelligent. Outspoken. Married. And protecting something extremely personal." },
    { name: "Charlotte “Lottie” van Wyk", role: "The Greyton artist", description: "Colourful. Emotional. Creative. Her livelihood—and reputation—are under threat." },
    { name: "David “Dave” Fourie", role: "The retired businessman", description: "Confident. Successful. Usually nobody's fool. So why is he suddenly so desperate?" },
    { name: "Michael “Mike” Steyn", role: "The mountain man", description: "Fiercely protective of Greyton's mountains. Unfortunately, Mike also has a temper." },
    { name: "Andrew “Andy” Marais", role: "The victim's younger brother", description: "Family. Money. Betrayal. What could possibly go wrong?" },
  ],
  testimonials: [
    { quote: "Absolutely hilarious. By Round Three nobody trusted anybody.", attribution: "Sample testimonial", isSample: true },
    { quote: "We arrived as friends. We left accusing each other of murder.", attribution: "Sample testimonial", isSample: true },
    { quote: "The most fun we've had on a weekend in Greyton.", attribution: "Sample testimonial", isSample: true },
  ],
  faqs: [
    { question: "Do I need acting experience?", answer: "Absolutely not. You simply play your character and follow the information provided." },
    { question: "Do we need exactly six people?", answer: "The signature Greyton mystery is designed around six principal suspects. Contact us for other group sizes or a personalised game." },
    { question: "Is it scary?", answer: "No. It is mysterious, theatrical, social and funny rather than frightening or gruesome." },
    { question: "How long does it take?", answer: "Allow approximately 2½–3 hours." },
    { question: "Will you use real secrets?", answer: "Only information deliberately supplied by the organiser. The scandals and crimes we create are fictional, and you control what is off limits." },
  ],
};

router.get("/site-content", async (_req, res): Promise<void> => {
  const pricing = await getPricing();
  res.json(
    GetSiteContentResponse.parse({
      ...siteContent,
      experiences: siteContent.experiences.map((experience) => ({
        ...experience,
        priceLabel:
          experience.id === "signature"
            ? pricing.signaturePriceLabel
            : pricing.customPriceLabel,
      })),
    }),
  );
});

router.post("/bookings", async (req, res): Promise<void> => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success || !parsed.data.consent) {
    res.status(400).json({ error: "Please check the enquiry details and consent." });
    return;
  }
  const [booking] = await db
    .insert(bookingsTable)
    .values({
      ...parsed.data,
      preferredDate: toDateOnly(parsed.data.preferredDate),
      alternativeDate: parsed.data.alternativeDate
        ? toDateOnly(parsed.data.alternativeDate)
        : null,
    })
    .returning();
  res.status(201).json(CreateBookingResponse.parse(booking));
  void sendOwnerNotification({
    key: `booking-${booking.id}`,
    subject: `New booking enquiry: ${booking.firstName} ${booking.surname}`,
    lines: [
      `Name: ${booking.firstName} ${booking.surname}`,
      `Email: ${booking.email}`,
      `Mobile: ${booking.mobile}`,
      `Experience: ${booking.experience}`,
      `Preferred date: ${booking.preferredDate}`,
    ],
  }).catch((err: unknown) => {
    req.log.error({ err, bookingId: booking.id }, "Booking notification email failed");
  });
  void sendCustomerConfirmation(booking.email, "We received your murder mystery enquiry", [
    `Hello ${booking.firstName},`,
    "",
    "Thank you for your interest in Greyton Murder Mysteries. We have received your booking enquiry:",
    `Experience: ${booking.experience}`,
    `Preferred date: ${booking.preferredDate}`,
    `Number of guests: ${booking.guests}`,
    "",
    "This is an acknowledgement of your enquiry, not a confirmed booking. We will be in touch to discuss availability and the next steps.",
  ]).catch((err: unknown) => {
    req.log.error({ err, bookingId: booking.id }, "Booking confirmation email failed");
  });
});

router.post("/custom-enquiries", async (req, res): Promise<void> => {
  const parsed = CreateCustomEnquiryBody.safeParse(req.body);
  if (!parsed.success || !parsed.data.consent) {
    res.status(400).json({ error: "Please check the enquiry details and consent." });
    return;
  }
  const [enquiry] = await db
    .insert(customMysteryEnquiriesTable)
    .values({
      ...parsed.data,
      preferredDate: toDateOnly(parsed.data.preferredDate),
    })
    .returning();
  res.status(201).json(CreateCustomEnquiryResponse.parse(enquiry));
  void sendOwnerNotification({
    key: `custom-enquiry-${enquiry.id}`,
    subject: `New custom mystery enquiry: ${enquiry.contactName}`,
    lines: [
      `Contact: ${enquiry.contactName}`,
      `Email: ${enquiry.email}`,
      `Mobile: ${enquiry.mobile}`,
      `Preferred date: ${enquiry.preferredDate}`,
      `Guests: ${enquiry.guests}`,
    ],
  }).catch((err: unknown) => {
    req.log.error({ err, enquiryId: enquiry.id }, "Custom enquiry notification email failed");
  });
  void sendCustomerConfirmation(enquiry.email, "We received your custom mystery enquiry", [
    `Hello ${enquiry.contactName},`,
    "",
    "Thank you for telling us about your group. We have received your custom mystery enquiry:",
    `Preferred date: ${enquiry.preferredDate}`,
    `Number of guests: ${enquiry.guests}`,
    "",
    "This is an acknowledgement of your enquiry, not a confirmed booking. We will be in touch to discuss your experience and the next steps.",
  ]).catch((err: unknown) => {
    req.log.error({ err, enquiryId: enquiry.id }, "Custom enquiry confirmation email failed");
  });
});

router.get("/public-event", async (_req, res): Promise<void> => {
  const dates = await db.select().from(publicEventDatesTable)
    .where(gte(publicEventDatesTable.date, todayInGreyton()))
    .orderBy(asc(publicEventDatesTable.date), asc(publicEventDatesTable.time));
  const availability = await Promise.all(dates.filter((date) => isUpcoming(date.date, date.time)).map(async (date) => {
    const [latest] = await db.select({ value: max(publicEventSignupsTable.eventNumber) })
      .from(publicEventSignupsTable).where(eq(publicEventSignupsTable.eventDateId, date.id));
    const latestNumber = latest?.value ?? 1;
    const [result] = await db.select({ value: count() }).from(publicEventSignupsTable)
      .where(and(eq(publicEventSignupsTable.eventDateId, date.id), eq(publicEventSignupsTable.eventNumber, latestNumber)));
    const latestCount = Number(result?.value ?? 0);
    const signedUp = latestCount >= publicEventCapacity ? 0 : latestCount;
    return { ...date, venue, eventNumber: latestNumber + (latestCount >= publicEventCapacity ? 1 : 0),
      signedUp, spotsRemaining: publicEventCapacity - signedUp };
  }));

  res.json(
    GetPublicEventResponse.parse({
      capacity: publicEventCapacity,
      pricePerPerson: publicEventPricePerPerson,
      dates: availability,
    }),
  );
});

router.post("/public-event-signups", async (req, res): Promise<void> => {
  const body = CreatePublicEventSignupBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Please provide a valid name, email, address, phone and WhatsApp number." });
    return;
  }

  const result = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(150006)`);
    const [date] = await tx.select().from(publicEventDatesTable)
      .where(and(eq(publicEventDatesTable.id, body.data.eventDateId), gte(publicEventDatesTable.date, todayInGreyton())));
    if (!date || !isUpcoming(date.date, date.time)) return null;
    const [latest] = await tx
      .select({ value: max(publicEventSignupsTable.eventNumber) })
      .from(publicEventSignupsTable)
      .where(eq(publicEventSignupsTable.eventDateId, date.id));
    const latestNumber = latest?.value ?? 1;
    const [current] = await tx
      .select({ value: count() })
      .from(publicEventSignupsTable)
      .where(and(eq(publicEventSignupsTable.eventDateId, date.id), eq(publicEventSignupsTable.eventNumber, latestNumber)));
    const latestCount = Number(current?.value ?? 0);
    const eventNumber =
      latestCount >= publicEventCapacity ? latestNumber + 1 : latestNumber;
    const signedUp = eventNumber === latestNumber ? latestCount : 0;

    const [signup] = await tx
      .insert(publicEventSignupsTable)
      .values({ ...body.data, eventDateId: date.id, eventNumber })
      .returning();

    const groupCompleted = signedUp + 1 === publicEventCapacity;
    return {
      ...signup,
      date: date.date,
      time: date.time,
      title: date.title,
      activeEventNumber: eventNumber + (groupCompleted ? 1 : 0),
      spotsRemaining: groupCompleted ? publicEventCapacity : publicEventCapacity - signedUp - 1,
      isFull: false,
    };
  });

  if (!result) {
    res.status(409).json({ error: "This date is no longer available. Please choose another date." });
    return;
  }
  res.status(201).json(CreatePublicEventSignupResponse.parse(result));
  void sendOwnerNotification({
    key: `public-event-signup-${result.id}`,
    subject: `New public event group ${result.eventNumber} registration: ${result.name}`,
    lines: [
      `Group: ${result.eventNumber}`,
      `Mystery: ${result.title ?? "Title to be announced"}`,
      `Date: ${result.date} at ${result.time} (Venue TBA)`,
      `Name: ${result.name}`,
      `Email: ${result.email}`,
      `Address: ${result.address}`,
      `Phone: ${result.phone}`,
      `WhatsApp: ${result.whatsapp}`,
    ],
  }).catch((err: unknown) => {
    req.log.error({ err, signupId: result.id }, "Public event signup email failed");
  });
  void sendCustomerConfirmation(body.data.email, "Your public murder mystery place is reserved", [
    `Hello ${result.name},`,
    "",
    "Your place at a Greyton Murder Mysteries public event has been reserved. Here are your registration details:",
    `Mystery: ${result.title ?? "Title to be announced"}`,
    `Date: ${result.date} at ${result.time}`,
    `Group: ${result.eventNumber}`,
    `Price: R${publicEventPricePerPerson} per person`,
    "",
    "The venue is still to be announced. The Game Master will contact you via WhatsApp with the location and event details. No payment has been taken by this registration.",
  ]).catch((err: unknown) => {
    req.log.error({ err, signupId: result.id }, "Public event confirmation email failed");
  });
});

router.get("/admin/dashboard", requireAuth, async (_req, res): Promise<void> => {
  const today = new Date().toISOString().slice(0, 10);
  const [bookingCounts, customCounts, newBookings, confirmedBookings, upcoming] =
    await Promise.all([
      db.select({ value: count() }).from(bookingsTable),
      db.select({ value: count() }).from(customMysteryEnquiriesTable),
      db.select({ value: count() }).from(bookingsTable).where(eq(bookingsTable.status, "NEW")),
      db.select({ value: count() }).from(bookingsTable).where(eq(bookingsTable.status, "CONFIRMED")),
      db
        .select({ value: count() })
        .from(bookingsTable)
        .where(
          and(
            gte(bookingsTable.preferredDate, today),
            sql`${bookingsTable.status} <> 'CANCELLED'`,
          ),
        ),
    ]);
  res.json(
    GetAdminDashboardResponse.parse({
      total: Number(bookingCounts[0]?.value ?? 0) + Number(customCounts[0]?.value ?? 0),
      newCount: Number(newBookings[0]?.value ?? 0),
      confirmedCount: Number(confirmedBookings[0]?.value ?? 0),
      upcomingCount: Number(upcoming[0]?.value ?? 0),
    }),
  );
});

router.get("/admin/pricing", requireAuth, async (_req, res): Promise<void> => {
  res.json(GetAdminPricingResponse.parse(await getPricing()));
});

router.get("/admin/public-event-signups", requireAuth, async (_req, res): Promise<void> => {
  const signups = await db
    .select()
    .from(publicEventSignupsTable)
    .orderBy(desc(publicEventSignupsTable.eventNumber), asc(publicEventSignupsTable.id));
  res.json(ListAdminPublicEventSignupsResponse.parse(signups));
});

router.patch("/admin/public-event-signups/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateAdminPublicEventSignupParams.safeParse(req.params);
  const body = UpdateAdminPublicEventSignupBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Provide valid participant details." });
    return;
  }
  const name = body.data.name.trim();
  const address = body.data.address.trim();
  const phone = body.data.phone.trim();
  const whatsapp = body.data.whatsapp.trim();
  if (name.length < 2 || phone.length < 5 || whatsapp.length < 5) {
    res.status(400).json({ error: "Name, phone and WhatsApp number are required." });
    return;
  }
  const [signup] = await db.update(publicEventSignupsTable)
    .set({ name, address, phone, whatsapp })
    .where(eq(publicEventSignupsTable.id, params.data.id))
    .returning();
  if (!signup) {
    res.status(404).json({ error: "Participant not found." });
    return;
  }
  res.json(UpdateAdminPublicEventSignupResponse.parse(signup));
});

router.patch("/admin/public-event-signups/:id/group", requireAuth, async (req, res): Promise<void> => {
  const params = MoveAdminPublicEventSignupParams.safeParse(req.params);
  const body = MoveAdminPublicEventSignupBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Choose a valid destination group." });
    return;
  }
  const result = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(150006)`);
    const [signup] = await tx.select().from(publicEventSignupsTable)
      .where(eq(publicEventSignupsTable.id, params.data.id));
    if (!signup) return { status: 404 as const };
    if (signup.eventNumber === body.data.eventNumber) return { status: 400 as const };

    const sameDate = signup.eventDateId === null
      ? isNull(publicEventSignupsTable.eventDateId)
      : eq(publicEventSignupsTable.eventDateId, signup.eventDateId);
    const [latest] = await tx.select({ value: max(publicEventSignupsTable.eventNumber) })
      .from(publicEventSignupsTable).where(sameDate);
    if (body.data.eventNumber > (latest?.value ?? 1) + 1) return { status: 409 as const };
    const [destination] = await tx.select({ value: count() })
      .from(publicEventSignupsTable)
      .where(and(sameDate, eq(publicEventSignupsTable.eventNumber, body.data.eventNumber)));
    if (Number(destination?.value ?? 0) >= publicEventCapacity) return { status: 409 as const };

    const [moved] = await tx.update(publicEventSignupsTable)
      .set({ eventNumber: body.data.eventNumber })
      .where(eq(publicEventSignupsTable.id, signup.id))
      .returning();
    return { status: 200 as const, signup: moved };
  });
  if (result.status !== 200) {
    res.status(result.status).json({
      error: result.status === 404 ? "Participant not found."
        : result.status === 400 ? "Participant is already in that group."
        : "Destination group is full or no longer available.",
    });
    return;
  }
  res.json(MoveAdminPublicEventSignupResponse.parse(result.signup));
});

router.delete("/admin/public-event-signups/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteAdminPublicEventSignupParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid participant." });
    return;
  }
  const removed = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(150006)`);
    return tx.delete(publicEventSignupsTable)
      .where(eq(publicEventSignupsTable.id, params.data.id))
      .returning({ id: publicEventSignupsTable.id });
  });
  if (!removed.length) {
    res.status(404).json({ error: "Participant not found." });
    return;
  }
  res.sendStatus(204);
});

router.get("/admin/public-event-dates", requireAuth, async (_req, res): Promise<void> => {
  const dates = await db.select().from(publicEventDatesTable)
    .orderBy(asc(publicEventDatesTable.date), asc(publicEventDatesTable.time));
  res.json(ListAdminPublicEventDatesResponse.parse(dates.map((date) => ({ ...date, venue }))));
});

router.post("/admin/public-event-dates", requireAuth, async (req, res): Promise<void> => {
  const body = CreateAdminPublicEventDateBody.safeParse(req.body);
  if (!body.success || !isValidSchedule(body.data.date, body.data.time) || !body.data.title.trim()) {
    res.status(400).json({ error: "Provide a mystery title and a valid upcoming date and time." });
    return;
  }
  const result = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(150006)`);
    const existing = await tx.select().from(publicEventDatesTable)
      .where(gte(publicEventDatesTable.date, todayInGreyton()));
    if (existing.length >= 6) return null;
    if (existing.some((date) => date.date === body.data.date && date.time === body.data.time)) return null;
    const [created] = await tx.insert(publicEventDatesTable)
      .values({ ...body.data, title: body.data.title.trim() }).returning();
    return created;
  });
  if (!result) {
    res.status(409).json({ error: "You can schedule up to six upcoming dates, without duplicates." });
    return;
  }
  res.status(201).json(CreateAdminPublicEventDateResponse.parse({ ...result, venue }));
});

router.put("/admin/public-event-dates/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateAdminPublicEventDateParams.safeParse({ id: Number(req.params.id) });
  const body = UpdateAdminPublicEventDateBody.safeParse(req.body);
  if (!params.success || !body.success || !isValidSchedule(body.data.date, body.data.time) || !body.data.title.trim()) {
    res.status(400).json({ error: "Provide a mystery title and a valid upcoming date and time." });
    return;
  }
  const result = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(150006)`);
    const [existing] = await tx.select().from(publicEventDatesTable).where(eq(publicEventDatesTable.id, params.data.id));
    if (!existing) return { status: 404 as const };
    const [registrations] = await tx.select({ value: count() }).from(publicEventSignupsTable)
      .where(eq(publicEventSignupsTable.eventDateId, existing.id));
    if (Number(registrations?.value ?? 0) > 0 &&
      (existing.date !== body.data.date || existing.time !== body.data.time)) return { status: 409 as const };
    const [duplicate] = await tx.select().from(publicEventDatesTable)
      .where(and(eq(publicEventDatesTable.date, body.data.date), eq(publicEventDatesTable.time, body.data.time)));
    if (duplicate && duplicate.id !== existing.id) return { status: 409 as const };
    const [updated] = await tx.update(publicEventDatesTable).set({ ...body.data, title: body.data.title.trim() })
      .where(eq(publicEventDatesTable.id, existing.id)).returning();
    return { status: 200 as const, date: updated };
  });
  if (result.status !== 200) {
    res.status(result.status).json({ error: result.status === 404 ? "Date not found." : "Date/time cannot change after registration, or it duplicates another date." });
    return;
  }
  res.json(UpdateAdminPublicEventDateResponse.parse({ ...result.date, venue }));
});

router.delete("/admin/public-event-dates/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteAdminPublicEventDateParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid date ID." });
    return;
  }
  const status = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(150006)`);
    const [existing] = await tx.select().from(publicEventDatesTable).where(eq(publicEventDatesTable.id, params.data.id));
    if (!existing) return 404;
    const [registrations] = await tx.select({ value: count() }).from(publicEventSignupsTable)
      .where(eq(publicEventSignupsTable.eventDateId, existing.id));
    if (Number(registrations?.value ?? 0) > 0) return 409;
    await tx.delete(publicEventDatesTable).where(eq(publicEventDatesTable.id, existing.id));
    return 204;
  });
  if (status !== 204) {
    res.status(status).json({ error: status === 404 ? "Date not found." : "Cannot remove a date with registrations." });
    return;
  }
  res.status(204).end();
});

router.put("/admin/pricing", requireAuth, async (req, res): Promise<void> => {
  const body = UpdateAdminPricingBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Please provide both public price labels." });
    return;
  }

  const [settings] = await db
    .insert(murderMysterySettingsTable)
    .values({ id: 1, ...body.data })
    .onConflictDoUpdate({
      target: murderMysterySettingsTable.id,
      set: body.data,
    })
    .returning({
      signaturePriceLabel: murderMysterySettingsTable.signaturePriceLabel,
      customPriceLabel: murderMysterySettingsTable.customPriceLabel,
    });

  res.json(UpdateAdminPricingResponse.parse(settings));
});

router.get("/admin/bookings", requireAuth, async (_req, res): Promise<void> => {
  const bookings = await db
    .select()
    .from(bookingsTable)
    .orderBy(asc(bookingsTable.preferredDate));
  res.json(ListAdminBookingsResponse.parse(bookings));
});

router.patch("/admin/bookings/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateAdminBookingParams.safeParse(req.params);
  const body = UpdateAdminBookingBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid booking update." });
    return;
  }
  const [booking] = await db
    .update(bookingsTable)
    .set(body.data)
    .where(eq(bookingsTable.id, params.data.id))
    .returning();
  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(UpdateAdminBookingResponse.parse(booking));
});

export default router;