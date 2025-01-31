import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SudokuSidebar from '@/components/sudoku/SudokuSidebar.vue'
import { useGameStore } from '@/stores/gameStore'
import { GameState } from '@/enums/GameStoreEnums'

describe('SudokuSidebar.vue', () => {
  let gameStore: ReturnType<typeof useGameStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    gameStore = useGameStore()

    gameStore.gameFinished = false
    gameStore.selectedCell = null
    gameStore.table = Array.from({ length: 81 }, () => ({
      editable: true,
      value: 0,
      resolved: false,
    }))
    gameStore.hints = {
      used: 0,
      max: 3,
    }
    gameStore.draftMode = false

    vi.spyOn(gameStore, 'endGame')
    vi.spyOn(gameStore, 'changeGameState')
    vi.spyOn(gameStore, 'changeDraftMode')
    vi.spyOn(gameStore, 'useHint')
    vi.spyOn(gameStore, 'handleCellInput')
    vi.spyOn(gameStore, 'handleDraftInput')
    vi.spyOn(gameStore, 'selectCell')
    vi.spyOn(gameStore, 'getRemainNumberCounter', 'get').mockReturnValue([
      9, 9, 9, 9, 9, 9, 9, 9, 9,
    ])

    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    })
  })

  it('renders sidebar action buttons', () => {
    const wrapper = mount(SudokuSidebar)
    const actionButtons = wrapper.findAll('.sidebar-actions-item-button')
    expect(actionButtons.length).toBe(4)
  })

  it('renders numpad buttons (1..9)', () => {
    const wrapper = mount(SudokuSidebar)
    const numpad = wrapper.findAll('.sidebar-numpad-item')
    expect(numpad.length).toBe(9)
  })

  it('calls "pauseGame" when pause button is clicked', async () => {
    const wrapper = mount(SudokuSidebar)
    const pauseButton = wrapper.findAll('.sidebar-actions-item-button')[1]

    await pauseButton.trigger('click')
    expect(gameStore.changeGameState).toHaveBeenCalledWith(GameState.PAUSE)
  })

  it('toggles draft mode on button click if game not finished', async () => {
    const wrapper = mount(SudokuSidebar)
    const draftButton = wrapper.findAll('.sidebar-actions-item-button')[2]

    await draftButton.trigger('click')
    expect(gameStore.changeDraftMode).toHaveBeenCalledWith(true)
  })

  it('does not toggle draft if game is finished', async () => {
    gameStore.gameFinished = true
    const wrapper = mount(SudokuSidebar)
    const draftButton = wrapper.findAll('.sidebar-actions-item-button')[2]

    await draftButton.trigger('click')
    expect(gameStore.changeDraftMode).not.toHaveBeenCalled()
  })

  it('handles "useHint" correctly if not disabled', async () => {
    const wrapper = mount(SudokuSidebar)
    gameStore.selectedCell = 10
    gameStore.table[10].editable = true
    gameStore.hints.used = 0
    gameStore.hints.max = 3

    const hintButton = wrapper.findAll('.sidebar-actions-item-button')[3]
    await hintButton.trigger('click')
    expect(gameStore.useHint).toHaveBeenCalledWith(10)
  })

  it('disables hint if cell is resolved or no hints left', async () => {
    gameStore.selectedCell = 0
    gameStore.table[0].editable = true
    gameStore.table[0].resolved = true
    gameStore.hints.used = 3
    gameStore.hints.max = 3
    const wrapper = mount(SudokuSidebar)

    const hintButton = wrapper.findAll('.sidebar-actions-item-button')[3]
    await hintButton.trigger('click')
    expect(gameStore.useHint).not.toHaveBeenCalled()
  })

  it('clicking numpad calls handleCellInput or handleDraftInput if cell editable', async () => {
    const wrapper = mount(SudokuSidebar)
    gameStore.selectedCell = 5
    const numpadButtons = wrapper.findAll('.sidebar-numpad-item')
    await numpadButtons[2].trigger('click')
    expect(gameStore.handleCellInput).toHaveBeenCalledWith(5, 3)

    gameStore.draftMode = true
    await numpadButtons[5].trigger('click')
    expect(gameStore.handleDraftInput).toHaveBeenCalledWith(5, 6)
  })

  it('does not call handleCellInput if remainNumberCounter is 0 for that digit', async () => {
    const wrapper = mount(SudokuSidebar)
    gameStore.selectedCell = 4
    vi.spyOn(gameStore, 'getRemainNumberCounter', 'get').mockReturnValue([
      9, 0, 9, 9, 9, 9, 9, 9, 9,
    ])
    const numpadButtons = wrapper.findAll('.sidebar-numpad-item')
    await numpadButtons[1].trigger('click')
    expect(gameStore.handleCellInput).not.toHaveBeenCalled()
    expect(gameStore.handleDraftInput).not.toHaveBeenCalled()
  })

  it('endGame button calls GameStore.endGame if game not finished', async () => {
    gameStore.gameFinished = false
    const wrapper = mount(SudokuSidebar)
    const endGameButton = wrapper.find('.sidebar-back-button')

    await endGameButton.trigger('click')
    expect(gameStore.endGame).toHaveBeenCalled()
  })

  it('leaderboard button calls "finishGame" method if game is finished', async () => {
    gameStore.gameFinished = true
    const wrapper = mount(SudokuSidebar)
    const leaderboardButton = wrapper.find('.sidebar-leaderboard-button')

    await leaderboardButton.trigger('click')
    expect(gameStore.endGame).toHaveBeenCalled()
    expect(gameStore.changeGameState).toHaveBeenCalledWith(GameState.LEADERBOARD)
  })

  it('checks localStorage for "draftMode" on mount', async () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue('true'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    })
    mount(SudokuSidebar)
    expect(gameStore.changeDraftMode).toHaveBeenCalledWith(true)
  })

  it('pause button is disabled if gameFinished = true', async () => {
    gameStore.gameFinished = true
    const wrapper = mount(SudokuSidebar)
    const pauseButton = wrapper.findAll('.sidebar-actions-item-button')[1]
    expect(pauseButton.classes()).toContain('disabled')
  })
})
