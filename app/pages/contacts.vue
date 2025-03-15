<script setup lang="ts">
import { PlusIcon } from "lucide-vue-next"

const search = ref("")

const { data: contacts } = await useFetch("/api/contacts", {
  params: {
    search: search,
  },
})

async function contactCreate() {
  await navigateTo("/contacts/new")
}

function contactAddress(contact: any) {
  return `${contact.address1}, ${contact.postalCode} ${contact.city}, ${contact.state} ${contact.country}`
}
</script>

<template>
  <DPage>
    <DHeader>
      <DHeaderTitle>Contacts</DHeaderTitle>
      <DInputSearch v-model="search" class="hidden md:block" />

      <template #right>
        <DButton :icon-left="PlusIcon" @click="contactCreate">New contact</DButton>
      </template>
    </DHeader>

    <div class="block min-h-0 px-4 pt-2.5">
      <div class="grid grid-cols-[1fr_2fr_4fr] items-center justify-between gap-4 border-b border-neutral-200 px-2 pb-2">
        <div class="flex items-center justify-between border-r border-neutral-200 pr-2 text-sm font-medium text-neutral-900">
          <div>Customer No</div>
        </div>
        <div class="flex items-center justify-between border-r border-neutral-200 pr-2 text-sm font-medium text-neutral-900">
          <div>Name</div>
        </div>
        <div class="flex items-center justify-between border-r border-neutral-200 pr-2 text-sm font-medium text-neutral-900">
          <div>Address</div>
        </div>
      </div>
    </div>

    <DPageContent ref="content">
      <RouterLink
        :to="`/contact/${contact.id}`"
        v-for="contact in contacts"
        class="grid grid-cols-[1fr_2fr_4fr] items-center justify-between gap-4 rounded px-2 py-2 hover:bg-neutral-100"
      >
        <div class="text-sm text-neutral-700">{{ contact.customerNo }}</div>
        <div class="text-sm text-neutral-700">{{ contact.name }}</div>
        <div class="text-sm text-neutral-700">{{ contactAddress(contact) }}</div>
      </RouterLink>
    </DPageContent>
  </DPage>
</template>
