import { organisations } from "~~/server/database/schema"

export default defineEventHandler(async (event) => {
  const { secure } = await requireUserSession(event)
  if (!secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const [result] = await useDrizzle().select().from(organisations).where(eq(organisations.id, secure.organisationId))

  return result
})
