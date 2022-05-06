import { Action, ActionPanel, Form, Icon, List } from "@raycast/api"
import EntryForm from "./views/entry-form"
import Entry from "./models/entry"
import useEntries from "./hooks/use-entries"
import { useCallback, useEffect, useState } from "react"
import { useNavigationStore } from "./store"

type EntrySorting = "name" | "runCount" | "createdAt"

export type Preferences = {
  noVerifyCommands: boolean
}

const RsyncCommands = () => {
  const [sortBy, setSortBy] = useState<EntrySorting>()
  const [entryFilter, setEntryFilter] = useState<string>("")
  const [pinnedEntries, setPinnedEntries] = useState<Entry[]>([])
  const [otherEntries, setOtherEntries] = useState<Entry[]>([])
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined)

  const { entries, deleteEntry, updateEntry, runEntry, copyEntryCommand, entryRunning } = useEntries()
  const createdEntry = useNavigationStore(state => state.createdEntry)

  const toggleEntryPin = useCallback(
    async (entry: Entry) => {
      const clone = entry.clone()
      clone.pinned = !entry.pinned
      await updateEntry(clone, false, true)
      setSelectedItemId(clone.id)
    },
    [updateEntry]
  )

  const duplicateEntry = (entry: Entry) => {
    const clone = entry.clone()
    clone.id = undefined
    clone.name = `${clone.name} Duplicate`
    clone.pinned = false
    clone.confirmed = false
    return clone
  }

  const getListItem = useCallback(
    function (entry: Entry) {
      return (
        <List.Item
          id={entry.id}
          key={entry.id}
          title={entry.name}
          accessories={[
            { text: entry.description },
            {
              icon: Icon.LevelMeter,
              tooltip: `Used ${entry.runCount} time${entry.runCount !== 1 ? "s" : ""}`,
            },
          ]}
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

  const sortEntries = (a: Entry, b: Entry, sortBy: EntrySorting) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      default:
        return b[sortBy] - a[sortBy]
    }
  }

  useEffect(
    function () {
      if (!sortBy) return
      const filterStr = entryFilter.trim()
      const filteredAndSortedEntries = (
        entryFilter ? entries.filter(e => e.name.toLowerCase().includes(filterStr)) : entries
      ).sort((a, b) => sortEntries(a, b, sortBy))
      setPinnedEntries(filteredAndSortedEntries.filter(e => e.pinned))
      setOtherEntries(filteredAndSortedEntries.filter(e => !e.pinned))
    },
    [entries, sortBy, entryFilter]
  )

  return (
    <List
      isLoading={entryRunning}
      enableFiltering={false}
      onSearchTextChange={setEntryFilter}
      navigationTitle="Rsync Commands"
      searchBarPlaceholder=""
      selectedItemId={selectedItemId}
      searchBarAccessory={
        <List.Dropdown
          id="sortOrder"
          storeValue={true}
          onChange={value => setSortBy(value as EntrySorting)}
          tooltip="Sort the list by property"
          defaultValue="name"
        >
          <List.Dropdown.Item key="sortName" title="Name" value="name" />
          <List.Dropdown.Item key="sortRunCount" title="Use Count" value="runCount" />
          <List.Dropdown.Item key="sortHostName" title="Created At" value="createdAt" />
        </List.Dropdown>
      }
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
