import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useApi } from "@/hooks/use-api";
import Loader from "@/components/ui/loader";

const Tasks = () => {
  const { callApi, loading } = useApi<any[]>();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await callApi("/tasks/query", "get", undefined, false);
      if (res) setTasks(res as any[]);
    };
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
      {loading ? (
        <Loader size="large" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks?.length ? (
              tasks.map((t) => (
                <TableRow key={t.taskId ?? t.id}>
                  <TableCell>{t.taskId ?? t.id}</TableCell>
                  <TableCell>{t.planName}</TableCell>
                  <TableCell>
                    {t.status}{" "}
                    {t.status === "Failed" ? `(${t.failDesc})` : null}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6">
                  No tasks found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Tasks;
