import create from 'zustand'
import RsyncEntry from './models/rsync-entry'

interface NavigationStore {
  createdEntry: string | undefined
  setCreatedEntry: (id: string) => void
}

const useNavigationStore = create<NavigationStore>(set => ({
  createdEntry: undefined,
  setCreatedEntry: (id: string) => set({ createdEntry: id }),
}))

interface EntryStore {
  entries: RsyncEntry[]
  setEntries: (entries: RsyncEntry[]) => void
}

const useEntryStore = create<EntryStore>(set => ({
  entries: [],
  setEntries: (entries: RsyncEntry[]) => set({ entries }),
}))

export { useNavigationStore, useEntryStore }
