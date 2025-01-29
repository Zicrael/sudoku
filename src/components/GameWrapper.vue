<template>
  <div
    class="game-wrapper flex justify-center align-center"
    :class="`bg-${GameStore.gameSettings.background}`"
  >
    <div class="game-main w-100">
      <GameMenu v-if="GameStore.getGameState === GameState.MENU" />
      <SudokuWrapper v-if="GameStore.getGameState === GameState.GAME" />
      <GamePause v-if="GameStore.getGameState === GameState.PAUSE" />
      <GameSettings v-if="GameStore.getGameState === GameState.SETTINGS" />
      <GameLeaderboard v-if="GameStore.getGameState === GameState.LEADERBOARD" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import GameMenu from '@/components/screens/GameMenu.vue'
import SudokuWrapper from '@/components/sudoku/SudokuWrapper.vue'
import GamePause from '@/components/screens/GamePause.vue'
import GameSettings from '@/components/screens/GameSettings.vue'
import GameLeaderboard from '@/components/screens/GameLeaderboard.vue'
import { GameState } from '@/enums/GameStoreEnums.ts'

const GameStore = useGameStore()

onMounted(() => {
  const savedGameState = localStorage.getItem('gameState')
  const savedGameSettings = localStorage.getItem('gameSettings')
  const savedLeaderboard = localStorage.getItem('leaderboard')
  if (savedGameState) {
    GameStore.changeGameState(Number(savedGameState))
  }
  if (savedGameSettings) {
    GameStore.changeGameSettings(JSON.parse(savedGameSettings))
  }
  if (savedLeaderboard) {
    GameStore.changeGameLeaderboard(JSON.parse(savedLeaderboard))
  }
})
</script>

<style lang="scss" scoped>
.game-wrapper {
  background-size: cover;
  background-position: center bottom;
  background-repeat: no-repeat;
  height: 100vh;
  padding: 0 2.5vw;
  .game-main {
    background-color: var(--white-color);
    max-width: 920px;
    height: 600px;
    color: var(--text-color);
    border-radius: 12px;
    font-family: Arial, Helvetica, sans-serif;
    cursor: default;
    user-select: none;
  }
  &.bg-0 {
    background-image: url('/src/assets/sudoku-bg-1.webp');
  }
  &.bg-1 {
    background-image: url('/src/assets/sudoku-bg-2.webp');
  }
  &.bg-2 {
    background-image: url('/src/assets/sudoku-bg-3.webp');
  }
}
</style>
