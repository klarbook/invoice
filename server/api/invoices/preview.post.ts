import { contacts, organisations } from "~~/server/database/schema"
import { readFile } from "fs/promises"
import { z } from "zod"

const bodySchema = z.object({
  recipientId: z.string().uuid(),
  invoiceDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  lineItems: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      quantity: z.number(),
      price: z.number(),
      order: z.string(),
    }),
  ),
})

export default defineEventHandler(async (event) => {
  const { secure } = await requireUserSession(event)
  if (!secure) throw createError({ statusCode: 401, message: "Unauthorized" })

  const [organisation] = await useDrizzle().select().from(organisations).where(eq(organisations.id, secure.organisationId)).limit(1)

  const body = await readValidatedBody(event, bodySchema.parse)

  const [contact] = await useDrizzle()
    .select()
    .from(contacts)
    .where(and(eq(contacts.id, body.recipientId), eq(contacts.organisationId, secure.organisationId)))
    .limit(1)

  const invoiceNo = `${contact.customerNo}-${contact.invoiceSequence.toString().padStart(4, "0")}-DRAFT`

  // Node read template from ./templates/template.typ
  const template = await readFile("./templates/template.typ", "utf8")

  const response = await fetch("http://localhost:3001/render", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      template,
      data: {
        sender: {
          name: organisation.name,
          email: organisation.email,
          address1: organisation.address1,
          address2: organisation.address2,
          address3: organisation.address3,
          city: organisation.city,
          state: organisation.state,
          country: organisation.country,
          postalCode: organisation.postalCode,
        },
        recipient: {
          name: contact.name,
          email: contact.email,
          address1: contact.address1,
          address2: contact.address2,
          address3: contact.address3,
          city: contact.city,
          state: contact.state,
          country: contact.country,
          postalCode: contact.postalCode,
        },
        invoiceNumber: invoiceNo,
        invoiceDate: body.invoiceDate.toISOString().split("T")[0],
        dueDate: body.dueDate.toISOString().split("T")[0],
        lineItems: body.lineItems,
      },
    }),
  })

  console.log(response)

  const pdf = await response.arrayBuffer()

  return new Response(pdf, { headers: { "Content-Type": "application/pdf" } })
})
