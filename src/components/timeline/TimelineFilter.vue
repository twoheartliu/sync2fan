<script setup>
import { defineEmits } from 'vue'

const props = defineProps({
  currentFilter: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:filter'])

function setFilter (filter) {
  emit('update:filter', filter)
}
</script>

<template>
  <div class="flex space-x-2 mt-4">
    <button @click="setFilter('all')"
      :class="['px-4 py-2 rounded-full text-sm', currentFilter === 'all' ? 'filter-active' : 'hover:bg-gray-700']">
      全部
    </button>
    <button @click="setFilter('mastodon')"
      :class="['px-4 py-2 rounded-full text-sm', currentFilter === 'mastodon' ? 'filter-active' : 'hover:bg-gray-700']">
      <i class="fab fa-mastodon mr-1"></i> Mastodon
    </button>
    <button @click="setFilter('fanfou')"
      :class="['px-4 py-2 rounded-full text-sm', currentFilter === 'fanfou' ? 'filter-active' : 'hover:bg-gray-700']">
      <i class="fas fa-coffee mr-1"></i> 饭否
    </button>
  </div>
</template>