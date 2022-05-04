import { exec } from 'child_process'

export type DoExecResult = {
  success: boolean
  result: string
}

type UseSystemOutput = {
  doExec: (command: string) => Promise<DoExecResult>
}

const useSystem = (): UseSystemOutput => {
  const doExec = (command: string) => {
    return new Promise<DoExecResult>(resolve => {
      exec(command, (error, stdout) => {
        if (error) {
          resolve({
            success: false,
            result: error.message,
          })
        } else {
          resolve({
            success: true,
            result: stdout,
          })
        }
      })
    })
  }

  return { doExec }
}

export default useSystem
