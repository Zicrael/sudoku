<template>
  <section class="sudoku-wrapper-wrapper flex direction-column">
    <header class="sudoku-wrapper-header mt-2 mr-2 ml-2">
      <SudokuHeader />
    </header>
    <div class="sudoku-wrapper-row flex">
      <section class="sudoku-wrapper-table m-2 mt-0">
        <SudokuTable />
      </section>
      <aside class="sudoku-wrapper-sidebar m-2">
        <SudokuSidebar />
      </aside>
    </div>
  </section>
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

// Usage arrays for row, column, box constraints
const rowUsed = Array.from({ length: 9 }, () => Array(10).fill(false))
const colUsed = Array.from({ length: 9 }, () => Array(10).fill(false))
const boxUsed = Array.from({ length: 9 }, () => Array(10).fill(false))

/**
 * Builds a puzzle:
 * 1) Create 81 cells
 * 2) Fill them (full solution)
 * 3) Remove clues in batches (symmetry)
 * 4) Fill remaining numbers array
 * 5) Update store
 */
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

  resetUsage()
  fillCells(0)

  // Remove in symmetrical batches
  removeCluesSymmetrically(difficultyValueMap[GameStore.getGameSettings.difficulty])

  fillRemainingNumbers()
  GameStore.changeSudokuTable(table.value)
}

/** Count how many of each digit remain and store it (like a "remaining numbers" UI). */
const fillRemainingNumbers = () => {
  const visibleCells = table.value.filter((cell) => cell.value !== 0)
  const numbersArr = Array(9).fill(9)

  for (const cell of visibleCells) {
    numbersArr[cell.value - 1]--
  }
  GameStore.changeRemainNumberCounter(numbersArr)
}

// ─────────────────────────────────────────────────────────────────────
// 1. USAGE ARRAYS
// ─────────────────────────────────────────────────────────────────────
function resetUsage() {
  for (let i = 0; i < 9; i++) {
    for (let num = 1; num <= 9; num++) {
      rowUsed[i][num] = false
      colUsed[i][num] = false
      boxUsed[i][num] = false
    }
  }
  // Fill usage based on current table state (initially blank, but let's keep it consistent)
  for (let i = 0; i < 81; i++) {
    const cell = table.value[i]
    if (cell.value !== 0) {
      placeNumber(cell.y - 1, cell.x - 1, cell.tile - 1, cell.value)
    }
  }
}

/** Mark a number as used in rowUsed, colUsed, boxUsed. */
function placeNumber(row: number, col: number, box: number, num: number) {
  rowUsed[row][num] = true
  colUsed[col][num] = true
  boxUsed[box][num] = true
}

/** Unmark a number from usage arrays. */
function removeNumber(row: number, col: number, box: number, num: number) {
  rowUsed[row][num] = false
  colUsed[col][num] = false
  boxUsed[box][num] = false
}

function getPossibleCandidates(row: number, col: number, box: number): number[] {
  const result: number[] = []
  for (let num = 1; num <= 9; num++) {
    if (!rowUsed[row][num] && !colUsed[col][num] && !boxUsed[box][num]) {
      result.push(num)
    }
  }
  return result
}

// ─────────────────────────────────────────────────────────────────────
// 2. FILL CELLS (FULL SOLUTION)
// ─────────────────────────────────────────────────────────────────────
const fillCells = (index: number): boolean => {
  if (index >= 81) return true

  const cell = table.value[index]
  if (cell.value !== 0) {
    return fillCells(index + 1)
  }

  const row = cell.y - 1
  const col = cell.x - 1
  const box = cell.tile - 1

  const candidates = getPossibleCandidates(row, col, box)
  shuffleArray(candidates)

  for (const candidate of candidates) {
    cell.value = candidate
    cell.solution = candidate
    placeNumber(row, col, box, candidate)

    if (fillCells(index + 1)) {
      return true
    }

    // backtrack
    cell.value = 0
    cell.solution = 0
    removeNumber(row, col, box, candidate)
  }
  return false
}

// ─────────────────────────────────────────────────────────────────────
// 3. REMOVE CLUES SYMMETRICALLY W/ BATCH LOGIC
// ─────────────────────────────────────────────────────────────────────
function removeCluesSymmetrically(desiredClues: number) {
  let filledCount = table.value.filter((c) => c.value !== 0).length

  // Indices [0..40] (mirrored with [80..40])
  const halfIndices = Array.from({ length: 41 }, (_, i) => i)
  shuffleArray(halfIndices)

  for (const idx of halfIndices) {
    // Stop if we've already reached the desired # of clues
    if (filledCount <= desiredClues) break

    removeSinglePair(idx)
    // Recalculate filledCount
    filledCount = table.value.filter((c) => c.value !== 0).length
  }
}

/**
 * Remove a single symmetrical pair (idx, symIdx) and revert if uniqueness fails.
 */
