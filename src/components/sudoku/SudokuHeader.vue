<template>
  <div class="sudoku-header-wrapper flex justify-between align-center text-bold">
    <div class="sudoku-header-difficulty">
      <span class="text-light">Difficulty: </span>
      <span>{{ difficultyLabelMap[GameStore.getGameSettings.difficulty] }}</span>
    </div>
    <div class="sudoku-header-progress flex">
      <div class="sudoku-header-hints">
        <span class="text-light">Hints: </span>
        <span>{{ GameStore.hints.max - GameStore.hints.used }} / {{ GameStore.hints.max }}</span>
      </div>
      <div class="sudoku-header-score">
        <span class="text-light">Score: </span>
        <span>{{ GameStore.gameProgress.score }}</span>
      </div>
      <div class="sudoku-header-time">
        <span class="text-light">Time: </span>
        <span>{{ formattedTimer }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { difficultyLabelMap } from '@/mappings/difficultyMap'
const GameStore = useGameStore()

const timer = ref(0)
const interval = ref<number | null>(null)
const formattedTimer = ref<string>('00:00')

watch(
  () => GameStore.gameFinished,
  (isFinished) => {
    if (isFinished) {
      stopTimer()
    }
  },
)

const startTimer = () => {
  if (!interval.value) {
    interval.value = setInterval(() => {
      timer.value++
      updateFormattedTimer()
      GameStore.changeElapsedTime(timer.value)
    }, 1000)
  }
}

const stopTimer = () => {
  if (interval.value) {
    clearInterval(interval.value)
    interval.value = null
  }
}

const updateFormattedTimer = () => {
  const hours = Math.floor(timer.value / 3600)
  const minutes = Math.floor((timer.value % 3600) / 60)
  const seconds = timer.value % 60

  if (hours) {
    formattedTimer.value = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  } else {
    formattedTimer.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }
}

const handleVisibilityChange = () => {
  if (document.hidden) {
    stopTimer()
  } else {
    startTimer()
  }
}

onMounted(() => {
  const usedHints = localStorage.getItem('usedHints')
  const totalScore = localStorage.getItem('totalScore')
  const elapsedTime = localStorage.getItem('elapsedTime')
  if (usedHints) {
    GameStore.changeUsedHints(Number(usedHints))
  }
  if (totalScore) {
    GameStore.changeScore(Number(totalScore))
  }
  if (elapsedTime) {
    timer.value = Number(elapsedTime)
    updateFormattedTimer()
  }
  startTimer()
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  stopTimer()
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<style lang="scss" scoped>
.sudoku-header-wrapper {
  padding: 1rem;
  font-size: 18px;
  .sudoku-header-hints,
  .sudoku-header-score {
    margin-right: 2rem;
  }
}
</style>
