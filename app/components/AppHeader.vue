<script setup lang="ts">
const nuxtApp = useNuxtApp()
const { activeHeadings, updateHeadings } = useScrollspy()

const items = computed(() => [{
  label: 'Administración',
  to: '#administracion',
  active: activeHeadings.value.includes('administracion')
}, {
  label: 'Gestoría',
  to: '#gestoria',
  active: activeHeadings.value.includes('gestoria')
}, {
  label: 'Asesoría experta',
  to: '#asesoria',
  active: activeHeadings.value.includes('asesoria')
}, {
  label: 'Testimonios',
  to: '#clientes',
  active: activeHeadings.value.includes('clientes')
}, {
  label: 'Quiénes somos',
  to: '#equipo',
  active: activeHeadings.value.includes('equipo')
}, {
  label: 'Contacto',
  to: '#contacto',
  active: activeHeadings.value.includes('cta')
}])

nuxtApp.hooks.hookOnce('page:finish', () => {
  updateHeadings([
    document.querySelector('#administracion'),
    document.querySelector('#gestoria'),
    document.querySelector('#asesoria'),
    document.querySelector('#clientes'),
    document.querySelector('#equipo'),
    document.querySelector('#contacto')
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
