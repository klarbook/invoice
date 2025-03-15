import { invoices } from "../../database/schema"

export default defineEventHandler(async (event) => {
  const { secure } = await requireUserSession(event)
  if (!secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const result = await useDrizzle().select().from(invoices).where(eq(invoices.organisationId, secure.organisationId))

  return result
})
