import { z } from "zod"
import { contacts } from "../../database/schema"
import { customAlphabet } from "nanoid"

const customerNoId = customAlphabet("123456789ABCDEFGHJKLMNPQRSTUVWXYZ", 6)

const bodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  address1: z.string(),
  address2: z.string(),
  address3: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  postalCode: z.string(),
})

export default defineEventHandler(async (event) => {
  const { secure } = await requireUserSession(event)
  if (!secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const body = await readValidatedBody(event, bodySchema.parse)

  await useDrizzle().insert(contacts).values({
    customerNo: customerNoId(),
    //
    name: body.name,
    email: body.email,
    //
    address1: body.address1,
    address2: body.address2,
    address3: body.address3,
    city: body.city,
    state: body.state,
    country: body.country,
    postalCode: body.postalCode,
    //
    organisationId: secure.organisationId,
  })

  return {}
})
