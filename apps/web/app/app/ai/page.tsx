import { getWorkspaceContext } from "@/lib/workspace";
import AiChat from "./chat";
export default async function AiPage(){const context=await getWorkspaceContext();if(!context?.activeWorkspace||!context.membership)return null;return <AiChat workspaceId={context.activeWorkspace.id} workspaceName={context.activeWorkspace.name}/>;}
