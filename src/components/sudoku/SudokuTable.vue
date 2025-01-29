<template>
  <div
    class="sudoku-table-wrapper flex w-100 h-100"
    :class="{ 'sudoku-table-complete': winAnimationStarted }"
  >
    <div
      v-for="(cell, i) of GameStore.table"
      :key="i"
      class="sudoku-table-cell justify-center flex align-center text-dark-primary"
      :class="{
        'selected-cell': GameStore.selectedCell === i,
        'highlighted-cell': cell.highlight,
        'error-cell': cell.error,
        'resolved-cell': cell.resolved && cell.resolvedByPlayer && !cell.error,
        'draft-cell': cell.draft > 0,
        'c-pointer': cell.editable && !winAnimationStarted,
        'cell-animate-win': winAnimationHelper.includes(i),
      }"
      @click="selectCell(i)"
    >
      <div v-if="!cell.draft" class="sudoku-table-cell-value">
        {{ cell.value ? cell.value : '' }}
      </div>
      <div v-else class="sudoku-table-cell-draft">{{ cell.draft }}</div>
    </div>
    <div class="sudoku-table-win-screen" :class="{ hidden: !winAnimationFinished }">
      <div class="win-screen-icon flex">
        <AppIcon width="100px" height="100px" color="#FFDD44">
          <TrophyIcon />
        </AppIcon>
      </div>
      <div class="win-screen-text">{{ congratulationsMessage }}</div>
      <div class="win-screen-score">
        TOTAL SCORE: <span class="text-bold">{{ GameStore.gameProgress.score }}</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import AppIcon from '@/components/icons/AppIcon.vue'
import TrophyIcon from '@/components/icons/TrophyIcon.vue'

const GameStore = useGameStore()
const winAnimationHelper = ref<number[]>([])
const winAnimationStarted = ref<boolean>(false)
const winAnimationFinished = ref<boolean>(false)
const congratulationsArray = ref<string[]>([
  'Well done!',
  'Kudos to you!',
  'Hats off to you!',
  'Bravo!',
  'Excellent work!',
  'Great achievement!',
  'You rock!',
  'Awesome work!',
  'You nailed it!',
])

const congratulationsMessage = computed(() => {
  return congratulationsArray.value[Math.floor(Math.random() * 9)]
})

watch(
  () => GameStore.gameFinished,
  (isFinished) => {
    if (isFinished) {
      startWinAnimation()
    }
  },
)

const selectCell = (index: number) => {
  if (!winAnimationStarted.value) {
    GameStore.selectCell(index)
  }
}

const handleKeyupInput = (event: KeyboardEvent) => {
  const value = Number(event.key)
  if (
    event.key >= '1' &&
    event.key <= '9' &&
    GameStore.selectedCell !== null &&
    GameStore.table[GameStore.selectedCell].editable &&
    GameStore.table[GameStore.selectedCell].value !== value &&
    GameStore.getRemainNumberCounter[value - 1] !== 0 &&
    !winAnimationStarted.value
  ) {
    if (GameStore.isDraftMode) {
      GameStore.handleDraftInput(GameStore.selectedCell, value)
    } else {
      GameStore.handleCellInput(GameStore.selectedCell, value)
    }
  } else {
    return
  }
}

const startWinAnimation = () => {
  winAnimationStarted.value = true
  for (let i = 0; i < 81; i++) {
    setTimeout(() => {
      winAnimationHelper.value.push(i)
      if (i === 80) {
        winAnimationFinished.value = true
      }
    }, i * 75)
  }
}

onMounted(() => {
  document.addEventListener('keyup', handleKeyupInput)
})

onUnmounted(() => {
  document.removeEventListener('keyup', handleKeyupInput)
})
</script>
<style lang="scss" scoped>
.sudoku-table-wrapper {
  border: 2px solid var(--main-frame-border);
  flex-wrap: wrap;
  position: relative;
  &.sudoku-table-complete {
    border: 2px solid var(--win-color);
  }
  .sudoku-table-cell {
    height: calc(100% / 9);
    width: calc(100% / 9);
    border: 1px solid var(--cell-border);
    font-size: 40px;
    font-weight: 400;
    transition: all ease-in-out 0.25s;
    &.selected-cell {
      background-color: var(--selected-cell-color);
    }
    &.highlighted-cell {
      background-color: var(--highlighted-cell-color);
    }
    &.error-cell {
      background-color: var(--error-cell-color);
    }
    &.resolved-cell {
      color: var(--light-primary-color);
    }
    &.draft-cell {
      color: var(--text-color);
    }
    &.cell-animate-win {
      color: var(--white-color);
      background-color: var(--win-color);
      border: 1px solid var(--win-color);
      &:nth-child(3n):not(:nth-child(9n)) {
        border-right: 2px solid var(--win-color);
      }
      &:nth-child(n + 19):nth-child(-n + 27),
      &:nth-child(n + 46):nth-child(-n + 54) {
        border-bottom: 2px solid var(--win-color);
      }
    }
    &:nth-child(3n):not(:nth-child(9n)) {
      border-right: 2px solid var(--main-frame-border);
    }
    &:nth-child(n + 19):nth-child(-n + 27),
    &:nth-child(n + 46):nth-child(-n + 54) {
      border-bottom: 2px solid var(--main-frame-border);
    }
  }
  .sudoku-table-win-screen {
    transition: opacity 0.5s ease;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background-color: var(--win-color);
    color: var(--white-color);
    &.hidden {
      visibility: hidden;
      opacity: 0;
    }
    &:not(.hidden) {
      visibility: visible;
      opacity: 1;
    }
    .win-screen-icon {
      margin-bottom: 0.5rem;
    }
    .win-screen-text {
      margin-bottom: 0.5rem;
      font-size: 24px;
    }
    .win-screen-score {
      font-size: 18px;
    }
  }
}
</style>
