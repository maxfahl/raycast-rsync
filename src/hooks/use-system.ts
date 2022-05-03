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
    return new Promise<DoExecResult>((resolve, reject) => {
      exec(command, (error, stdout) => {
        if (error) {
          reject({
            success: false,
            result: error,
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
