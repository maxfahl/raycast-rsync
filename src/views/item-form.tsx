import { Action, ActionPanel, Form, List } from '@raycast/api'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import RsyncEntry, { RsyncOption, SshSelection } from '../models/rsync-entry'
import rsyncOptions, { RsyncDataOption } from '../data/rsync-options'
import Sugar from 'sugar'

type ItemFormProps = {
  source?: RsyncEntry
}

const ItemForm: FC<ItemFormProps> = ({ source }) => {
  const [item, setItem] = useState<RsyncEntry>(source || new RsyncEntry())
  const [optionFilter, setOptionFilter] = useState<string>('')
  const [visibleOptions, setVisibleOptions] = useState<RsyncDataOption[]>(rsyncOptions)

  const setValue = (propPath: string, value: string | boolean) => {
    setItem(prev => Sugar.Object.set(prev.clone(), propPath, value) as RsyncEntry)
  }

  const getDefaultValue = useCallback(
    (propPath: string): string => {
      return Sugar.Object.get<string>(item, propPath)
    },
    [item]
  )

  const getOptionFields = useCallback(
    (option: RsyncDataOption) => {
      return (
        <>
          <Form.Checkbox
            key={`option-${option.name}-enabled`}
            id={`option-${option.name}-enabled`}
            label={option.name}
            defaultValue={item.options[option.name]?.enabled}
            onChange={(value: boolean) => {
              const prevValue = item.options[option.name]?.enabled
              if (value || (!value && prevValue !== undefined)) {
                setValue(`options[${option.name}].enabled`, value)
              }
            }}
          />
          {option.enabled && (
            <Form.TextField
              id={`option-${option.name}-value`}
              key={`option-${option.name}-value`}
              title="Parameter"
              placeholder={item.options[option.name].param}
              defaultValue={item.options[option.name].value}
              onChange={setValue.bind(this, `option[${option.name}].value`)}
            />
          )}
        </>
      )
    },
    [item]
  )

  const getLocationFields = useCallback(
    (location: 'source' | 'destination') => {
      return (
        <>
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
        </>
      )
    },
    [getDefaultValue]
  )

  useEffect(
    function () {
      console.log(JSON.stringify(item.toRawData()))
    },
    [item]
  )

  useEffect(
    function () {
      const filterString = optionFilter.toLowerCase()
      if (optionFilter) {
        setVisibleOptions(
          rsyncOptions.filter(
            rso => rso.name.toLowerCase().includes(filterString)
            // ||
            // rso.description?.toLowerCase().includes(filterString)
          )
        )
      } else {
        setVisibleOptions(rsyncOptions)
      }
    },
    [optionFilter]
  )

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title={source ? 'Update entry' : 'Create entry'}
            onSubmit={values => console.log(values)}
          />
          <Action
            title={'Run'}
            onAction={() => {
              console.log('run')
            }}
          />
        </ActionPanel>
      }
    >
      <Form.Description text="General" />
      <Form.TextField
        id="name"
        title="Name"
        placeholder={'Website backup, photo collection, remote notes...'}
        autoFocus={true}
        defaultValue={getDefaultValue('name')}
        onChange={setValue.bind(this, 'name')}
      />
      <Form.TextArea
        id="description"
        title="Description"
        defaultValue={getDefaultValue('description')}
      />

      <Form.Dropdown
        id="sshSelection"
        title="SSH"
        defaultValue={getDefaultValue('sshSelection')}
        onChange={setValue.bind(this, 'sshSelection')}
      >
        <Form.Dropdown.Item value="none" title="None" />
        <Form.Dropdown.Item value="source" title="For Source" />
        <Form.Dropdown.Item value="destination" title="For Destination" />
      </Form.Dropdown>

      <Form.Separator />
      <Form.Description text="Source" />
      {item.sshSelection === 'source' && getLocationFields('source')}
      <Form.TextField
        id="sourcePath"
        title="Path"
        placeholder={'/path/to/source/file/or/folder'}
        defaultValue={getDefaultValue('source.path')}
        onChange={setValue.bind(this, 'source.path')}
      />

      <Form.Separator />
      <Form.Description text="Destination" />
      {item.sshSelection === 'destination' && getLocationFields('destination')}
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

export default ItemForm
