import { pgTable, timestamp, text, uuid, integer, date, numeric, jsonb } from "drizzle-orm/pg-core"
import { uuidv7 } from "uuidv7"

// Types
export type UserRole = "admin" | "user"

// Helpers
const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp({ withTimezone: true }),
}

const organisationId = {
  organisationId: uuid()
    .notNull()
    .references(() => organisations.id),
}

// Tables
export const organisations = pgTable("organisations", {
  id: uuid().primaryKey().$defaultFn(uuidv7),
  name: text().notNull(),
  //
  website: text(),
  email: text(),
  //
  address1: text(),
  address2: text(),
  address3: text(),
  city: text(),
  state: text(),
  country: text(),
  postalCode: text(),
  //
  ...timestamps,
})

export const users = pgTable("users", {
  id: uuid().primaryKey().$defaultFn(uuidv7),
  name: text().notNull(),
  role: text().$type<UserRole>().notNull().default("user"),
  email: text().notNull().unique(),
  password: text().notNull(),
  resetPasswordToken: text(),
  resetPasswordTokenValidUntil: timestamp({ withTimezone: true }),
  ...organisationId,
  ...timestamps,
})

export const sessions = pgTable("sessions", {
  token: text().primaryKey(),
  userId: uuid()
    .notNull()
    .references(() => users.id),
  ...timestamps,
})

export const contacts = pgTable("contacts", {
  id: uuid().primaryKey().$defaultFn(uuidv7),
  name: text().notNull(),
  //
  customerNo: text(),
  invoiceSequence: integer().notNull().default(1),
  //
  email: text(),
  //
  address1: text(),
  address2: text(),
  address3: text(),
  city: text(),
  state: text(),
  country: text(),
  postalCode: text(),
  //
  ...organisationId,
  ...timestamps,
})

export const invoices = pgTable("invoices", {
  id: uuid().primaryKey().$defaultFn(uuidv7),
  recipientId: uuid()
    .notNull()
    .references(() => contacts.id),
  invoiceNumber: text().notNull(),
  invoiceDate: date({ mode: "date" }).notNull(),
  dueDate: date({ mode: "date" }).notNull(),
  //
  data: jsonb(), // to avoid dataloss, we store the final invoice data in this field
  //
  sentAt: timestamp({ withTimezone: true }),
  paidAt: timestamp({ withTimezone: true }),
  cancelledAt: timestamp({ withTimezone: true }),
  ...organisationId,
  ...timestamps,
})

export const invoiceItems = pgTable("invoice_items", {
  id: uuid().primaryKey().$defaultFn(uuidv7),
  invoiceId: uuid()
    .notNull()
    .references(() => invoices.id),
  title: text().notNull(),
  description: text(),
  quantity: integer().notNull(),
  price: numeric({ precision: 16, scale: 2 }).notNull(),
  order: text().notNull(),
  //
  ...organisationId,
  ...timestamps,
})
