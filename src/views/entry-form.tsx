import { Action, ActionPanel, Form, useNavigation } from "@raycast/api"
import { FC, Fragment, useCallback, useEffect, useState } from "react"
import RsyncEntry, { RsyncOption } from "../models/rsync-entry"
import rsyncOptions, { RsyncDataOption } from "../data/rsync-options"
import Sugar from "sugar"
import useEntries from "../hooks/use-entries"

type EntryFormProps = {
  source?: RsyncEntry
}

const EntryForm: FC<EntryFormProps> = ({ source }) => {
  const [entry, setEntry] = useState<RsyncEntry>(source || new RsyncEntry())
  const [optionFilter, setOptionFilter] = useState<string>("")
  const [visibleOptions, setVisibleOptions] = useState<RsyncDataOption[]>([])

  const { pop } = useNavigation()
  const { addEntry, updateEntry, deleteEntry, runEntry, copyEntryCommand, entryRunning } = useEntries()

  const isUpdating = source && source.id

  const saveEntry = async () => {
    let success: boolean
    if (isUpdating) {
      success = await updateEntry(entry)
    } else {
      success = await addEntry(entry)
    }
    if (success) pop()
  }

  const removeEntry = () => {
    deleteEntry(entry)
    pop()
  }

  const setValue = (propPath: string, value: boolean | string | RsyncOption) => {
    setEntry(prev => Sugar.Object.set(prev.clone(), propPath, value) as RsyncEntry)
  }

  const getValue = useCallback(
    (propPath: string): string => {
      return Sugar.Object.get<string>(entry, propPath)
    },
    [entry]
  )

  const getOptionFields = useCallback(
    (option: RsyncDataOption) => {
      const entryOption: RsyncOption | undefined = entry.options[option.name]

      return (
        <Fragment key={`option-${option.name}`}>
          <Form.Checkbox
            id={`option-${option.name}-enabled`}
            label={`--${option.name}`}
            defaultValue={entry.options[option.name]?.enabled}
            info={option.description}
            onChange={(enable: boolean) => {
              const exists = !!entryOption
              const enabled = entryOption?.enabled
              const hadValue = entryOption?.value

              if (enable || (!enable && enabled !== undefined)) {
                if (!enable && !hadValue) {
                  setEntry(prev => {
                    delete prev.options[option.name]
                    return prev.clone()
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

          {option.param && entryOption?.enabled && (
            <Form.TextField
              id={`option-${option.name}-value`}
              placeholder={option.param}
              defaultValue={entry.options[option.name]?.value ?? ""}
              onChange={setValue.bind(this, `options[${option.name}].value`)}
            />
          )}
        </Fragment>
      )
    },
    [entry.options]
  )

  const getSshFields = useCallback(
    (location: "source" | "destination") => {
      // console.log(`${location} ${entry.sshSelection === location ? 'true' : 'false'}`)

      return entry.sshSelection === location ? (
        <Fragment key={`location-fields-${location}`}>
          <Form.TextField
            id={`${location}Username`}
            title="Username"
            placeholder="admin"
            defaultValue={getValue(`${location}.userName`)}
            onChange={setValue.bind(this, `${location}.userName`)}
          />
          <Form.TextField
            id={`${location}Hostname`}
            title="Hostname"
            placeholder="site.dev"
            defaultValue={getValue(`${location}.hostName`)}
            onChange={setValue.bind(this, `${location}.hostName`)}
          />
          <Form.TextField
            id={`${location}Port`}
            placeholder="22"
            title="Port"
            defaultValue={getValue(`${location}.port`)}
            onChange={setValue.bind(this, `${location}.port`)}
          />
        </Fragment>
      ) : null
    },
    [getValue, entry]
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

  const cta = isUpdating ? "Update" : "Create"
  return (
    <Form
      isLoading={entryRunning}
      navigationTitle={cta}
      actions={
        <ActionPanel>
          <Action.SubmitForm title={cta} onSubmit={saveEntry} />
          <Action title={"Run"} onAction={() => runEntry(entry)} />
          <Action
            title="Copy to Clipboard"
            shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
            onAction={() => copyEntryCommand(entry)}
          />
          {source && (
            <Action
              title={"Delete"}
              shortcut={{ modifiers: ["cmd", "shift"], key: "backspace" }}
              onAction={() => removeEntry()}
            />
          )}
        </ActionPanel>
      }
    >
      <Form.Description text="General" />

      <Form.TextField
        id="name"
        title="Name*"
        placeholder="Website Backup, Sync Photo Collection..."
        autoFocus={false}
        defaultValue={getValue("name")}
        onChange={setValue.bind(this, "name")}
      />
      <Form.TextArea
        id="description"
        title="Description"
        placeholder="Describe the command to more easily remember it at a glance..."
        defaultValue={getValue("description")}
        onChange={setValue.bind(this, "description")}
      />

      <Form.Dropdown
        id="sshSelection"
        title="SSH"
        info="Specify if the source or destination will be using SSH."
        defaultValue={getValue("sshSelection")}
        onChange={setValue.bind(this, "sshSelection")}
      >
        <Form.Dropdown.Item value="none" title="None" />
        <Form.Dropdown.Item value="source" title="Source" />
        <Form.Dropdown.Item value="destination" title="Destination" />
      </Form.Dropdown>

      <Form.Separator />
      <Form.Description text="Source" />

      {getSshFields("source")}
      <Form.TextField
        id="sourcePath"
        title="Path*"
        placeholder={"/path/to/source/file/or/folder"}
        defaultValue={getValue("source.path")}
        onChange={setValue.bind(this, "source.path")}
      />

      <Form.Separator />
      <Form.Description text="Destination" />

      {getSshFields("destination")}
      <Form.TextField
        id="destinationPath"
        title="Path*"
        placeholder={"/path/to/destination/file/or/folder"}
        defaultValue={getValue("destination.path")}
        onChange={setValue.bind(this, "destination.path")}
      />

      <Form.Separator />
      <Form.Description text="Options" />

      <Form.TextField
        id="optionsFilter"
        title="Filter"
        info="Filter the list to find a specific option."
        onChange={setOptionFilter}
      />
      {visibleOptions.map(getOptionFields)}
    </Form>
  )
}

export default EntryForm
