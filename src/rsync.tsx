import { useEffect, useState } from 'react'
import { Action, ActionPanel, List, useNavigation } from '@raycast/api'
import EntryForm from './views/entry-form'
import RsyncEntry, { RsyncEntryRaw } from './models/rsync-entry'
import useEntries from './hooks/use-entries'
import useSystem, { DoExecResult } from './hooks/use-system'
import Result from './views/result'

export type RsyncStorageValues = {
  entries: RsyncEntryRaw[]
}

const Rsync = () => {
  // const [searchText, setSearchText] = useState('');
  // const [filteredList, filterList] = useState(items);
  //
  // useEffect(() => {
  // 	filterList(items.filter((item) => item.includes(searchText)));
  // }, [searchText]);
  const [executing, setExecuting] = useState<boolean>(false)

  const { entries } = useEntries()
  const { push } = useNavigation()
  const { doExec } = useSystem()

  useEffect(
    function () {
      console.log('rsync', entries.length)
    },
    [entries]
  )

  const runEntryCommand = async (entry: RsyncEntry) => {
    setExecuting(true)

    let execResult: DoExecResult
    try {
      execResult = await doExec(entry.getCommand())
    } catch (err: any) {
      execResult = err
    }

    setExecuting(false)
    push(<Result execResult={execResult} />)
  }

  return (
    <List
      isLoading={executing}
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
        {entries?.length
          ? entries.map((entry: RsyncEntry) => (
              <List.Item
                key={entry.id}
                title={entry.name}
                actions={
                  <ActionPanel>
                    <Action title="Run" onAction={() => runEntryCommand(entry)} />
                    <Action.Push title="Edit" target={<EntryForm source={entry} />} />
                  </ActionPanel>
                }
              />
            ))
          : null}
      </List.Section>
    </List>
  )
}

export default Rsync
