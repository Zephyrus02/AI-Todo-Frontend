import DashboardLayout from "@/components/dashboard-layout";
import ContextInput from "@/components/context-input";
import ProtectedRoute from "@/components/protected-route";

export default function ContextPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ContextInput />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
