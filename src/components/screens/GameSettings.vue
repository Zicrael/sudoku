<template>
  <section class="game-settings-wrapper flex align-center">
    <h1 class="game-settings-title app-screen-title">SETTINGS</h1>
    <div class="game-settings-list mt-4 mb-4">
      <div class="game-settings-item mb-4">
        <div class="game-settings-item-title">Difficulty:</div>
        <AppCustomDropdown
          :options="difficultyOptions"
          v-model="selectedDifficulty"
          @onSelect="onDifficultySelect"
        />
      </div>
      <div class="game-settings-item mb-4">
        <div class="game-settings-item-title">Background:</div>
        <AppCustomDropdown
          :options="backgroundOptions"
          v-model="selectedBackground"
          @onSelect="onBackgroundSelect"
        />
      </div>
    </div>
    <button
      class="app-text-btn game-settings-back flex align-center c-pointer"
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
    </button>
  </section>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import AppCustomDropdown from '@/components/common/AppCustomDropdown.vue'
import AppIcon from '@/components/icons/AppIcon.vue'
import ArrowLeft from '@/components/icons/ArrowLeft.vue'
import { GameState, GameDifficulty, GameBackground } from '@/enums/GameStoreEnums.ts'

const GameStore = useGameStore()

const difficultyOptions = ref([
  { value: GameDifficulty.BEGINNER, label: 'Beginner' },
  { value: GameDifficulty.INTERMEDIATE, label: 'Intermediate' },
  { value: GameDifficulty.HARD, label: 'Hard' },
  { value: GameDifficulty.EXPERT, label: 'Expert' },
])
const backgroundOptions = ref([
  { value: GameBackground.DARK_BLUE, label: 'Dark Blue' },
  { value: GameBackground.GRADIENT, label: 'Gradient' },
  { value: GameBackground.PINK_FADE, label: 'Pink Fade' },
])

const selectedDifficulty = ref(GameDifficulty.INTERMEDIATE)
const selectedBackground = ref(GameBackground.DARK_BLUE)
const backIconColor = ref('#003d5c')
const onDifficultySelect = (value: number) => {
  GameStore.changeGameDifficulty(value)
}
const onBackgroundSelect = (value: number) => {
  GameStore.changeGameBackground(value)
}

const backToMenu = () => {
  GameStore.changeGameState(GameState.MENU)
}

onMounted(() => {
  selectedDifficulty.value = GameStore.getGameSettings.difficulty
  selectedBackground.value = GameStore.getGameSettings.background
})
</script>
<style lang="scss" scoped>
.game-settings-wrapper {
  width: 100%;
  height: 100%;
  flex-direction: column;
  padding: 3rem;
  position: relative;
  .game-settings-list {
    .game-settings-item {
      .game-settings-item-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 0.25rem;
      }
    }
  }
}
.game-settings-back {
  position: absolute;
  left: 3rem;
  top: calc(2rem + 22px);
  font-size: 18px;
}
@media screen and (max-width: 960px) {
  .game-settings-back {
    position: relative;
    top: 0;
    left: -1rem;
  }
}
</style>
