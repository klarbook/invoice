import tailwindcss from "@tailwindcss/vite"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-03-15",
  future: { compatibilityVersion: 4 },
  vite: { plugins: [tailwindcss()] },
  ssr: false,

  devtools: { enabled: false },

  css: ["@/app.css"],
  modules: ["@vueuse/nuxt", "nuxt-auth-utils", "@nuxt/fonts", "@pinia/nuxt"],

  fonts: { experimental: { processCSSVariables: true } },

  runtimeConfig: {
    // S3 credentials
    s3AccessKeyId: "",
    s3SecretAccessKey: "",
    s3Endpoint: "",
    s3Bucket: "",
    s3Region: "",

    // Postmark credentials
    postmarkServerToken: "",
  },

  nitro: {
    storage: {
      limiter: {
        driver: "memory",
      },
    },
  },

  app: {
    head: {
      title: "Invoice by Klarbook",
    },
  },
})
