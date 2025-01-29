<template>
  <div class="game-leaderboard-wrapper flex direction-column align-center">
    <div class="game-leaderboard-title">LEADERBOARD</div>
    <div class="game-leaderboard-container w-100 h-100 flex direction-row">
      <div class="game-leaderboard-category flex direction-column">
        <div class="leaderboard-category-title text-bold text-center">
          {{ difficultyLabelMap[GameDifficulty.BEGINNER] }}
        </div>
        <div class="leaderboard-category-list">
          <div
            v-for="(user, k) of GameStore.leaderboard[GameDifficulty.BEGINNER]"
            :key="k"
            class="leaderboard-category-item"
          >
            {{ k + 1 }} . {{ user.value }} - {{ user.name }}
          </div>
        </div>
      </div>
      <div class="game-leaderboard-category flex direction-column text-center">
        <div class="leaderboard-category-title text-bold">
          {{ difficultyLabelMap[GameDifficulty.INTERMEDIATE] }}
        </div>
        <div class="leaderboard-category-list">
          <div
            v-for="(user, k) of GameStore.leaderboard[GameDifficulty.INTERMEDIATE]"
            :key="k"
            class="leaderboard-category-item"
          >
            {{ k + 1 }} . {{ user.value }} - {{ user.name }}
          </div>
        </div>
      </div>
      <div class="game-leaderboard-category flex direction-column text-center">
        <div class="leaderboard-category-title text-bold">
          {{ difficultyLabelMap[GameDifficulty.HARD] }}
        </div>
        <div class="leaderboard-category-list">
          <div
            v-for="(user, k) of GameStore.leaderboard[GameDifficulty.HARD]"
            :key="k"
            class="leaderboard-category-item"
          >
            {{ k + 1 }} . {{ user.value }} - {{ user.name }}
          </div>
        </div>
      </div>
      <div class="game-leaderboard-category flex direction-column text-center">
        <div class="leaderboard-category-title text-bold">
          {{ difficultyLabelMap[GameDifficulty.EXPERT] }}
        </div>
        <div class="leaderboard-category-list">
          <div
            v-for="(user, k) of GameStore.leaderboard[GameDifficulty.EXPERT]"
            :key="k"
            class="leaderboard-category-item"
          >
            {{ k + 1 }} . {{ user.value }} - {{ user.name }}
          </div>
        </div>
      </div>
    </div>
    <div
      class="game-leaderboard-back flex align-center c-pointer"
      @mouseover="backIconColor = '#0077b5'"
      @mouseout="backIconColor = '#003d5c'"
      @click="backToMenu"
    >
      <span class="flex">
        <AppIcon height="32px" width="32px" :color="backIconColor">
          <ArrowLeft />
        </AppIcon>
      </span>
      <span class="flex">BACK TO MENU</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '@/stores/gameStore.ts'
import AppIcon from '@/components/icons/AppIcon.vue'
import ArrowLeft from '@/components/icons/ArrowLeft.vue'
import { GameState, GameDifficulty } from '@/enums/GameStoreEnums.ts'
import { difficultyLabelMap } from '@/mappings/difficultyMap.ts'

const GameStore = useGameStore()
const backIconColor = ref('#003d5c')

const backToMenu = () => {
  GameStore.changeGameState(GameState.MENU)
}
</script>
<style lang="scss" scoped>
.game-leaderboard-wrapper {
  width: 100%;
  height: 100%;
  padding: 3rem;
  position: relative;
  .game-leaderboard-title {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 2rem;
  }
  .game-leaderboard-category {
    width: 25%;
    padding: 0 1rem;
    .leaderboard-category-title {
      font-size: 20px;
      margin-bottom: 1rem;
    }
    .leaderboard-category-item {
      font-size: 16px;
      &:not(:last-child) {
        margin-bottom: 1rem;
      }
    }
    &:not(:last-child) {
      border-right: 1px solid var(--text-color);
    }
  }
}
.game-leaderboard-back {
  position: absolute;
  left: 3rem;
  top: calc(2rem + 22px);
  font-size: 18px;
  &:hover {
    color: var(--primary-color);
  }
}
@media screen and (max-width: 960px) {
  .game-leaderboard-back {
    position: relative;
    top: 0;
    left: -1rem;
  }
}
</style>
