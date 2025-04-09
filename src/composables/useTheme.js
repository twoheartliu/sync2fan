import { ref, onMounted } from 'vue'

export default function useTheme() {
  const isDarkMode = ref(true)

  // 主题切换
  function toggleTheme() {
    isDarkMode.value = !isDarkMode.value
    document.documentElement.classList.toggle('dark', isDarkMode.value)
    document.documentElement.classList.toggle('light', !isDarkMode.value)
  }

  // 初始化主题
  onMounted(() => {
    document.documentElement.classList.add(isDarkMode.value ? 'dark' : 'light')
  })

  return {
    isDarkMode,
    toggleTheme
  }
}