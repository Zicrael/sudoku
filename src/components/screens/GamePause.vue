<template>
  <section class="game-pause-wrapper flex direction-column align-center justify-center">
    <div class="game-pause-icon flex align-center justify-center mb-2">
      <AppIcon height="80px" width="80px" color="#fff">
        <PauseIcon />
      </AppIcon>
    </div>
    <h1 class="game-pause-title app-screen-title mb-2">GAME PAUSED</h1>
    <button class="game-resume-button app-btn" @click="resumeGame()">Resume</button>
  </section>
</template>
<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore.ts'
import AppIcon from '@/components/icons/AppIcon.vue'
import PauseIcon from '@/components/icons/PauseIcon.vue'
import { GameState } from '@/enums/GameStoreEnums.ts'

const GameStore = useGameStore()

const resumeGame = () => {
  GameStore.changeGameState(GameState.GAME)
}
</script>
<style lang="scss" scoped>
.game-pause-wrapper {
  width: 100%;
  height: 100%;
  padding: 3rem;
  .game-pause-icon {
    height: 125px;
    width: 125px;
    background-color: var(--dark-primary-color);
    border-radius: 9999px;
  }
  .game-pause-title {
    font-size: 24px;
  }
  .game-resume-button {
    max-width: 180px;
    height: 35px;
    color: var(--dark-primary-color);
    background-color: var(--white);
    border: 1px solid var(--dark-primary-color);
    &:hover {
      background-color: var(--primary-color);
      border: 1px solid var(--primary-color);
      color: var(--white-color);
    }
  }
}
</style>
