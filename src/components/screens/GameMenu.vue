<template>
  <section class="game-menu-wrapper flex direction-column align-center">
    <div>
      <img src="/src/assets/menu-img.jpg" alt="Sudoku" />
    </div>
    <h1 class="game-menu-title app-screen-title">Sudoku</h1>
    <div class="game-menu-author">by Zicrael</div>
    <div class="game-menu-list flex direction-column text-center mt-5 mb-5">
      <button
        class="game-menu-item app-text-btn c-pointer mb-5"
        @click="GameStore.changeGameState(GameState.GAME)"
      >
        <div class="mb-1">NEW GAME</div>
        <div class="game-menu-subitem">
          Difficulty: {{ difficultyLabelMap[GameStore.gameSettings.difficulty] }}
        </div>
      </button>
      <button
        class="game-menu-item app-text-btn c-pointer mb-5"
        @click="GameStore.changeGameState(GameState.SETTINGS)"
      >
        SETTINGS
      </button>
      <button
        class="game-menu-item app-text-btn c-pointer mb-5"
        @click="GameStore.changeGameState(GameState.LEADERBOARD)"
      >
        LEADERBOARD
      </button>
    </div>
  </section>
</template>
<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'
import { difficultyLabelMap } from '@/mappings/difficultyMap'
import { GameState } from '@/enums/GameStoreEnums.ts'
const GameStore = useGameStore()
</script>
<style lang="scss" scoped>
.game-menu-wrapper {
  width: 100%;
  height: 100%;
  padding: 3rem;
  .game-menu-author {
    font-size: 16px;
    position: relative;
    top: -15px;
    right: -15px;
  }
  .game-menu-item {
    font-size: 24px;
    font-weight: 500;
    .game-menu-subitem {
      font-size: 16px;
    }
  }
}
</style>