function removeSinglePair(idx: number) {
  const symIdx = 80 - idx

  const oldVal1 = table.value[idx].value
  const oldVal2 = table.value[symIdx].value

  // If both are already 0, skip
  if (oldVal1 === 0 && oldVal2 === 0) return

  // Remove #1
  table.value[idx].value = 0
  table.value[idx].editable = true
  if (oldVal1 !== 0) {
    removeNumber(table.value[idx].y - 1, table.value[idx].x - 1, table.value[idx].tile - 1, oldVal1)
  }

  // Possibly remove symmetrical #2
  if (idx !== symIdx) {
    table.value[symIdx].value = 0
    table.value[symIdx].editable = true
    if (oldVal2 !== 0) {
      removeNumber(
        table.value[symIdx].y - 1,
        table.value[symIdx].x - 1,
        table.value[symIdx].tile - 1,
        oldVal2,
      )
    }
  }

  // Check uniqueness
  if (!hasUniqueSolution()) {
    // revert
    table.value[idx].value = oldVal1
    table.value[idx].editable = false
    if (oldVal1 !== 0) {
      placeNumber(
        table.value[idx].y - 1,
        table.value[idx].x - 1,
        table.value[idx].tile - 1,
        oldVal1,
      )
    }

    if (idx !== symIdx) {
      table.value[symIdx].value = oldVal2
      table.value[symIdx].editable = false
      if (oldVal2 !== 0) {
        placeNumber(
          table.value[symIdx].y - 1,
          table.value[symIdx].x - 1,
          table.value[symIdx].tile - 1,
          oldVal2,
        )
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────
// 4. CHECK UNIQUENESS - SHORT CIRCUIT
// ─────────────────────────────────────────────────────────────────────
function hasUniqueSolution(): boolean {
  const tempCells = table.value.map((cell) => ({ ...cell }))
  const rowUsedCopy = rowUsed.map((row) => row.slice())
  const colUsedCopy = colUsed.map((col) => col.slice())
  const boxUsedCopy = boxUsed.map((box) => box.slice())

  // We'll store solutionCount in an object so we can modify it in place
  const solverStats = { solutionCount: 0 }
  solveWithCount(tempCells, 0, solverStats, rowUsedCopy, colUsedCopy, boxUsedCopy)
  return solverStats.solutionCount === 1
}

/**
 * Short-circuits as soon as solutionCount >= 2
 */
function solveWithCount(
  cells: ITableCell[],
  index: number,
  stats: { solutionCount: number },
  rUsed: boolean[][],
  cUsed: boolean[][],
  bUsed: boolean[][],
) {
  // if we already found 2 solutions, return
  if (stats.solutionCount >= 2) return

  if (index === 81) {
    stats.solutionCount++
    return
  }
  const cell = cells[index]
  if (cell.value !== 0) {
    solveWithCount(cells, index + 1, stats, rUsed, cUsed, bUsed)
    return
  }

  const r = cell.y - 1
  const c = cell.x - 1
  const b = cell.tile - 1

  const possible: number[] = []
  for (let num = 1; num <= 9; num++) {
    if (!rUsed[r][num] && !cUsed[c][num] && !bUsed[b][num]) {
      possible.push(num)
    }
  }

  for (const num of possible) {
    if (stats.solutionCount >= 2) return // short-circuit check
    cell.value = num
    rUsed[r][num] = true
    cUsed[c][num] = true
    bUsed[b][num] = true

    solveWithCount(cells, index + 1, stats, rUsed, cUsed, bUsed)

    cell.value = 0
    rUsed[r][num] = false
    cUsed[c][num] = false
    bUsed[b][num] = false
  }
}

// ─────────────────────────────────────────────────────────────────────
// 5. ON MOUNT
// ─────────────────────────────────────────────────────────────────────
onMounted(() => {
  const tableSnapshot = localStorage.getItem('tableSnapshot')
  const selectedCell = localStorage.getItem('selectedCell')
  const numberCounter = localStorage.getItem('numberCounter')
  const gameFinished = localStorage.getItem('gameFinished')

  if (tableSnapshot) {
    const parsedTable: ITableCell[] = JSON.parse(tableSnapshot) as ITableCell[]
    table.value = parsedTable
    resetUsage()
    for (const cell of table.value) {
      if (cell.value) {
        placeNumber(cell.y - 1, cell.x - 1, cell.tile - 1, cell.value)
      }
    }
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
  if (gameFinished === 'true') {
    GameStore.changeGameFinishedState(true)
  }
})
</script>

<style lang="scss" scoped>
.sudoku-wrapper-wrapper {
  height: 100%;

  .sudoku-wrapper-header {
    flex-shrink: 0;
  }

  .sudoku-wrapper-row {
    height: calc(100% - 1rem - 28px);
  }
}

.sudoku-wrapper-table {
  width: 60%;
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
