import { FC, useEffect, useState } from 'react'
import { Action, ActionPanel, Detail, useNavigation } from '@raycast/api'
import useSystem from '../hooks/use-system'

type ResultProps = {
  command: string
}

const CommandRunner: FC<ResultProps> = ({ command }) => {
  const [retryCount, setRetryCount] = useState<number>(1)
  const [processOut, setProcessOut] = useState<string>('')
  const [processExit, setProcessExit] = useState<number | undefined>()

  const { pop } = useNavigation()
  const { exec } = useSystem()

  useEffect(
    function () {
      if (retryCount > 1) console.log('***Retrying***')
      setProcessOut(retryCount > 1 ? '***Retrying...***\n' : '')

      const process = exec(command)

      process.stdout?.on('data', data => {
        setProcessOut(prev => `${prev}\n${data}`)
      })

      process.stderr?.on('data', data => {
        setProcessOut(prev => `${prev}\n${data}`)
      })

      process.on('exit', (code, signal) => {
        console.log('Process exited with code:', code, 'and signal:', signal)
        setProcessExit(code as number)
      })
    },
    [command, exec, retryCount]
  )

  const retry = () => {
    setRetryCount(prev => prev + 1)
  }

  let md = processOut
  if (processExit !== undefined) {
    md += `\n${processExit === 0 ? '***Operation completed***' : '**Operation failed**'}`
  }

  const commandFailed = processExit !== undefined && processExit !== 0
  return (
    <Detail
      isLoading={processExit === undefined}
      markdown={md}
      actions={
        <ActionPanel>
          {commandFailed ? (
            <Action title="Retry" onAction={() => retry()} />
          ) : (
            <Action title="Done" onAction={() => pop()} />
          )}
        </ActionPanel>
      }
    />
  )
}

export default CommandRunner
