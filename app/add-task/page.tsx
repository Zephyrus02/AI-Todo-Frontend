import DashboardLayout from "@/components/dashboard-layout";
import AddTaskPage from "@/components/add-task-page";
import ProtectedRoute from "@/components/protected-route";

export default function AddTask() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AddTaskPage />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
