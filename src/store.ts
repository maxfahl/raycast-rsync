import create from 'zustand'
import RsyncEntry from './models/rsync-entry'

interface EntryStore {
  storeInitiated: boolean
  entries: RsyncEntry[]
  setEntries: (entries: RsyncEntry[]) => void
}

const useEntryStore = create<EntryStore>(set => ({
  storeInitiated: false,
  entries: [],
  setEntries: (entries: RsyncEntry[]) => set({ entries, storeInitiated: true }),
}))

export default useEntryStore
