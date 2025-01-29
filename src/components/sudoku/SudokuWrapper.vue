<template>
  <div class="sudoku-wrapper-wrapper flex direction-column">
    <div class="sudoku-wrapper-header">
      <SudokuHeader />
    </div>
    <div class="sudoku-wrapper-row flex">
      <div class="sudoku-wrapper-table">
        <SudokuTable />
      </div>
      <div class="sudoku-wrapper-sidebar">
        <SudokuSidebar />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useGameStore } from '@/stores/gameStore.ts'
import SudokuHeader from '@/components/sudoku/SudokuHeader.vue'
import SudokuTable from '@/components/sudoku/SudokuTable.vue'
import SudokuSidebar from '@/components/sudoku/SudokuSidebar.vue'
import type { ITableCell } from '@/types/GameTypes.ts'
import { shuffleArray } from '@/utils/ArrayUtils.ts'
import { difficultyValueMap } from '@/mappings/difficultyMap'

const GameStore = useGameStore()
const table = ref<ITableCell[]>([])

const createTable = () => {
  table.value = []
  for (let i = 0; i < 81; i++) {
    const x = (i % 9) + 1
    const y = Math.floor(i / 9) + 1
    const tileX = Math.floor((x - 1) / 3)
    const tileY = Math.floor((y - 1) / 3)
    const tile = tileY * 3 + tileX + 1
    table.value.push({
      x,
      y,
      tile,
      draft: 0,
      solution: 0,
      value: 0,
      highlight: false,
      error: false,
      editable: false,
      resolved: false,
      resolvedByPlayer: false,
    })
  }
  fillCells(0)
  removeCluesSymmetrically(difficultyValueMap[GameStore.getGameSettings.difficulty])
  fillRemainingNumbers()
  GameStore.changeSudokuTable(table.value)
}
const fillRemainingNumbers = () => {
  const visibleCells = table.value.filter((cell) => cell.value !== 0)
  const numbersArr = [9, 9, 9, 9, 9, 9, 9, 9, 9]

  for (const cell of visibleCells) {
    numbersArr[cell.value - 1]--
  }
  GameStore.changeRemainNumberCounter(numbersArr)
}
const fillCells = (index: number): boolean => {
  if (index >= 81) return true

  const cell = table.value[index]
  if (cell.value !== 0) {
    return fillCells(index + 1)
  }
  const possibleNumbers = getPossibleNumbers(table.value, cell)
  shuffleArray(possibleNumbers)
  for (const candidate of possibleNumbers) {
    cell.value = candidate
    cell.solution = candidate
    if (fillCells(index + 1)) {
      return true
    }
    cell.value = 0
    cell.solution = 0
  }
  return false
}

const getPossibleNumbers = (cells: ITableCell[], cell: ITableCell): number[] => {
  const excluded = new Set<number>()
  for (const item of cells) {
    if (item.value > 0) {
      if (item.x === cell.x) excluded.add(item.value)
      if (item.y === cell.y) excluded.add(item.value)
      if (item.tile === cell.tile) excluded.add(item.value)
    }
  }
  const result: number[] = []
  for (let i = 1; i <= 9; i++) {
    if (!excluded.has(i)) {
      result.push(i)
    }
  }
  return result
}
function removeCluesSymmetrically(desiredClues: number) {
  let filledCount = table.value.filter((c) => c.value !== 0).length
  const halfIndices = Array.from({ length: 41 }, (_, i) => i)
  shuffleArray(halfIndices)

  for (const idx of halfIndices) {
    if (filledCount <= desiredClues) {
      break
    }

    const symIdx = 80 - idx
    const oldVal1 = table.value[idx].value
    const oldVal2 = table.value[symIdx].value

    if (oldVal1 === 0 && oldVal2 === 0) {
      continue
    }

    table.value[idx].value = 0
    table.value[idx].editable = true

    if (idx !== symIdx) {
      table.value[symIdx].value = 0
      table.value[symIdx].editable = true
    }

    let removedNow = 1
    if (idx !== symIdx && oldVal2 !== 0) removedNow = 2
    if (oldVal1 === 0) removedNow--
    filledCount -= removedNow
    if (!hasUniqueSolution()) {
      table.value[idx].value = oldVal1
      table.value[idx].editable = false
      if (idx !== symIdx) {
        table.value[symIdx].value = oldVal2
        table.value[symIdx].editable = false
      }
      filledCount += removedNow
    }
  }
}

function hasUniqueSolution(): boolean {
  const tempTable = table.value.map((cell) => ({ ...cell }))
  let solutionCount = 0

  solveWithCount(tempTable, 0, () => {
    solutionCount++
  })

  return solutionCount === 1
}

function solveWithCount(cells: ITableCell[], index: number, onSolutionFound: () => void) {
  if (index === 81) {
    onSolutionFound()
    return
  }

  const cell = cells[index]
  if (cell.value !== 0) {
    solveWithCount(cells, index + 1, onSolutionFound)
    return
  }

  const possible = getPossibleNumbers(cells, cell)
  for (const num of possible) {
    cell.value = num
    solveWithCount(cells, index + 1, onSolutionFound)
    cell.value = 0
  }
}

onMounted(() => {
  const tableSnapshot = localStorage.getItem('tableSnapshot')
  const selectedCell = localStorage.getItem('selectedCell')
  const numberCounter = localStorage.getItem('numberCounter')
  const gameFinished = localStorage.getItem('gameFinished')
  if (tableSnapshot) {
    const parsedTable: ITableCell[] = JSON.parse(tableSnapshot) as ITableCell[]
    table.value = parsedTable
    GameStore.changeSudokuTable(parsedTable)
  } else {
    createTable()
  }
  if (numberCounter) {
    GameStore.changeRemainNumberCounter(JSON.parse(numberCounter))
  }
  if (selectedCell) {
    GameStore.selectCellRaw(Number(selectedCell))
  }
  if (gameFinished && gameFinished === 'true') {
    GameStore.changeGameFinishedState(true)
  }
})
</script>

<style lang="scss" scoped>
.sudoku-wrapper-wrapper {
  height: 100%;
  .sudoku-wrapper-header {
    width: 100%;
    height: 50px;
    flex-shrink: 0;
  }
  .sudoku-wrapper-row {
    height: calc(100% - 50px);
  }
}
.sudoku-wrapper-table {
  width: 60%;
  padding: 1rem;
}
.sudoku-wrapper-sidebar {
  width: 40%;
}

@media screen and (max-width: 960px) {
  .sudoku-wrapper-row {
    flex-direction: column;
  }
  .sudoku-wrapper-grid,
  .sudoku-wrapper-sidebar {
    width: 100%;
  }
}
</style>
