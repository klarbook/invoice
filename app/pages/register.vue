<script setup lang="ts">
definePageMeta({
  layout: false,
})

const orgName = ref("")
const name = ref("")
const email = ref("")
const password = ref("")

const { loggedIn, user, session, fetch: refresh, clear } = useUserSession()

const success = ref(false)

async function register() {
  await $fetch("/api/register", {
    method: "POST",
    body: {
      organisationName: orgName.value,
      name: name.value,
      email: email.value,
      password: password.value,
    },
  })
  success.value = true
}
</script>

<template>
  <div>
    <h1>Register</h1>
    <div v-if="success">
      <h2>Success</h2>
      <p>You have been registered successfully. Go back to <NuxtLink to="/login">login</NuxtLink></p>
    </div>
    <form @submit.prevent="register" class="flex max-w-sm flex-col gap-4">
      <div class="flex flex-col">
        <label for="orgName">Organisation</label>
        <input v-model="orgName" type="text" id="orgName" name="orgName" required class="border" />
      </div>
      <div class="flex flex-col">
        <label for="name">Name</label>
        <input v-model="name" type="text" id="name" name="name" required class="border" />
      </div>
      <div class="flex flex-col">
        <label for="email">Email</label>
        <input v-model="email" type="email" id="email" name="email" required class="border" />
      </div>
      <div class="flex flex-col">
        <label for="password">Password</label>
        <input v-model="password" type="password" id="password" name="password" required class="border" />
      </div>
      <button type="submit" class="bg-black text-white">Register</button>
    </form>
    <div>Already registered? <a href="/login">Login</a></div>
  </div>
</template>
