<template>
  <div class="w-full h-full">
    <div class="grid h-full border-t lg:grid-cols-2">
      <!-- Left panel -->
      <div class="relative bg-neutral-50 p-10 lg:block">
        <div class="flex relative justify-center h-full flex-col">
          <div class="flex items-top gap-2 text-sm font-medium absolute top-0 left-0 w-full">
            <i class="ri-command-line" />
            <span>Voice 1</span>
          </div>

          <div class="flex flex-col items-center justify-center">
            <img
              src="/login-img.jpg"
              alt="logo"
              class="max-w-[600px] mx-auto rounded-xl shadow-lg"
            >
            <p class=" mt-4  text-[#50373a]">
              practice makes perfect
            </p>
          </div>
        </div>
      </div>

      <!-- Right panel -->
      <div class="p-8">
        <div class="mx-auto w-full max-w-md h-full flex flex-col items-center justify-center">
          <h1 class="text-center text-2xl font-semibold">
            Login to your account
          </h1>
          <p class="text-center text-sm text-muted-foreground mt-2">
            We auto create an account for you if you don't have one
          </p>

          <Button
            variant="outline"
            class="w-full mt-4"
          >
            <i class="ri-google-fill" />
            Google
          </Button>

          <!-- <p class="mt-6 text-center text-xs text-muted-foreground">
              By clicking continue, you agree to our
              <a
                href="#"
                class="underline"
              >Terms of Service</a>
              and
              <a
                href="#"
                class="underline"
              >Privacy Policy</a>.
            </p> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'

const email = ref('')

function onSubmit () {
  // Integrate your auth flow here
  console.log('sign in with email', email.value)
}
</script>