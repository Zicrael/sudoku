import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SudokuWrapper from '@/components/sudoku/SudokuWrapper.vue'
import { mockStoreTable } from './mocks/storeTable.ts'

// ──────────────────────────────────────────────────────────────────────────────
// 1. Mock Pinia Store (gameStore.ts)
// ──────────────────────────────────────────────────────────────────────────────
vi.mock('@/stores/gameStore.ts', () => {
  return {
    useGameStore: () => ({
      getGameSettings: {
        difficulty: 0,
      },
      gameProgress: {
        score: 100,
        elapsedTime: 60,
      },
      hints: {
        used: 3,
        max: 10,
      },
      table: mockStoreTable,
      selectedCell: 0,
      changeSudokuTable: vi.fn(),
      changeRemainNumberCounter: vi.fn(),
      changeGameFinishedState: vi.fn(),
      selectCellRaw: vi.fn(),
      getRemainNumberCounter: vi.fn(),
    }),
  }
})

// ──────────────────────────────────────────────────────────────────────────────
// 2. Mock localStorage
// ──────────────────────────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────────────────────
// 3. Mock other dependencies
// ──────────────────────────────────────────────────────────────────────────────
vi.mock('@/utils/ArrayUtils.ts', () => ({
  shuffleArray: vi.fn(), // We can track usage if needed
}))

// ──────────────────────────────────────────────────────────────────────────────
// 4. Test Suite
// ──────────────────────────────────────────────────────────────────────────────
describe('SudokuWrapper.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    localStorageMock.clear()
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      configurable: true,
    })
  })

  it('mounts properly and renders child components', () => {
    const wrapper = mount(SudokuWrapper)
    expect(wrapper.findComponent({ name: 'SudokuHeader' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'SudokuTable' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'SudokuSidebar' }).exists()).toBe(true)
  })
})
