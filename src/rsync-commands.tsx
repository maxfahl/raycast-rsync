import { Action, ActionPanel, Icon, List } from "@raycast/api"
import EntryForm from "./views/entry-form"
import RsyncEntry from "./models/rsync-entry"
import useEntries from "./hooks/use-entries"
import { useCallback, useEffect, useState } from "react"
import { useNavigationStore } from "./store"

export type Preferences = {
  noVerifyCommands: boolean
}

const RsyncCommands = () => {
  const [entryFilter, setEntryFilter] = useState<string>("")
  const [pinnedEntries, setPinnedEntries] = useState<RsyncEntry[]>([])
  const [otherEntries, setOtherEntries] = useState<RsyncEntry[]>([])
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined)

  const { entries, deleteEntry, updateEntry, runEntry, copyEntryCommand, entryRunning } = useEntries()
  const createdEntry = useNavigationStore(state => state.createdEntry)

  const toggleEntryPin = useCallback(
    async (entry: RsyncEntry) => {
      const clone = entry.clone()
      clone.pinned = !entry.pinned
      await updateEntry(clone, false, true)
      setSelectedItemId(clone.id)
    },
    [updateEntry]
  )

  const duplicateEntry = (entry: RsyncEntry) => {
    const clone = entry.clone()
    clone.id = undefined
    clone.name = `${clone.name} Duplicate`
    clone.pinned = false
    clone.confirmed = false
    return clone
  }

  const getListItem = useCallback(
    function (entry: RsyncEntry) {
      return (
        <List.Item
          id={entry.id}
          key={entry.id}
          title={entry.name}
          accessories={[{ text: entry.description }, { icon: Icon.Terminal }]}
          actions={
            <ActionPanel>
              <Action title="Run" onAction={() => runEntry(entry)} />
              <Action.Push title="Edit" target={<EntryForm source={entry} />} />
              <Action
                title="Delete"
                shortcut={{ modifiers: ["cmd", "shift"], key: "backspace" }}
                onAction={() => deleteEntry(entry)}
              />
              <Action.Push
                title="Duplicate"
                shortcut={{ modifiers: ["cmd", "shift"], key: "d" }}
                target={<EntryForm source={duplicateEntry(entry)} />}
              />
              <Action
                title="Copy to Clipboard"
                shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                onAction={() => copyEntryCommand(entry)}
              />
              <Action
                title={entry.pinned ? "Unpin" : "Pin"}
                shortcut={{ modifiers: ["cmd", "shift"], key: "p" }}
                onAction={() => toggleEntryPin(entry)}
              />
            </ActionPanel>
          }
        />
      )
    },
    [copyEntryCommand, deleteEntry, toggleEntryPin, runEntry]
  )

  useEffect(
    function () {
      if (createdEntry) setSelectedItemId(createdEntry)
    },
    [createdEntry]
  )

  useEffect(
    function () {
      const filterStr = entryFilter.trim()
      const filteredAndSortedEntries = (
        entryFilter ? entries.filter(e => e.name.toLowerCase().includes(filterStr)) : entries
      ).sort((a, b) => a.name.localeCompare(b.name))
      setPinnedEntries(filteredAndSortedEntries.filter(e => e.pinned))
      setOtherEntries(filteredAndSortedEntries.filter(e => !e.pinned))
    },
    [entries, entryFilter]
  )

  return (
    <List
      isLoading={entryRunning}
      enableFiltering={false}
      onSearchTextChange={setEntryFilter}
      navigationTitle="Rsync Commands"
      searchBarPlaceholder=""
      selectedItemId={selectedItemId}
    >
      <List.Item
        title="Create new entry..."
        icon={Icon.Plus}
        actions={
          <ActionPanel>
            <Action.Push title="Select" target={<EntryForm />} />
          </ActionPanel>
        }
      />
      <List.Section title="Pinned Entries">{pinnedEntries.map(getListItem)}</List.Section>
      <List.Section title="Entries">{otherEntries.map(getListItem)}</List.Section>
    </List>
  )
}

// noinspection JSUnusedGlobalSymbols
export default RsyncCommands
