import RsyncEntry, { RsyncEntryRaw } from '../models/rsync-entry'
import { useCallback, useEffect, useState } from 'react'
import { LocalStorage, showToast, Toast, Clipboard, useNavigation } from '@raycast/api'
import useEntryStore from '../store'
import CommandRunner from '../views/command-runner'
import { v4 as uuidv4 } from 'uuid'

type UseEntriesOutput = {
  entries: RsyncEntry[]
  entryRunning: boolean
  addEntry: (entry: RsyncEntry) => void
  updateEntry: (entry: RsyncEntry) => void
  deleteEntry: (entry: RsyncEntry) => void
  runEntry: (entry: RsyncEntry) => void
  copyEntryCommand: (entry: RsyncEntry) => void
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

  const getEntryCommand = async (entry: RsyncEntry) => {
    let command: string | undefined
    try {
      command = entry.getCommand()
    } catch (err: any) {
      await showToast({
        style: Toast.Style.Failure,
        title: 'Command Error',
        message: err,
      })
    }
    return command
  }

  const runEntry = async (entry: RsyncEntry, pushResultView = true) => {
    setEntryRunning(true)
    const command = await getEntryCommand(entry)
    if (command && pushResultView) {
      push(<CommandRunner command={command} />)
    }
    setEntryRunning(false)
  }

  const copyEntryCommand = async (entry: RsyncEntry) => {
    const command = await getEntryCommand(entry)
    if (command) {
      await Clipboard.copy(command)
      await showToast({
        style: Toast.Style.Success,
        title: 'Copied Command to Clipboard',
      })
    }
  }

  return { entries, addEntry, updateEntry, deleteEntry, runEntry, copyEntryCommand, entryRunning }
}

export default useEntries
