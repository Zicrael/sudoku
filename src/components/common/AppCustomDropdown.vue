<template>
  <div class="app-dropdown c-pointer" @click="toggleDropdown">
    <div class="app-dropdown-content flex justify-between align-center">
      <div>{{ selectedLabel }}</div>
      <div class="app-dropdown-icon flex" :class="isOpen ? 'arrow-up' : 'arrow-down'">
        <AppIcon>
          <ArrowDown />
        </AppIcon>
      </div>
    </div>
    <ul v-if="isOpen" class="app-dropdown-options">
      <li
        v-for="(option, index) in options"
        :key="index"
        class="app-dropdown-option c-pointer"
        @click.stop="selectOption(option)"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from 'vue'
import AppIcon from '@/components/icons/AppIcon.vue'
import ArrowDown from '@/components/icons/ArrowDown.vue'
const props = defineProps({
  options: {
    type: Array as () => { value: string | number; label: string }[],
    required: true,
  },
  modelValue: {
    type: [String, Number],
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'onSelect'])

const isOpen = ref(false)

const selectedLabel = computed(() => {
  const selected = props.options.find((option) => option.value === props.modelValue)
  return selected ? selected.label : 'Select an option'
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectOption = (option: { value: string | number; label: string }) => {
  emit('update:modelValue', option.value)
  emit('onSelect', option.value)
  isOpen.value = false
}
</script>
<style lang="scss" scoped>
.app-dropdown {
  position: relative;
  width: 200px;
  border: 1px solid var(--main-frame-border);
  border-radius: 12px;
}

.app-dropdown-content {
  padding: 8px;
  border-radius: 4px;
  .app-dropdown-icon {
    transition: all 0.75s;
    &.arrow-up {
      transform: rotate(180deg);
    }
  }
}

.app-dropdown-options {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  max-height: 180px;
  overflow-y: auto;
  border: 1px solid var(--main-frame-border);
  background-color: var(--white-color);
  z-index: 10;
  border-radius: 12px;
  margin: 0;
  padding: 0;
  list-style: none;

  .app-dropdown-option {
    padding: 8px;
    transition: background-color 0.2s ease;
    &:hover {
      background-color: var(--highlighted-cell-color);
    }
  }
}
</style>
