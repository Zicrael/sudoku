<template>
  <div class="sudoku-sidebar-wrapper flex direction-column justify-between h-100">
    <div class="sudoku-sidebar-actions flex direction-row justify-between">
      <div class="sidebar-actions-item text-center">
        <!-- DEV NOTE: sorry, had no time to finish undo logic :( -->
        <div
          class="sidebar-actions-item-button c-pointer flex direction-column justify-center align-center"
          :class="{ disabled: true }"
        >
          <AppIcon color="#ffffff">
            <UndoArrow />
          </AppIcon>
        </div>
        <span>Undo</span>
      </div>
      <div class="sidebar-actions-item text-center">
        <div
          class="sidebar-actions-item-button c-pointer flex direction-column justify-center align-center"
          :class="{ disabled: GameStore.gameFinished }"
          @click="pauseGame"
        >
          <AppIcon color="#ffffff">
            <PauseIcon />
          </AppIcon>
        </div>
        <span>Pause</span>
      </div>
      <div class="sidebar-actions-item text-center">
        <div
          class="sidebar-actions-item-button c-pointer flex direction-column justify-center align-center"
          :class="{ enabled: draftMode, disabled: GameStore.gameFinished }"
          @click="toggleDraft"
        >
          <AppIcon color="#ffffff">
            <DraftPen />
          </AppIcon>
        </div>
        <span :class="{ 'text-primary': draftMode }">Draft</span>
      </div>
      <div class="sidebar-actions-item text-center">
        <div
          class="sidebar-actions-item-button c-pointer flex direction-column justify-center align-center"
          :class="{
            disabled:
              GameStore.selectedCell === null ||
              !GameStore.table[GameStore.selectedCell].editable ||
              GameStore.table[GameStore.selectedCell].resolved ||
              GameStore.hints.used === GameStore.hints.max ||
              GameStore.gameFinished,
          }"
          @click="useHint"
        >
          <AppIcon color="#ffffff">
            <HintBulb />
          </AppIcon>
        </div>
        <span>Hint</span>
      </div>
    </div>
    <div class="sudoku-sidebar-numpad flex">
      <div
        v-for="(item, i) of numpadButtons"
        class="sidebar-numpad-item flex align-center justify-center c-pointer"
        :class="{ disabled: GameStore.getRemainNumberCounter[item - 1] === 0 }"
        :key="i"
        @click="handleNumpandAction(item)"
      >
        {{ item }}
      </div>
    </div>
    <div>
      <button
        class="sidebar-back-button app-btn"
        v-if="!GameStore.gameFinished"
        @click="GameStore.endGame()"
      >
        END GAME
      </button>
      <button class="sidebar-leaderboard-button app-btn" v-else @click="finishGame">
        LEADERBOARD
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useGameStore } from '@/stores/gameStore.ts'
import { GameState } from '@/enums/GameStoreEnums.ts'
import AppIcon from '@/components/icons/AppIcon.vue'
import UndoArrow from '@/components/icons/UndoArrow.vue'
import PauseIcon from '@/components/icons/PauseIcon.vue'
import DraftPen from '@/components/icons/DraftPen.vue'
import HintBulb from '@/components/icons/HintBulb.vue'

const GameStore = useGameStore()
const numpadButtons = ref([1, 2, 3, 4, 5, 6, 7, 8, 9])
const draftMode = ref(false)

const handleNumpandAction = (value: number) => {
  if (
    GameStore.selectedCell !== null &&
    GameStore.table[GameStore.selectedCell].editable &&
    GameStore.table[GameStore.selectedCell].value !== value &&
    GameStore.getRemainNumberCounter[value - 1] !== 0
  ) {
    GameStore.handleCellInput(GameStore.selectedCell, value)
  }
}
const toggleDraft = () => {
  if (!GameStore.gameFinished) {
    draftMode.value = !draftMode.value
    GameStore.changeDraftMode(draftMode.value)
  }
}
const pauseGame = () => {
  if (!GameStore.gameFinished) {
    GameStore.changeGameState(GameState.PAUSE)
  }
}
const finishGame = () => {
  GameStore.endGame()
  GameStore.changeGameState(GameState.LEADERBOARD)
}
const useHint = () => {
  if (
    GameStore.selectedCell !== null &&
    GameStore.table[GameStore.selectedCell].editable &&
    !GameStore.table[GameStore.selectedCell].resolved &&
    GameStore.hints.used < GameStore.hints.max
  ) {
    GameStore.useHint(GameStore.selectedCell)
  }
}

onMounted(() => {
  const localDraftMode = localStorage.getItem('draftMode')
  if (localDraftMode === 'true') {
    draftMode.value = true
    GameStore.changeDraftMode(true)
  }
})
</script>
<style lang="scss" scoped>
.sudoku-sidebar-wrapper {
  padding: 1rem;
  .sudoku-sidebar-actions {
    margin-bottom: 2rem;
  }
  .sidebar-actions-item {
    height: 65px;
    font-size: 14px;
    font-weight: 600;
    .sidebar-actions-item-button {
      height: 50px;
      width: 50px;
      background-color: var(--main-frame-border);
      border: 2px solid var(--main-frame-border);
      border-radius: 12px;
      margin-bottom: 0.5rem;
      &:hover {
        background-color: var(--primary-color);
        border: 1px solid var(--primary-color);
      }
      &.enabled {
        background-color: var(--light-primary-color);
        border: 1px solid var(--light-primary-color);
      }
      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
  .sudoku-sidebar-numpad {
    flex-wrap: wrap;
    .sidebar-numpad-item {
      width: 100px;
      font-size: 32px;
      border: 2px solid var(--highlighted-cell-color);
      border-radius: 12px;
      height: 100px;
      background-color: var(--highlighted-cell-color);
      color: var(--dark-primary-color);
      &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
        &:hover {
          background-color: var(--highlighted-cell-color);
          border: 1px solid var(--highlighted-cell-color);
        }
      }
      &:hover {
        background-color: var(--selected-cell-color);
        border: 1px solid var(--selected-cell-color);
      }
      &:not(:nth-child(3n)) {
        margin-bottom: 1rem;
        margin-right: 1rem;
      }
    }
  }
  .sidebar-back-button {
    background-color: var(--danger-button-color);
    color: var(--white-color);
    border: 2px solid var(--danger-button-color);
    font-size: 16px;
    &:hover {
      background-color: var(--hover-danger-color);
      border: 2px solid var(--hover-danger-color);
      color: var(--white-color);
    }
  }
  .sidebar-leaderboard-button {
    background-color: var(--win-color);
    color: var(--white-color);
    border: 2px solid var(--win-color);
    font-size: 16px;
    &:hover {
      background-color: var(--hover-win-color);
      border: 2px solid var(--hover-win-color);
      color: var(--white-color);
    }
  }
}
</style>
