import RsyncEntry, { RsyncEntryRaw } from '../models/rsync-entry'
import { useCallback, useEffect, useState } from 'react'
import {
  LocalStorage,
  showToast,
  Toast,
  Clipboard,
  useNavigation,
  confirmAlert,
  Alert,
} from '@raycast/api'
import { useEntryStore, useNavigationStore } from '../store'
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
  const [entryRunning, setEntryRunning] = useState<boolean>(false) // If a rsync command is running

  const { push } = useNavigation()
  const [entries, setEntries] = useEntryStore(state => [state.entries, state.setEntries])
  const setCreatedEntry = useNavigationStore(state => state.setCreatedEntry)

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

  const addEntry = async (entry: RsyncEntry) => {
    entry.id = uuidv4()
    const newEntries: RsyncEntry[] = [...entries, entry]
    updateEntries(newEntries)
    setCreatedEntry(entry.id)
    await showToast({
      style: Toast.Style.Success,
      title: 'Entry created',
    })
  }

  const updateEntry = async (entry: RsyncEntry) => {
    const prevEntryIndex = entries.findIndex(e => e.id === entry.id)
    if (prevEntryIndex === -1) throw 'Could not find entry to update'
    const newEntries = [...entries]
    entry.confirmed = false
    newEntries.splice(prevEntryIndex, 1, entry)
    updateEntries(newEntries)
    await showToast({
      style: Toast.Style.Success,
      title: 'Entry updated',
    })
  }

  const deleteEntry = async (entry: RsyncEntry) => {
    const prevEntryIndex = entries.findIndex(e => e.id === entry.id)
    if (prevEntryIndex === -1) throw 'Could not find entry to update'
    const newEntries = [...entries]
    newEntries.splice(prevEntryIndex, 1)
    updateEntries(newEntries)
    await showToast({
      style: Toast.Style.Success,
      title: 'Entry deleted',
    })
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
    if (!entry.confirmed) {
      const confirmResponse = await confirmAlert({
        title: 'Are you sure about this?',
        message: `Rsync can be a destructive command. You have to confirm a command before running it the first time you run it after creation and after each update.`,
        primaryAction: {
          title: 'Execute',
          style: Alert.ActionStyle.Destructive,
        },
      })
      if (!confirmResponse) {
        return
      }
    }

    entry.confirmed = true
    updateEntry(entry)

    const command = await getEntryCommand(entry)
    setEntryRunning(true)
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
