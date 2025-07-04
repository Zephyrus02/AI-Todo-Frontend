import DashboardLayout from "@/components/dashboard-layout";
import AddTaskPage from "@/components/add-task-page";
import ProtectedRoute from "@/components/protected-route";

export default function EditTask({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AddTaskPage taskId={params.id} />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
