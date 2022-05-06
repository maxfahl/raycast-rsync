import create from "zustand"
import Entry from "./models/entry"

interface NavigationStore {
  createdEntry: string | undefined
  setCreatedEntry: (id: string) => void
}

const useNavigationStore = create<NavigationStore>(set => ({
  createdEntry: undefined,
  setCreatedEntry: (id: string) => set({ createdEntry: id }),
}))

interface EntryStore {
  entries: Entry[]
  setEntries: (entries: Entry[]) => void
}

const useEntryStore = create<EntryStore>(set => ({
  entries: [],
  setEntries: (entries: Entry[]) => set({ entries }),
}))

export { useNavigationStore, useEntryStore }
