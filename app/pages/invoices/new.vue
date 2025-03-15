<script setup lang="ts">
import { ForwardIcon, ArrowLeftIcon, PlusIcon, Trash2Icon, SaveIcon, BadgePlusIcon } from "lucide-vue-next"
import { uuidv7 } from "uuidv7"
import { LexoRank } from "lexorank"

const { data: contacts, refresh: refreshContacts } = await useFetch("/api/contacts")
const { data: organisation } = await useFetch("/api/organisation")

const contactOptions = computed(() => contacts.value?.map((contact) => ({ value: contact.id, display: contact.name })) ?? [])

const recipientId = ref(null)
const recipient = computed(() => contacts.value?.find((contact) => contact.id === recipientId.value) ?? null)
const invoiceDate = ref(null)
const dueDate = ref(null)

const lineItems = ref<any[]>([])

const itemOrder = ref(LexoRank.min())

function nextItemOrder() {
  itemOrder.value = itemOrder.value.genNext()
  return itemOrder.value.toString()
}

function addLineItem() {
  lineItems.value.push({
    id: uuidv7(),
    title: "",
    description: "",
    quantity: 1,
    price: 0,
    order: nextItemOrder(),
  })
}

function removeLineItem(id: string) {
  lineItems.value = lineItems.value.filter((lineItem) => lineItem.id !== id)
}

async function invoiceCreate() {
  await navigateTo("/invoices/new")
}

// Preview of invoice data

const data = computed(() => {
  const data = {
    sender: organisation.value,
    recipient: recipient.value,
    invoiceDate: invoiceDate.value,
    dueDate: dueDate.value,
    lineItems: lineItems.value,
  }

  return data
})

// Modal: New contact

const modalContact = ref(false)

const contactName = ref("")
const contactEmail = ref("")
const contactAddress1 = ref("")
const contactAddress2 = ref("")
const contactAddress3 = ref("")
const contactCity = ref("")
const contactState = ref("")
const contactCountry = ref("")
const contactPostalCode = ref("")

async function contactCreate() {
  await $fetch("/api/contacts", {
    method: "POST",
    body: {
      name: contactName.value,
      email: contactEmail.value,
      address1: contactAddress1.value,
      address2: contactAddress2.value,
      address3: contactAddress3.value,
      city: contactCity.value,
      state: contactState.value,
      country: contactCountry.value,
      postalCode: contactPostalCode.value,
    },
  })

  await refreshContacts()
  modalContact.value = false
}
</script>

<template>
  <DPage>
    <DHeader>
      <DButton to="/invoices" variant="secondary">Cancel</DButton>

      <template #right>
        <!-- <DButton :icon-left="ForwardIcon" @click="invoiceCreate">Send invoice</DButton> -->
        <DButton @click="invoiceCreate">Save invoice</DButton>
      </template>
    </DHeader>

    <div class="grid grid-cols-2 divide-x divide-neutral-200">
      <div class="flex flex-col gap-4 overflow-scroll p-6">
        <div class="flex flex-col gap-1">
          <DLabel>Recipient</DLabel>
          <div class="flex gap-1">
            <!-- <DInput v-model="recipient" placeholder="Search for a contact" class="w-full" /> -->

            <DSelect v-model="recipientId" :options="contactOptions" placeholder="Search for a contact" class="w-full" />

            <DButton :icon-left="PlusIcon" variant="secondary" class="h-full" @click="modalContact = true"></DButton>
          </div>
        </div>

        <div class="flex w-full flex-row gap-4">
          <div class="flex w-full flex-col gap-1">
            <DLabel>Invoice date</DLabel>
            <DInput v-model="invoiceDate" type="date" placeholder="Invoice date" class="w-full" />
          </div>

          <div class="flex w-full flex-col gap-1">
            <DLabel>Due date</DLabel>
            <DInput v-model="dueDate" type="date" placeholder="Due date" class="w-full" />
          </div>
        </div>

        <div class="flex w-full flex-col gap-1">
          <DLabel>Line items</DLabel>

          <div v-if="lineItems.length > 0" class="mt-1 mb-2">
            <div class="mb-2 grid grid-cols-[5fr_1fr_1fr_36px] gap-1">
              <DLabel>Item</DLabel>
              <DLabel>Quantity</DLabel>
              <DLabel>Price</DLabel>
            </div>

            <div class="flex flex-col gap-2">
              <div v-for="lineItem in lineItems" class="grid grid-cols-[5fr_1fr_1fr_36px] items-start gap-1">
                <div class="flex flex-col gap-1">
                  <DInput v-model="lineItem.title" placeholder="Title" class="w-full" />
                  <DTextarea v-model="lineItem.description" placeholder="Description" class="w-full" />
                </div>
                <DInput v-model.number="lineItem.quantity" placeholder="Quantity" class="w-full text-right" />
                <DInput v-model.number="lineItem.price" placeholder="Price" class="w-full text-right" />
                <DButton :icon-left="Trash2Icon" variant="secondary" class="aspect-square" @click="removeLineItem(lineItem.id)" />
              </div>
            </div>
          </div>

          <div>
            <DButton :icon-left="PlusIcon" variant="secondary" class="w-fit" @click="addLineItem">Add line item</DButton>
          </div>
        </div>
      </div>
      <div class="h-full overflow-scroll p-4">
        <pre class="overflow-auto text-xs">{{ data }}</pre>
      </div>
    </div>

    <DModal titel="New contact" v-if="modalContact" @close="modalContact = false" confirm-text="Save" @confirm="contactCreate">
      <div class="flex flex-col gap-2 p-4">
        <div class="flex w-full flex-col gap-1">
          <DLabel>Name</DLabel>
          <DInput v-model="contactName" type="text" placeholder="Name" class="w-full" />
        </div>

        <div class="flex w-full flex-col gap-1">
          <DLabel>Email</DLabel>
          <DInput v-model="contactEmail" type="email" placeholder="Email" class="w-full" />
        </div>

        <div class="flex w-full flex-col gap-1">
          <DLabel>Address 1</DLabel>
          <DInput v-model="contactAddress1" type="text" placeholder="Address 1" class="w-full" />
        </div>

        <div class="flex w-full flex-col gap-1">
          <DLabel>Address 2</DLabel>
          <DInput v-model="contactAddress2" type="text" placeholder="Address 2" class="w-full" />
        </div>

        <div class="flex w-full flex-col gap-1">
          <DLabel>Address 3</DLabel>
          <DInput v-model="contactAddress3" type="text" placeholder="Address 3" class="w-full" />
        </div>

        <div class="flex w-full flex-row gap-2">
          <div class="flex w-full flex-col gap-1">
            <DLabel>Postal code</DLabel>
            <DInput v-model="contactPostalCode" type="text" placeholder="Postal code" class="w-full" />
          </div>

          <div class="flex w-full flex-col gap-1">
            <DLabel>City</DLabel>
            <DInput v-model="contactCity" type="text" placeholder="City" class="w-full" />
          </div>
        </div>

        <div class="flex w-full flex-col gap-1">
          <DLabel>State</DLabel>
          <DInput v-model="contactState" type="text" placeholder="State" class="w-full" />
        </div>

        <div class="flex w-full flex-col gap-1">
          <DLabel>Country</DLabel>
          <DInput v-model="contactCountry" type="text" placeholder="Country" class="w-full" />
        </div>
      </div>
    </DModal>
  </DPage>
</template>
