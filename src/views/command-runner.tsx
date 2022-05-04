import { FC, useEffect, useState } from 'react'
import { Detail } from '@raycast/api'
import useSystem, { DoExecResult } from '../hooks/use-system'

type ResultProps = {
  command: string
}

const CommandRunner: FC<ResultProps> = ({ command }) => {
  const [processOut, setProcessOut] = useState<string>('')
  const [processExit, setProcessExit] = useState<number | undefined>()

  const { exec } = useSystem()

  useEffect(
    function () {
      console.log('Running command:', command)

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
    [command, exec]
  )

  let md = processOut
  if (processExit !== undefined) {
    md += `\n${processExit === 0 ? '***Operation completed***' : '***Operation failed***'}`
  }

  return <Detail isLoading={processExit === undefined} markdown={md} />
}

export default CommandRunner
