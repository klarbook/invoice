<script setup lang="ts">
interface Props {
  type?: string
  placeholder?: string | undefined
}

const { type = "text", placeholder = undefined } = defineProps<Props>()

const model = defineModel()
</script>

<template>
  <textarea
    v-model="model"
    :placeholder
    class="field-sizing-content h-fit max-h-[5lh] min-h-[3lh] resize-none rounded-md bg-neutral-100 px-2 py-2 text-sm text-neutral-700 ring-blue-600 outline-none placeholder:text-neutral-400 focus:border-transparent focus:ring-2"
    xclass="mb-1 field-sizing-content max-h-[7.7lh] min-h-[2.7lh] w-full resize-none rounded-md bg-neutral-100 px-2.5 py-1.5 text-sm text-neutral-800 outline-none placeholder:text-neutral-400 focus:border-neutral-300 focus:ring-0 focus:outline-0"
  />
</template>
