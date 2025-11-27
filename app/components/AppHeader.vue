<script setup lang="ts">
const nuxtApp = useNuxtApp()
const { activeHeadings, updateHeadings } = useScrollspy()

const items = computed(() => [{
  label: 'Mantenimiento',
  to: '#maintenance',
  active: activeHeadings.value.includes('maintenance')
}, {
  label: 'Legal',
  to: '#legal',
  active: activeHeadings.value.includes('legal')
}, {
  label: 'Contabilidad',
  to: '#accounting',
  active: activeHeadings.value.includes('accounting')
}, {
  label: 'Quiénes somos',
  to: '#testimonials',
  active: activeHeadings.value.includes('testimonials')
}, {
  label: 'Contacto',
  to: '#cta',
  active: activeHeadings.value.includes('cta')
}])

nuxtApp.hooks.hookOnce('page:finish', () => {
  updateHeadings([
    document.querySelector('#maintenance'),
    document.querySelector('#legal'),
    document.querySelector('#accounting'),
    document.querySelector('#testimonials'),
    document.querySelector('#cta')
  ].filter(Boolean) as Element[])
})
</script>

<template>
  <UHeader>
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="w-auto h-6 shrink-0" />
      </NuxtLink>

    </template>

    <template #right>
      <UNavigationMenu
        :items="items"
        variant="link"
        class="hidden lg:block"
      />

      <UColorModeButton />
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />
      <UButton
        class="mt-4"
        label="Download App"
        variant="subtle"
        block
      />
    </template>
  </UHeader>
</template>
