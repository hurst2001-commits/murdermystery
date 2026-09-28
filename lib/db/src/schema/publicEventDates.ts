import { date, pgTable, serial, text, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const publicEventDatesTable = pgTable(
  "public_event_dates",
  {
    id: serial("id").primaryKey(),
    date: date("date", { mode: "string" }).notNull(),
    time: text("time").notNull(),
    title: text("title"),
  },
  (table) => [unique("public_event_dates_date_time_unique").on(table.date, table.time)],
);

export const insertPublicEventDateSchema = createInsertSchema(publicEventDatesTable).omit({ id: true });
export type InsertPublicEventDate = z.infer<typeof insertPublicEventDateSchema>;
export type PublicEventDate = typeof publicEventDatesTable.$inferSelect;