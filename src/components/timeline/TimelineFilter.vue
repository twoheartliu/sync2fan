<script setup>
const props = defineProps({
  currentFilter: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:filter'])

function setFilter(filter) {
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
      <Icon name="mastodon" class="mr-1" />
    </button>
    <button @click="setFilter('fanfou')"
      :class="['px-4 py-2 rounded-full text-sm', currentFilter === 'fanfou' ? 'filter-active' : 'hover:bg-gray-700']">
      <Icon name="fanfou" class="mr-1" />
    </button>
  </div>
</template>