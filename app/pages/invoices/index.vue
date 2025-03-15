<script setup lang="ts">
import { PlusIcon } from "lucide-vue-next"

const { data: invoices } = await useFetch("/api/invoices")

async function invoiceCreate() {
  await navigateTo("/invoices/new")
}
</script>

<template>
  <DPage>
    <DHeader>
      <DHeaderTitle>Invoices</DHeaderTitle>
      <!-- <DInputSearch v-model="search" class="hidden md:block" />
      <DSelect v-model="filterByStudent" :options="filterStudentOptions" placeholder="Schüler" class="hidden w-[160px] md:block" />
      <DSelect v-model="filterByTeacher" :options="filterTeacherOptions" placeholder="Lehrer" class="hidden w-[160px] md:block" />
      <DSelect v-model="filterByTag" :options="filterTagOptions" placeholder="Tags" class="hidden w-[160px] md:block" /> -->

      <template #right>
        <DButton :icon-left="PlusIcon" @click="invoiceCreate">New invoice</DButton>
      </template>
    </DHeader>

    <div class="block min-h-0 px-4 pt-2.5">
      <div class="grid items-center justify-between gap-4 border-b border-neutral-200 px-2 pb-2" :style="{ gridTemplateColumns: '1fr 1fr 2fr 3fr 1fr 1fr' }">
        <div class="flex items-center justify-between border-r border-neutral-200 pr-2 text-sm font-medium text-neutral-900">
          <div>Status</div>
        </div>
        <div class="flex items-center justify-between border-r border-neutral-200 pr-2 text-sm font-medium text-neutral-900">
          <div>Due date</div>
        </div>
        <div class="flex items-center justify-between border-r border-neutral-200 pr-2 text-sm font-medium text-neutral-900">
          <div>Invoice no</div>
        </div>
        <div class="flex items-center justify-between border-r border-neutral-200 pr-2 text-sm font-medium text-neutral-900">
          <div>Customer</div>

          <DTableHeaderSort :sort-by="sortBy" :sort-field="'date'" :sort-order="sortOrder" @sort="sort" />
        </div>
        <div class="flex items-center justify-between border-neutral-200 text-sm font-medium text-neutral-900">
          <div>Date</div>

          <DTableHeaderSort :sort-by="sortBy" :sort-field="'createdAt'" :sort-order="sortOrder" @sort="sort" />
        </div>
        <div class="flex items-center justify-between border-neutral-200 text-sm font-medium text-neutral-900"></div>
      </div>
    </div>

    <DPageContent ref="content">
      <RouterLink
        :to="`/invoice/${invoice.id}`"
        v-for="invoice in invoices"
        class="grid items-center justify-between gap-4 rounded px-2 py-2 hover:bg-neutral-100"
        :style="{ gridTemplateColumns: '1fr 1fr 2fr 3fr 1fr 1fr' }"
      >
        <div>Lorem, ipsum.</div>
        <div>Dolorem, porro.</div>
        <div>Culpa, illum?</div>
        <div>Provident, illo?</div>
        <div>Sit, ea!</div>
        <div>Sit, provident.</div>
      </RouterLink>
    </DPageContent>
  </DPage>
</template>
