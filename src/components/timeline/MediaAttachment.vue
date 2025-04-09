<script setup>

const props = defineProps({
  media: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <div v-if="media.length > 0" class="mt-2 grid grid-cols-2 gap-2">
    <a v-for="item in media" :key="item.id || item.url" :href="item.url || item.largeurl" target="_blank" class="block">
      <img :src="item.preview_url || item.thumburl || item.url" class="w-full h-auto rounded-lg"
        :alt="item.description || ''">
    </a>
  </div>
</template>