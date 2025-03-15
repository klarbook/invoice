import type { invoices, users } from "~~/server/database/schema"

export type DUser = typeof users.$inferSelect
export type DInvoice = typeof invoices.$inferSelect
