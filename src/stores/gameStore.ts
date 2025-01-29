import { defineStore } from 'pinia'
import { GameState, GameDifficulty, GameBackground } from '@/enums/GameStoreEnums.ts'
import type {
  IGameSettings,
  ITableCell,
  GameStoreState,
  ILeaderboardRecord,
} from '@/types/GameTypes.ts'

export const useGameStore = defineStore('game', {
  state: (): GameStoreState => {
    return {
      gameState: GameState.MENU,
      gameSettings: {
        difficulty: GameDifficulty.INTERMEDIATE,
        background: GameBackground.DARK_BLUE,
      },
      leaderboard: [[], [], [], []],
      table: [],
      selectedCell: null,
      gameProgress: {
        elapsedTime: 0,
        score: 0,
      },
      draftMode: false,
      hints: {
        max: 10,
        used: 0,
      },
      remainNumberCounter: [9, 9, 9, 9, 9, 9, 9, 9, 9],
      gameFinished: false,
    }
  },
  getters: {
    getGameState(state: GameStoreState) {
      return state.gameState
    },
    getGameSettings(state: GameStoreState) {
      return state.gameSettings
    },
    getSudokuTable(state: GameStoreState) {
      return state.table
    },
    getSelectedCell(state: GameStoreState) {
      return state.selectedCell
    },
    isDraftMode(state: GameStoreState) {
      return state.draftMode
    },
    getRemainNumberCounter(state: GameStoreState) {
      return state.remainNumberCounter
    },
  },
  actions: {
    changeGameState(value: number) {
      this.gameState = value
      localStorage.setItem('gameState', value.toString())
    },
    changeGameDifficulty(value: number) {
      this.gameSettings.difficulty = value
      localStorage.setItem('gameSettings', JSON.stringify(this.gameSettings))
    },
    changeGameBackground(value: number) {
      this.gameSettings.background = value
      localStorage.setItem('gameSettings', JSON.stringify(this.gameSettings))
    },
    changeGameSettings(settings: IGameSettings) {
      this.gameSettings = settings
    },
    changeGameLeaderboard(leaderboard: ILeaderboardRecord[][]) {
      this.leaderboard = leaderboard
    },
    addUserToLeaderboard(user: ILeaderboardRecord) {
      const category = this.leaderboard[this.gameSettings.difficulty]
      category.push(user)
      category.sort((a, b) => b.value - a.value)
      this.leaderboard[this.gameSettings.difficulty] = category.slice(0, 10)
      localStorage.setItem('leaderboard', JSON.stringify(this.leaderboard))
    },
    changeRemainNumberCounter(arr: number[]) {
      this.remainNumberCounter = arr
      localStorage.setItem('numberCounter', JSON.stringify(arr))
    },
    changeRemainNumberCounterItem(value: number) {
      const index = value - 1
      this.remainNumberCounter[index]--
      localStorage.setItem('numberCounter', JSON.stringify(this.remainNumberCounter))
    },
    changeElapsedTime(value: number) {
      this.gameProgress.elapsedTime = value
      localStorage.setItem('elapsedTime', `${value}`)
    },
    changeScore(value: number) {
      this.gameProgress.score = value
    },
    addScore(value: number) {
      this.gameProgress.score = this.gameProgress.score + value
      localStorage.setItem('totalScore', `${this.gameProgress.score}`)
    },
    decreaseScore(value: number) {
      this.gameProgress.score =
        this.gameProgress.score - value > 0 ? this.gameProgress.score - value : 0
      localStorage.setItem('totalScore', `${this.gameProgress.score}`)
    },
    changeDraftMode(value: boolean) {
      this.draftMode = value
      localStorage.setItem('draftMode', `${value}`)
    },
    changeUsedHints(value: number) {
      this.hints.used = value
      localStorage.setItem('usedHints', `${this.hints.used}`)
    },
    changeSudokuTable(table: ITableCell[]) {
      this.table = table
      localStorage.setItem('tableSnapshot', JSON.stringify(this.table))
    },
    changeGameFinishedState(value: boolean) {
      this.gameFinished = value
      localStorage.setItem('gameFinished', `${value}`)
    },
    selectCell(index: number) {
      if (this.selectedCell === index) {
        return
      }
      this.selectedCell = index
      const sCell = this.table[index]
      for (const cell of this.table) {
        cell.highlight = false
        if (cell.x === sCell.x && cell.y === sCell.y) {
          continue
        }
        if (cell.x === sCell.x || cell.y === sCell.y || cell.tile === sCell.tile) {
          cell.highlight = true
        }
      }
      localStorage.setItem('selectedCell', `${index}`)
      localStorage.setItem('tableSnapshot', JSON.stringify(this.table))
    },
    selectCellRaw(index: number | null) {
      this.selectedCell = index
    },
    handleCellInput(index: number, value: number, hint?: boolean) {
      const sCell = this.table[index]
      sCell.draft = 0
      sCell.value = value
      if (sCell.value === sCell.solution) {
        sCell.error = false
        if (!sCell.resolved) {
          this.changeRemainNumberCounterItem(sCell.value)
          sCell.resolved = true
          sCell.resolvedByPlayer = true
          sCell.editable = false
          if (!hint) {
            this.addScore(5)
          }
          this.isGameFinishedCheck()
        }
      } else {
        sCell.error = true
        this.decreaseScore(1)
      }
      localStorage.setItem('tableSnapshot', JSON.stringify(this.table))
    },
    handleDraftInput(index: number, value: number) {
      const sCell = this.table[index]
      sCell.value = 0
      sCell.error = false
      sCell.draft = value
      localStorage.setItem('tableSnapshot', JSON.stringify(this.table))
    },
    useHint(index: number) {
      this.changeUsedHints(this.hints.used + 1)
      this.decreaseScore(2 + this.hints.used)
      this.handleCellInput(index, this.table[index].solution, true)
    },
    isGameFinishedCheck() {
      if (this.remainNumberCounter.every((counters) => counters === 0)) {
        const timeBonus = 500 - this.gameProgress.elapsedTime
        if (timeBonus > 0) {
          this.addScore(timeBonus)
        }
        this.addUserToLeaderboard({ name: 'Player', value: this.gameProgress.score })
        this.changeGameFinishedState(true)
      }
    },
    endGame() {
      this.changeGameState(GameState.MENU)
      this.changeSudokuTable([])
      this.selectCellRaw(null)
      this.changeRemainNumberCounter([9, 9, 9, 9, 9, 9, 9, 9, 9])
      this.changeUsedHints(0)
      this.changeScore(0)
      this.changeElapsedTime(0)
      this.clearLocalStorage()
      this.changeGameFinishedState(false)
    },
    clearLocalStorage() {
      localStorage.removeItem('tableSnapshot')
      localStorage.removeItem('selectedCell')
      localStorage.removeItem('usedHints')
      localStorage.removeItem('totalScore')
      localStorage.removeItem('elapsedTime')
      localStorage.removeItem('numberCounter')
      localStorage.removeItem('gameFinished')
    },
  },
})
