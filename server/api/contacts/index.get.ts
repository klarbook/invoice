import { contacts } from "../../database/schema"

export default defineEventHandler(async (event) => {
  const { secure } = await requireUserSession(event)
  if (!secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const result = await useDrizzle().select().from(contacts).where(eq(contacts.organisationId, secure.organisationId))

  return result
})
