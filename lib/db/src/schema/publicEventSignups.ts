import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { publicEventDatesTable } from "./publicEventDates";

export const publicEventSignupsTable = pgTable("public_event_signups", {
  id: serial("id").primaryKey(),
  eventDateId: integer("event_date_id").references(() => publicEventDatesTable.id, { onDelete: "restrict" }),
  eventNumber: integer("event_number").notNull().default(1),
  name: text("name").notNull(),
  email: text("email"),
  address: text("address").notNull().default(""),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertPublicEventSignupSchema = createInsertSchema(
  publicEventSignupsTable,
).omit({
  id: true,
  eventNumber: true,
  createdAt: true,
});

export type InsertPublicEventSignup = z.infer<
  typeof insertPublicEventSignupSchema
>;
export type PublicEventSignup = typeof publicEventSignupsTable.$inferSelect;