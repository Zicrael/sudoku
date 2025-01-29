export interface IGameSettings {
  difficulty: number
  background: number
}
export interface IGameProgress {
  elapsedTime: number
  score: number
}

export interface IGameHints {
  max: number
  used: number
}
export interface ILeaderboardRecord {
  name: string
  value: number
}
export interface GameStoreState {
  gameState: number
  gameSettings: IGameSettings
  leaderboard: ILeaderboardRecord[][]
  gameProgress: IGameProgress
  table: ITableCell[]
  selectedCell: number | null
  draftMode: boolean
  hints: IGameHints
  remainNumberCounter: number[]
  gameFinished: boolean
}
export interface ITableCell {
  x: number
  y: number
  tile: number
  draft: number
  solution: number
  value: number
  highlight: boolean
  error: boolean
  editable: boolean
  resolved: boolean
  resolvedByPlayer: boolean
}
