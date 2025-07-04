import DashboardLayout from "@/components/dashboard-layout";
import TasksPage from "@/components/tasks-page";
import ProtectedRoute from "@/components/protected-route";

export default function Tasks() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <TasksPage />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
