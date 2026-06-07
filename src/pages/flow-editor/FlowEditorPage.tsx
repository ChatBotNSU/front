import { useParams } from "react-router-dom";

import { useFlow } from "@/entities/flow/api";
import { FlowEditor } from "@/features/flow-editor";
import { Spinner } from "@/shared/ui";

export function FlowEditorPage() {
  const { flowId } = useParams<{ flowId: string }>();
  const { data: flow, isLoading, isError } = useFlow(flowId);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !flow) {
    return (
      <div className="flex h-full items-center justify-center text-red-400">
        Не удалось загрузить флоу.
      </div>
    );
  }

  return <FlowEditor flow={flow} />;
}
