export interface Word {
  id: number
  word: string
  type: 'n.' | 'v.' | 'adj.' | 'adv.' | 'pron.' | 'conj.' | 'interj.' | 'prep.' | 'aux.' | 'num.' | 'part.'
  meaning: string
  example: string
}

export enum LoadingStatus {
  Loading,
  Loaded,
  Error
}

export enum ValidType {
  Valid,
  UnknownType,
  IllegalSuffix,
  UnknownSuffix
}
