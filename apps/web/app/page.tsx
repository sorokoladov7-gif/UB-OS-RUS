import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/workspace";

export default async function HomePage() {
  const context = await getWorkspaceContext();

  if (!context) {
    return (
      <main style={{ maxWidth: 760, margin: "0 auto", padding: 40, fontFamily: "system-ui" }}>
        <h1>UB OS-RUS</h1>
        <p>Universal Business Operating System</p>
        <p>Войдите в систему или создайте организацию, чтобы начать работу.</p>
      </main>
    );
  }

  redirect("/app");
}
