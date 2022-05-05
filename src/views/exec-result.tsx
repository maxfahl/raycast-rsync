import { FC } from "react"
import { Detail } from "@raycast/api"
import { DoExecResult } from "../hooks/use-system"

type ResultProps = {
  execResult: DoExecResult
}

const ExecResult: FC<ResultProps> = ({ execResult }) => {
  const md = `***${execResult.success ? "Success" : "Error"}***

  ${execResult.result}
  `
  return <Detail markdown={md} />

  // return (
  //   <Detail
  //     markdown={result.stdout}
  //     navigationTitle="Pikachu"
  //     metadata={
  //       <Detail.Metadata>
  //         <Detail.Metadata.Label title="Height" text={`1' 04"`} />
  //         <Detail.Metadata.Separator />
  //         <Detail.Metadata.Label title="Weight" text="13.2 lbs" />
  //       </Detail.Metadata>
  //     }
  //   />
  // )
}

export default ExecResult
