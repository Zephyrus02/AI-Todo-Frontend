import DashboardLayout from "@/components/dashboard-layout";
import TaskDashboard from "@/components/task-dashboard";

export default function Home() {
  return (
    <DashboardLayout>
      <TaskDashboard />
    </DashboardLayout>
  );
}
