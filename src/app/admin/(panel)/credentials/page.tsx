import CredentialsForm from "@/components/admin/CredentialsForm";
import { requireAdminPage } from "@/lib/auth";

export default async function CredentialsPage() {
  const session = await requireAdminPage();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Admin credentials</h1>
      <p className="text-sm text-gray-600">Change the admin username and password at any time.</p>
      <CredentialsForm username={session.username} />
    </div>
  );
}
