import { Action, ActionPanel, Form, useNavigation } from '@raycast/api'
import { FC, Fragment, useCallback, useEffect, useState } from 'react'
import RsyncEntry, { RsyncOption } from '../models/rsync-entry'
import rsyncOptions, { RsyncDataOption } from '../data/rsync-options'
import Sugar from 'sugar'
import useEntries from '../hooks/use-entries'

type EntryFormProps = {
  source?: RsyncEntry
}

const EntryForm: FC<EntryFormProps> = ({ source }) => {
  const [entry, setEntry] = useState<RsyncEntry>(source || new RsyncEntry())
  const [optionFilter, setOptionFilter] = useState<string>('')
  const [visibleOptions, setVisibleOptions] = useState<RsyncDataOption[]>([])
  // const [command, setCommand] = useState<string>('')
  // const [error, setError] = useState<string>('')

  const { pop } = useNavigation()
  const { addEntry, updateEntry, deleteEntry } = useEntries()
  const { runEntry, entryRunning } = useEntries()

  const update = source && source.id

  const saveEntry = async () => {
    if (update) {
      await updateEntry(entry)
    } else {
      await addEntry(entry)
    }
    pop()
  }

  const removeEntry = () => {
    deleteEntry(entry)
    pop()
  }

  const setValue = (propPath: string, value: boolean | string | RsyncOption) => {
    setEntry(prev => Sugar.Object.set(prev.clone(), propPath, value) as RsyncEntry)
  }

  const getDefaultValue = useCallback(
    (propPath: string): string => {
      return Sugar.Object.get<string>(entry, propPath)
    },
    [entry]
  )

  const getOptionFields = useCallback(
    (option: RsyncDataOption) => {
      const myEntry = entry.options[option.name]

      return (
        <Fragment key={`option-${option.name}`}>
          <Form.Checkbox
            id={`option-${option.name}-enabled`}
            label={`--${option.name}`}
            defaultValue={entry.options[option.name]?.enabled}
            info={option.description}
            onChange={(enable: boolean) => {
              const exists = !!myEntry
              const enabled = myEntry?.enabled
              const hadValue = myEntry?.value

              if (enable || (!enable && enabled !== undefined)) {
                if (!enable && !hadValue) {
                  setEntry(prev => {
                    delete prev.options[option.name]
                    return prev
                  })
                } else if (!!enabled !== enable) {
                  setValue(`options[${option.name}]`, {
                    ...(exists ? entry.options[option.name] : option),
                    enabled: enable,
                  })
                }
              }
            }}
          />

          {/*{myEntry?.enabled && myEntry?.param && (*/}
          {!!option.param && (
            <Form.TextField
              id={`option-${option.name}-value`}
              placeholder={option.param}
              defaultValue={entry.options[option.name]?.value ?? ''}
              onChange={setValue.bind(this, `options[${option.name}].value`)}
            />
          )}
        </Fragment>
      )
    },
    [entry.options]
  )

  const getSshFields = useCallback(
    (location: 'source' | 'destination') => {
      return entry.sshSelection === location ? (
        <Fragment key={`location-fields-${location}`}>
          <Form.TextField
            id={`${location}Username`}
            title="Username"
            defaultValue={getDefaultValue(`${location}.userName`)}
            onChange={setValue.bind(this, `${location}.userName`)}
          />
          <Form.TextField
            id={`${location}Hostname`}
            title="Hostname"
            defaultValue={getDefaultValue(`${location}.hostName`)}
            onChange={setValue.bind(this, `${location}.hostName`)}
          />
          <Form.TextField
            id={`${location}Port`}
            title="Port"
            defaultValue={getDefaultValue(`${location}.port`)}
            onChange={setValue.bind(this, `${location}.port`)}
          />
        </Fragment>
      ) : null
    },
    [getDefaultValue, entry.sshSelection]
  )

  useEffect(
    function () {
      const filterString = optionFilter.toLowerCase()
      if (optionFilter) {
        setVisibleOptions(rsyncOptions.filter(rso => rso.name.toLowerCase().includes(filterString)))
      } else {
        setVisibleOptions(rsyncOptions)
      }
    },
    [optionFilter]
  )

  const cta = update ? 'Update Entry' : 'Create Entry'
  return (
    <Form
      isLoading={entryRunning}
      navigationTitle={cta}
      actions={
        <ActionPanel>
          <Action.SubmitForm title={cta} onSubmit={saveEntry} />
          <Action title={'Execute Command'} onAction={() => runEntry(entry)} />
          {source && <Action title={'Delete'} onAction={() => removeEntry()} />}
        </ActionPanel>
      }
    >
      <Form.Description text="General" />

      <Form.TextField
        id="name"
        title="Name"
        placeholder={'Website backup, photo collection, remote notes...'}
        autoFocus={false}
        defaultValue={getDefaultValue('name')}
        onChange={setValue.bind(this, 'name')}
      />
      <Form.TextArea
        id="description"
        title="Description"
        defaultValue={getDefaultValue('description')}
        onChange={setValue.bind(this, 'description')}
      />

      <Form.Dropdown
        id="sshSelection"
        title="SSH"
        defaultValue={getDefaultValue('sshSelection')}
        onChange={setValue.bind(this, 'sshSelection')}
      >
        <Form.Dropdown.Item value="none" title="None" />
        <Form.Dropdown.Item value="source" title="Source" />
        <Form.Dropdown.Item value="destination" title="Destination" />
      </Form.Dropdown>

      <Form.Separator />
      <Form.Description text="Source" />

      {getSshFields('source')}
      <Form.TextField
        id="sourcePath"
        title="Path"
        placeholder={'/path/to/source/file/or/folder'}
        defaultValue={getDefaultValue('source.path')}
        onChange={setValue.bind(this, 'source.path')}
      />

      <Form.Separator />
      <Form.Description text="Destination" />

      {getSshFields('destination')}
      <Form.TextField
        id="destinationPath"
        title="Path"
        placeholder={'/path/to/destination/file/or/folder'}
        defaultValue={getDefaultValue('destination.path')}
        onChange={setValue.bind(this, 'destination.path')}
      />

      <Form.Separator />
      <Form.Description text="Options" />

      <Form.TextField id="optionsFilter" title="Filter" onChange={setOptionFilter} />
      {visibleOptions.map(getOptionFields)}
    </Form>
  )
}

export default EntryForm
