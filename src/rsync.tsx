import { Action, ActionPanel, Icon, List } from '@raycast/api'
import EntryForm from './views/entry-form'
import RsyncEntry from './models/rsync-entry'
import useEntries from './hooks/use-entries'
import { useEffect, useState } from 'react'

const Rsync = () => {
  const [entryFilter, setEntryFilter] = useState<string>('')
  const [filteredEntries, setFilteredEntries] = useState<RsyncEntry[]>([])

  const { entries, deleteEntry, runEntry, entryRunning } = useEntries()

  const duplicateEntry = (entry: RsyncEntry) => {
    const clone = entry.clone(true)
    clone.id = undefined
    clone.name = `${clone.name} Duplicate`
    return clone
  }

  const hasErrors = (entry: RsyncEntry): boolean => {
    try {
      entry.getCommand()
      return false
    } catch (err: any) {
      return true
    }
  }

  useEffect(
    function () {
      const filterStr = entryFilter.trim()
      setFilteredEntries(
        entryFilter ? entries.filter(e => e.name.toLowerCase().includes(filterStr)) : entries
      )
    },
    [entries, entryFilter]
  )

  return (
    <List
      isLoading={entryRunning}
      enableFiltering={false}
      onSearchTextChange={setEntryFilter}
      navigationTitle="rsync"
      searchBarPlaceholder=""
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
      <List.Section title="Saved Entries">
        {filteredEntries.map(entry => (
          <List.Item
            key={entry.id}
            title={entry.name}
            accessories={[
              { text: hasErrors(entry) ? '(Contains errors)' : entry.description },
              // { icon: Icon.Terminal },
            ]}
            actions={
              <ActionPanel>
                <Action title="Execute Command" onAction={() => runEntry(entry)} />
                <Action.Push title="Edit" target={<EntryForm source={entry} />} />
                <Action title="Delete" onAction={() => deleteEntry(entry)} />
                <Action.Push
                  title="Duplicate"
                  target={<EntryForm source={duplicateEntry(entry)} />}
                />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  )
}

// noinspection JSUnusedGlobalSymbols
export default Rsync
