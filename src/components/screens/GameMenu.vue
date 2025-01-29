<template>
  <div class="game-menu-wrapper flex direction-column align-center">
    <div>
      <img src="/src/assets/menu-img.jpg" alt="Sudoku" />
    </div>
    <div class="game-menu-title">Sudoku</div>
    <div class="game-menu-author">by Zicrael</div>
    <div class="game-menu-list">
      <div class="game-menu-item c-pointer" @click="GameStore.changeGameState(GameState.GAME)">
        <div>NEW GAME</div>
        <div class="game-menu-subitem">
          Difficulty: {{ difficultyLabelMap[GameStore.gameSettings.difficulty] }}
        </div>
      </div>
      <div class="game-menu-item c-pointer" @click="GameStore.changeGameState(GameState.SETTINGS)">
        SETTINGS
      </div>
      <div
        class="game-menu-item c-pointer"
        @click="GameStore.changeGameState(GameState.LEADERBOARD)"
      >
        LEADERBOARD
      </div>
    </div>
  </div>
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
  .game-menu-title {
    font-size: 28px;
    font-weight: 600;
  }
  .game-menu-author {
    font-size: 16px;
    position: relative;
    top: -15px;
    right: -15px;
  }
  .game-menu-list {
    margin: 2rem 0;
    text-align: center;
  }
  .game-menu-item {
    font-size: 24px;
    font-weight: 500;
    margin-bottom: 2rem;
    .game-menu-subitem {
      font-size: 16px;
    }
  }
  .game-menu-item:hover {
    color: var(--primary-color);
  }
}
</style>
