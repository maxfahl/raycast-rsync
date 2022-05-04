import RsyncEntry, { RsyncEntryRaw } from '../models/rsync-entry'
import { useCallback, useEffect, useState } from 'react'
import { LocalStorage, useNavigation } from '@raycast/api'
import useEntryStore from '../store'
import useSystem, { DoExecResult } from './use-system'
import ExecResult from '../views/exec-result'
import { showToast, Toast } from '@raycast/api'
import CommandRunner from '../views/command-runner'
import { v4 as uuidv4 } from 'uuid'

type UseEntriesOutput = {
  entries: RsyncEntry[]
  entryRunning: boolean
  addEntry: (entry: RsyncEntry) => void
  updateEntry: (entry: RsyncEntry) => void
  deleteEntry: (entry: RsyncEntry) => void
  runEntry: (entry: RsyncEntry) => void
}

const useEntries = (): UseEntriesOutput => {
  const [entries, setEntries] = useEntryStore(state => [state.entries, state.setEntries])
  const [entryRunning, setEntryRunning] = useState<boolean>(false) // If a rsync command is running

  const { push } = useNavigation()

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
        setEntries(rsyncEntries)
      }

      loadEntries()
    },
    [setEntries]
  )

  const addEntry = (entry: RsyncEntry) => {
    entry.id = uuidv4()
    const newEntries: RsyncEntry[] = [...entries, entry]
    updateEntries(newEntries)
  }

  const updateEntry = (entry: RsyncEntry) => {
    const prevEntryIndex = entries.findIndex(e => e.id === entry.id)
    if (prevEntryIndex === -1) throw 'Could not find entry to update'
    const newEntries = [...entries]
    newEntries.splice(prevEntryIndex, 1, entry)
    updateEntries(newEntries)
  }

  const deleteEntry = (entry: RsyncEntry) => {
    const prevEntryIndex = entries.findIndex(e => e.id === entry.id)
    if (prevEntryIndex === -1) throw 'Could not find entry to update'
    const newEntries = [...entries]
    newEntries.splice(prevEntryIndex, 1)
    updateEntries(newEntries)
  }

  const runEntry = async (entry: RsyncEntry, pushResultView = true) => {
    setEntryRunning(true)

    try {
      const command = entry.getCommand()
      // execResult = await execSync(command)
      if (pushResultView) {
        push(<CommandRunner command={command} />)
      }
    } catch (err: any) {
      await showToast({
        style: Toast.Style.Failure,
        title: 'Command Error',
        message: err,
      })
    }

    setEntryRunning(false)
  }

  return { entries, addEntry, updateEntry, deleteEntry, runEntry, entryRunning }
}

export default useEntries
