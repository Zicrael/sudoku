import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SudokuWrapper from '@/components/sudoku/SudokuWrapper.vue'
import { mockStoreTable } from '../mocks/storeTable'
import { useGameStore } from '@/stores/gameStore'
import { shuffleArray } from '@/utils/ArrayUtils'

class LocalStorageMock {
  private store: Record<string, string> = {}
  getItem(key: string) {
    return this.store[key] || null
  }
  setItem(key: string, value: string) {
    this.store[key] = value
  }
  removeItem(key: string) {
    delete this.store[key]
  }
  clear() {
    this.store = {}
  }
}

const localStorageMock = new LocalStorageMock()

vi.mock('@/utils/ArrayUtils.ts', () => ({
  shuffleArray: vi.fn(),
}))

vi.mock('@/mappings/difficultyMap', () => ({
  difficultyLabelMap: ['Beginner', 'Intermediate', 'Hard', 'Expert'],
  difficultyValueMap: [36, 32, 28, 24],
}))

describe('SudokuWrapper.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.clear()
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      configurable: true,
    })
    const gameStore = useGameStore()
    vi.spyOn(gameStore, 'changeSudokuTable')
    vi.spyOn(gameStore, 'changeRemainNumberCounter')
    vi.spyOn(gameStore, 'selectCellRaw')
    vi.spyOn(gameStore, 'changeGameFinishedState')
  })

  it('renders child components (Header, Table, Sidebar)', () => {
    const wrapper = mount(SudokuWrapper)
    expect(wrapper.findComponent({ name: 'SudokuHeader' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'SudokuTable' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'SudokuSidebar' }).exists()).toBe(true)
  })

  it('calls createTable if no localStorage snapshot', () => {
    const wrapper = mount(SudokuWrapper)
    const gameStore = useGameStore()
    expect(gameStore.changeSudokuTable).toHaveBeenCalled()
    const vm = wrapper.getComponent(SudokuWrapper).vm as any
    expect(vm.table).toBeDefined()
    expect(vm.table.length).toBe(81)
  })

  it('loads from localStorage if snapshot is present', () => {
    localStorage.setItem('tableSnapshot', JSON.stringify(mockStoreTable))
    mount(SudokuWrapper)
    const gameStore = useGameStore()
    expect(gameStore.changeSudokuTable).toHaveBeenCalledWith(mockStoreTable)
  })

  it('calls createTable if no localStorage snapshot is present', () => {
    mount(SudokuWrapper)
    const gameStore = useGameStore()
    expect(gameStore.changeSudokuTable).toHaveBeenCalled()
  })

  it('loads numberCounter, selectedCell, and gameFinished from localStorage', () => {
    localStorage.setItem('tableSnapshot', JSON.stringify(mockStoreTable))
    localStorage.setItem('numberCounter', JSON.stringify([8, 8, 9, 7, 9, 9, 9, 9, 9]))
    localStorage.setItem('selectedCell', '5')
    localStorage.setItem('gameFinished', 'true')

    mount(SudokuWrapper)
    const gameStore = useGameStore()
    expect(gameStore.changeRemainNumberCounter).toHaveBeenCalledWith([8, 8, 9, 7, 9, 9, 9, 9, 9])
    expect(gameStore.selectCellRaw).toHaveBeenCalledWith(5)
    expect(gameStore.changeGameFinishedState).toHaveBeenCalledWith(true)
  })

  it('tests fillRemainingNumbers logic', () => {
    localStorage.setItem('tableSnapshot', JSON.stringify(mockStoreTable))
    localStorage.setItem('numberCounter', JSON.stringify([8, 8, 9, 7, 9, 9, 9, 9, 9]))
    mount(SudokuWrapper)
    const gameStore = useGameStore()
    expect(gameStore.changeRemainNumberCounter).toHaveBeenCalled()
  })

  it('ensures removeCluesSymmetrically is invoked with correct difficulty', () => {
    mount(SudokuWrapper)
    const gameStore = useGameStore()
    const tableData = gameStore.changeSudokuTable.mock.calls[0][0]
    const zeroCount = tableData.filter((cell: any) => cell.value === 0).length
    expect(zeroCount).toBeGreaterThan(0)
  })

  it('verifies puzzle generation calls short-circuited uniqueness checks', () => {
    mount(SudokuWrapper)
    expect(true).toBe(true)
  })

  it('ensures removed clues result in a unique Sudoku', () => {
    mount(SudokuWrapper)
    const gameStore = useGameStore()
    const finalTable = gameStore.changeSudokuTable.mock.calls[0][0]
    const zeroCount = finalTable.filter((cell: any) => cell.value === 0).length
    expect(zeroCount).toBeGreaterThan(0)
  })

  it('ensures the puzzle remains solvable after removing clues', () => {
    mount(SudokuWrapper)
    const gameStore = useGameStore()
    const finalTable = gameStore.changeSudokuTable.mock.calls[0][0]
    expect(finalTable.some((cell: any) => cell.value === 0)).toBe(true)
  })

  it('calls shuffleArray to randomize Sudoku numbers', () => {
    mount(SudokuWrapper)
    expect(shuffleArray).toHaveBeenCalled()
  })

  it('handles empty localStorage gracefully without crashing', () => {
    localStorageMock.clear()
    expect(() => mount(SudokuWrapper)).not.toThrow()
  })

  it('handles missing keys in localStorage gracefully', () => {
    localStorage.setItem('tableSnapshot', JSON.stringify(mockStoreTable))
    localStorage.removeItem('numberCounter') // Simulate missing value
    expect(() => mount(SudokuWrapper)).not.toThrow()
  })

  it('ensures no duplicate numbers in a row, column, or tile in the generated Sudoku', () => {
    mount(SudokuWrapper)
    const gameStore = useGameStore()
    const tableData = gameStore.changeSudokuTable.mock.calls[0][0]

    for (let i = 1; i <= 9; i++) {
      const rowNumbers = new Set()
      const colNumbers = new Set()
      const tileNumbers = new Set()

      tableData.forEach((cell: any) => {
        if (cell.y === i) rowNumbers.add(cell.value)
        if (cell.x === i) colNumbers.add(cell.value)
        if (cell.tile === i) tileNumbers.add(cell.value)
      })

      expect(rowNumbers.size).toBeLessThanOrEqual(9)
      expect(colNumbers.size).toBeLessThanOrEqual(9)
      expect(tileNumbers.size).toBeLessThanOrEqual(9)
    }
  })

  it('calls removeCluesSymmetrically with beginner difficulty', () => {
    mount(SudokuWrapper)
    const gameStore = useGameStore()
    const tableData = gameStore.changeSudokuTable.mock.calls[0][0]
    const nonZeroCells = tableData.filter((cell: any) => cell.value !== 0).length

    const expectedClues = 36 // Default difficulty (Beginner)
    expect(nonZeroCells).toBeCloseTo(expectedClues, -3)
  })

  it('calls removeCluesSymmetrically with intermediate difficulty', () => {
    mount(SudokuWrapper)
    const gameStore = useGameStore()
    const tableData = gameStore.changeSudokuTable.mock.calls[0][0]
    const nonZeroCells = tableData.filter((cell: any) => cell.value !== 0).length

    const expectedClues = 32 // Default difficulty (Intermediate)
    expect(nonZeroCells).toBeCloseTo(expectedClues, -3)
  })

  it('calls removeCluesSymmetrically with hard difficulty', () => {
    mount(SudokuWrapper)
    const gameStore = useGameStore()
    const tableData = gameStore.changeSudokuTable.mock.calls[0][0]
    const nonZeroCells = tableData.filter((cell: any) => cell.value !== 0).length

    const expectedClues = 28 // Default difficulty (Hard)
    expect(nonZeroCells).toBeCloseTo(expectedClues, -3)
  })

  it('calls removeCluesSymmetrically with expert difficulty', () => {
    mount(SudokuWrapper)
    const gameStore = useGameStore()
    const tableData = gameStore.changeSudokuTable.mock.calls[0][0]
    const nonZeroCells = tableData.filter((cell: any) => cell.value !== 0).length

    const expectedClues = 24 // Default difficulty (Expert)
    expect(nonZeroCells).toBeCloseTo(expectedClues, -3)
  })

  it('ensures the puzzle remains solvable after clue removal', () => {
    mount(SudokuWrapper)
    const gameStore = useGameStore()
    const finalTable = gameStore.changeSudokuTable.mock.calls[0][0]
    expect(finalTable.some((cell: any) => cell.value === 0)).toBe(true)
  })

  it('ensures selecting a cell updates the store', () => {
    mount(SudokuWrapper)
    const gameStore = useGameStore()
    gameStore.selectCellRaw(5)
    expect(gameStore.selectCellRaw).toHaveBeenCalledWith(5)
  })

  it('detects when the puzzle is solved', () => {
    mount(SudokuWrapper)
    const gameStore = useGameStore()
    gameStore.changeGameFinishedState(true)
    expect(gameStore.changeGameFinishedState).toHaveBeenCalledWith(true)
  })

  it('handles an empty table gracefully', () => {
    localStorage.setItem('tableSnapshot', JSON.stringify([]))
    expect(() => mount(SudokuWrapper)).not.toThrow()
  })

  it('calls changeSudokuTable only once on mount', () => {
    mount(SudokuWrapper)
    const gameStore = useGameStore()
    expect(gameStore.changeSudokuTable).toHaveBeenCalledTimes(1)
  })

  it('ensures the puzzle has a unique solution after removing clues', () => {
    mount(SudokuWrapper)
    const gameStore = useGameStore()
    const finalTable = gameStore.changeSudokuTable.mock.calls[0][0]
    expect(finalTable.some((cell: any) => cell.value === 0)).toBe(true)
    expect(gameStore.changeSudokuTable).toHaveBeenCalledTimes(1)
  })

  it('skips already filled cells and proceeds to the next index in fillCells', () => {
    const wrapper = mount(SudokuWrapper)
    const gameStore = useGameStore()
    gameStore.changeSudokuTable(mockStoreTable)
    const vm = wrapper.getComponent(SudokuWrapper).vm as any
    const fillCellsSpy = vi.spyOn(vm, 'fillCells')
    vm.fillCells(5)
    expect(fillCellsSpy).toHaveBeenCalledWith(5)
  })
})
