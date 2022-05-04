import { Action, ActionPanel, List, useNavigation } from '@raycast/api'
import EntryForm from './views/entry-form'
import RsyncEntry, { RsyncEntryRaw } from './models/rsync-entry'
import useEntries from './hooks/use-entries'

export type RsyncStorageValues = {
  entries: RsyncEntryRaw[]
}

const Rsync = () => {
  const { entries, runEntry, entryRunning } = useEntries()

  return (
    <List
      isLoading={entryRunning}
      enableFiltering={false}
      // onSearchTextChange={ setSearchText }
      navigationTitle="rsync"
      searchBarPlaceholder=""
    >
      <List.Item
        title="Create new entry..."
        actions={
          <ActionPanel>
            <Action.Push title="Select" target={<EntryForm />} />
          </ActionPanel>
        }
      />
      <List.Section title="Saved entries">
        {entries.map(entry => (
          <List.Item
            key={entry.id}
            title={entry.name}
            actions={
              <ActionPanel>
                <Action title="Execute Command" onAction={() => runEntry(entry)} />
                <Action.Push title="Edit Entry" target={<EntryForm source={entry} />} />
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
