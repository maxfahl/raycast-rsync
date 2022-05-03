import RsyncEntry, { RsyncEntryRaw } from '../models/rsync-entry'
import { useCallback, useEffect, useState } from 'react'
import { LocalStorage } from '@raycast/api'
import useEntryStore from '../store'

type UseEntriesOutput = {
  entries: RsyncEntry[]
  addEntry: (entry: RsyncEntry) => void
  updateEntry: (entry: RsyncEntry) => void
  deleteEntry: (entry: RsyncEntry) => void
}

const useEntries = (): UseEntriesOutput => {
  const [storeInitiated, entries, setEntries] = useEntryStore(state => [
    state.storeInitiated,
    state.entries,
    state.setEntries,
  ])
  // const storeInitiated = useEntriesStore(state => state.storeInitiated)
  // const entries = useEntriesStore(state => state.entries)
  // const setEntries = useEntriesStore(state => state.setEntries)

  useEffect(
    function () {
      console.log('useEntries', entries.length)
    },
    [entries]
  )

  const storeEntries = (entries: RsyncEntry[]) => {
    LocalStorage.setItem('entries', JSON.stringify(entries.map(e => e.toRawData())))
  }

  const updateEntries = useCallback(
    (entries: RsyncEntry[]) => {
      setEntries(entries)
      storeEntries(entries)
    },
    [setEntries]
  )

  useEffect(
    function () {
      const loadEntries = async () => {
        const entries = await LocalStorage.getItem<string>('entries')
        const rsyncEntries = entries
          ? JSON.parse(entries).map((e: RsyncEntryRaw) => new RsyncEntry(e))
          : []
        console.log('loadEntries', rsyncEntries.length)
        setEntries(rsyncEntries)
      }

      if (!storeInitiated) loadEntries()
    },
    [storeInitiated, setEntries]
  )

  const addEntry = (entry: RsyncEntry) => {
    const newEntries: RsyncEntry[] = [...entries, entry]
    updateEntries(newEntries)
  }

  const updateEntry = (entry: RsyncEntry) => {
    const prevEntryIndex = entries.findIndex(e => e.id === entry.id)
    if (prevEntryIndex === -1) throw 'Could not find entry to update'
    const newEntries = [...entries]
    newEntries.splice(prevEntryIndex, prevEntryIndex + 1, entry)
    updateEntries(newEntries)
  }

  const deleteEntry = (entry: RsyncEntry) => {
    const prevEntryIndex = entries.findIndex(e => e.id === entry.id)
    if (prevEntryIndex === -1) throw 'Could not find entry to update'
    const newEntries = [...entries]
    newEntries.splice(prevEntryIndex, prevEntryIndex + 1)
    updateEntries(newEntries)
  }

  return { entries, addEntry, updateEntry, deleteEntry }
}

export default useEntries
