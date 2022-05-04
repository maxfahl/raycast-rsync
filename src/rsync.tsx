import { Action, ActionPanel, List, Icon } from '@raycast/api'
import EntryForm from './views/entry-form'
import RsyncEntry, { RsyncEntryRaw } from './models/rsync-entry'
import useEntries from './hooks/use-entries'

export type RsyncStorageValues = {
  entries: RsyncEntryRaw[]
}

const Rsync = () => {
  const { entries, addEntry, deleteEntry, runEntry, entryRunning } = useEntries()

  // const getEntryCommand = (entry: RsyncEntry) => {
  //   let command = ''
  //   try {
  //     command = entry.getCommand()
  //   } catch (err: any) {
  //     command = err
  //   }
  //   console.log(command)
  //   return command
  // }

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
        icon={Icon.Plus}
        actions={
          <ActionPanel>
            <Action.Push title="Select" target={<EntryForm />} />
          </ActionPanel>
        }
      />
      <List.Section title="Saved Entries">
        {entries.map(entry => (
          <List.Item
            key={entry.id}
            title={entry.name}
            // icon={Icon.Terminal}
            accessories={[
              // { text: `An Accessory Text`, icon: Icon.Hammer },
              // { text: getEntryCommand(entry) },
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
