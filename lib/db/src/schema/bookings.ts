import {
  boolean,
  date,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bookingsTable = pgTable("murder_mystery_bookings", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  surname: text("surname").notNull(),
  email: text("email").notNull(),
  mobile: text("mobile").notNull(),
  preferredDate: date("preferred_date", { mode: "string" }).notNull(),
  alternativeDate: date("alternative_date", { mode: "string" }),
  guests: integer("guests").notNull(),
  experience: text("experience").notNull(),
  occasion: text("occasion").notNull(),
  stayingInGreyton: text("staying_in_greyton").notNull(),
  accommodation: text("accommodation"),
  specialRequests: text("special_requests"),
  consent: boolean("consent").notNull(),
  status: text("status").notNull().default("NEW"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const customMysteryEnquiriesTable = pgTable(
  "custom_mystery_enquiries",
  {
    id: serial("id").primaryKey(),
    contactName: text("contact_name").notNull(),
    email: text("email").notNull(),
    mobile: text("mobile").notNull(),
    preferredDate: date("preferred_date", { mode: "string" }).notNull(),
    guests: integer("guests").notNull(),
    naughtiness: text("naughtiness").notNull(),
    players: jsonb("players").notNull(),
    offLimits: text("off_limits").notNull(),
    consent: boolean("consent").notNull(),
    status: text("status").notNull().default("NEW"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
);

export const murderMysterySettingsTable = pgTable("murder_mystery_settings", {
  id: integer("id").primaryKey().default(1),
  signaturePriceLabel: text("signature_price_label")
    .notNull()
    .default("Price on enquiry"),
  customPriceLabel: text("custom_price_label")
    .notNull()
    .default("Bespoke quote"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertCustomMysteryEnquirySchema = createInsertSchema(
  customMysteryEnquiriesTable,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
export type InsertCustomMysteryEnquiry = z.infer<
  typeof insertCustomMysteryEnquirySchema
>;
export type CustomMysteryEnquiry =
  typeof customMysteryEnquiriesTable.$inferSelect;