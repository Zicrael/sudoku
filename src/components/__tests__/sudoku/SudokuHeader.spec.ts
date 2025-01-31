import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SudokuHeader from '@/components/sudoku/SudokuHeader.vue'
import { useGameStore } from '@/stores/gameStore'
import { difficultyLabelMap } from '@/mappings/difficultyMap'

// Use a fake localStorage if needed
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

describe('SudokuHeader.vue', () => {
  let gameStore: ReturnType<typeof useGameStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    gameStore = useGameStore()

    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      configurable: true,
    })
    localStorageMock.clear()
    gameStore.getGameSettings.difficulty = 0
    gameStore.hints = {
      used: 0,
      max: 3,
    }
    gameStore.gameProgress = {
      score: 0,
    }
    gameStore.gameFinished = false

    vi.spyOn(gameStore, 'changeUsedHints')
    vi.spyOn(gameStore, 'changeScore')
    vi.spyOn(gameStore, 'changeElapsedTime')
  })

  it('renders difficulty label, hints, score, and time', () => {
    const wrapper = mount(SudokuHeader)
    const difficultyText = wrapper.find('.sudoku-header-difficulty span:nth-child(2)').text()
    const hintsText = wrapper.find('.sudoku-header-hints span:nth-child(2)').text()
    const scoreText = wrapper.find('.sudoku-header-score span:nth-child(2)').text()
    const timeText = wrapper.find('.sudoku-header-time span:nth-child(2)').text()

    expect(difficultyText).toBe(difficultyLabelMap[0])
    expect(hintsText).toBe('3 / 3')
    expect(scoreText).toBe('0')
    expect(timeText).toBe('00:00')
  })

  it('loads usedHints, totalScore, and elapsedTime from localStorage on mount', () => {
    localStorage.setItem('usedHints', '2')
    localStorage.setItem('totalScore', '150')
    localStorage.setItem('elapsedTime', '45')

    mount(SudokuHeader)
    // after mounting, check store was updated
    expect(gameStore.changeUsedHints).toHaveBeenCalledWith(2)
    expect(gameStore.changeScore).toHaveBeenCalledWith(150)
  })

  it('starts timer on mount', () => {
    const wrapper = mount(SudokuHeader)
    expect(wrapper.getComponent(SudokuHeader).vm['interval']).not.toBeNull()
  })

  it('increments timer and updates formattedTimer each second', () => {
    vi.useFakeTimers()

    const wrapper = mount(SudokuHeader)
    const vm = wrapper.getComponent(SudokuHeader).vm as any
    expect(vm.formattedTimer).toBe('00:00')
    expect(vm.timer).toBe(0)
    vi.advanceTimersByTime(1000)
    expect(vm.timer).toBe(1)
    expect(vm.formattedTimer).toBe('00:01')
    vi.advanceTimersByTime(59_000)
    expect(vm.timer).toBe(60)
    expect(vm.formattedTimer).toBe('01:00')
    expect(gameStore.changeElapsedTime).toHaveBeenCalled()

    vi.useRealTimers()
  })

  it('stops timer when gameFinished = true', async () => {
    vi.useFakeTimers()
    const wrapper = mount(SudokuHeader)
    const vm = wrapper.getComponent(SudokuHeader).vm as any

    gameStore.gameFinished = true
    await wrapper.vm.$nextTick()
    expect(vm['interval']).toBeNull()
    vi.useRealTimers()
  })

  it('removes keyup listener on unmount', () => {
    const addSpy = vi.spyOn(document, 'addEventListener')
    const removeSpy = vi.spyOn(document, 'removeEventListener')
    const wrapper = mount(SudokuHeader)

    expect(addSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
    wrapper.unmount()
    expect(removeSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function))
  })

  it('handles visibilitychange: stops timer if hidden, starts if visible', () => {
    vi.useFakeTimers()
    const wrapper = mount(SudokuHeader)
    const vm = wrapper.getComponent(SudokuHeader).vm as any
    expect(vm['interval']).not.toBeNull()
    Object.defineProperty(document, 'hidden', { value: true, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(vm['interval']).toBeNull()
    Object.defineProperty(document, 'hidden', { value: false, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(vm['interval']).not.toBeNull()

    vi.useRealTimers()
  })

  it('formats time with hours when total >= 3600 seconds', () => {
    vi.useFakeTimers()
    const wrapper = mount(SudokuHeader)
    const vm = wrapper.getComponent(SudokuHeader).vm as any
    vm.timer = 3671
    vm.updateFormattedTimer()
    expect(vm.formattedTimer).toBe('01:01:11')

    vi.useRealTimers()
  })
})
