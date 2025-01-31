import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SudokuTable from '@/components/sudoku/SudokuTable.vue'
import { useGameStore } from '@/stores/gameStore'
import { mockStoreTable } from '../mocks/storeTable'

describe('SudokuTable (SudokuTableContent) Component', () => {
  let gameStore: ReturnType<typeof useGameStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    gameStore = useGameStore()

    gameStore.table = mockStoreTable
    gameStore.selectedCell = null
    gameStore.gameFinished = false
    gameStore.gameProgress = { score: 0 }

    vi.spyOn(gameStore, 'selectCell')
    vi.spyOn(gameStore, 'handleCellInput')
    vi.spyOn(gameStore, 'handleDraftInput')
    vi.spyOn(gameStore, 'getRemainNumberCounter', 'get').mockReturnValue([
      9, 9, 9, 9, 9, 9, 9, 9, 9,
    ])
    vi.spyOn(gameStore, 'isDraftMode', 'get').mockReturnValue(true)
  })

  it('renders 81 cells', () => {
    const wrapper = mount(SudokuTable)
    const cells = wrapper.findAll('.sudoku-table-cell')
    expect(cells.length).toBe(81)
  })

  it('highlights selected cell and calls store.selectCell on click', async () => {
    const wrapper = mount(SudokuTable)
    const cells = wrapper.findAll('.sudoku-table-cell')
    await cells[10].trigger('click')
    expect(gameStore.selectCell).toHaveBeenCalledWith(10)
  })

  it('does not select cell if winAnimation has started', async () => {
    const wrapper = mount(SudokuTable)
    const vm = wrapper.getComponent(SudokuTable).vm as any
    vm.winAnimationStarted = true
    const cells = wrapper.findAll('.sudoku-table-cell')
    await cells[5].trigger('click')
    expect(gameStore.selectCell).not.toHaveBeenCalled()
  })

  it('listens to keyup events on mount and removes on unmount', async () => {
    const addEventSpy = vi.spyOn(document, 'addEventListener')
    const removeEventSpy = vi.spyOn(document, 'removeEventListener')
    const wrapper = mount(SudokuTable)

    expect(addEventSpy).toHaveBeenCalledWith('keyup', expect.any(Function))
    wrapper.unmount()
    expect(removeEventSpy).toHaveBeenCalledWith('keyup', expect.any(Function))
  })

  it('handles number keys for cell input if selectedCell is editable and not in win animation', async () => {
    vi.spyOn(gameStore, 'isDraftMode', 'get').mockReturnValue(false)
    mount(SudokuTable)
    gameStore.selectedCell = 5
    gameStore.table[5].editable = true
    const event = new KeyboardEvent('keyup', { key: '3' })
    document.dispatchEvent(event)
    expect(gameStore.handleCellInput).toHaveBeenCalledWith(5, 3)
  })

  it('calls handleDraftInput if isDraftMode is enabled', async () => {
    mount(SudokuTable)
    gameStore.selectedCell = 10
    gameStore.table[10].editable = true
    document.dispatchEvent(new KeyboardEvent('keyup', { key: '9' }))
    expect(gameStore.handleDraftInput).toHaveBeenCalledWith(10, 9)
  })

  it('starts win animation when gameFinished is set to true', async () => {
    const wrapper = mount(SudokuTable)
    const vm = wrapper.getComponent(SudokuTable).vm as any
    expect(vm.winAnimationStarted).toBe(false)
    gameStore.gameFinished = true
    await wrapper.vm.$nextTick()

    expect(vm.winAnimationStarted).toBe(true)
  })

  it('win animation sets all cells to animation class eventually', async () => {
    vi.useFakeTimers()
    const wrapper = mount(SudokuTable)
    const vm = wrapper.getComponent(SudokuTable).vm as any
    gameStore.gameFinished = true
    await wrapper.vm.$nextTick()
    vi.runAllTimers()
    expect(vm.winAnimationHelper.length).toBe(81)
    expect(vm.winAnimationFinished).toBe(true)

    vi.useRealTimers()
  })

  it('displays a random congratulations message when puzzle is won', async () => {
    const wrapper = mount(SudokuTable)
    const vm = wrapper.getComponent(SudokuTable).vm as any
    gameStore.gameFinished = true
    await wrapper.vm.$nextTick()
    const possibleMessages = vm.congratulationsArray
    expect(possibleMessages).toContain(vm.congratulationsMessage)
  })

  it('renders the win screen after animation finishes', async () => {
    vi.useFakeTimers()
    const wrapper = mount(SudokuTable)
    gameStore.gameFinished = true
    await wrapper.vm.$nextTick()
    vi.runAllTimers()
    await wrapper.vm.$nextTick()
    const screen = wrapper.find('.sudoku-table-win-screen')
    expect(screen.exists()).toBe(true)
    expect(screen.classes()).not.toContain('hidden')
    vi.useRealTimers()
  })

  it('adds appropriate cell classes (highlight, error, resolved, draft)', async () => {
    const wrapper = mount(SudokuTable)
    gameStore.table[0].highlight = true
    gameStore.table[1].error = true
    gameStore.table[2].resolved = true
    gameStore.table[2].resolvedByPlayer = true
    gameStore.table[3].draft = 5
    await wrapper.vm.$forceUpdate()
    const cells = wrapper.findAll('.sudoku-table-cell')
    expect(cells[0].classes()).toContain('highlighted-cell')
    expect(cells[1].classes()).toContain('error-cell')
    expect(cells[2].classes()).toContain('resolved-cell')
    expect(cells[3].classes()).toContain('draft-cell')
  })
})
