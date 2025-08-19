import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getISOWeek, getYear } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TaskManager() {
  const [weeks, setWeeks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);

  const [selectedWeek, setSelectedWeek] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTaskType, setSelectedTaskType] = useState("");

  const [tasks, setTasks] = useState([]);
  const [currentWeek, setCurrentWeek] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?._id;
  const token = localStorage.getItem("token");

  // Fetch dropdowns + current week
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [weeksRes, projectsRes, taskTypesRes] = await Promise.all([
          axios.get("http://localhost:9000/api/weeks/current-month", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:9000/api/projects", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:9000/api/tasktypes", {
            headers: { Authorization: `Bearer ${token}` }
          }),
        ]);

        setWeeks(weeksRes.data);
        setProjects(projectsRes.data);
        setTaskTypes(taskTypesRes.data);

        const today = new Date();
        const todayIso = today.toISOString().split("T")[0];
        const activeWeek = weeksRes.data.find(
          (w) => todayIso >= w.startDate && todayIso <= w.endDate
        );

        if (activeWeek) {
          const cw = `${activeWeek.isoYear}-${activeWeek.weekNumber}`;
          setCurrentWeek(cw);
          setSelectedWeek(cw);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch initial data.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  // Fetch already saved tasks for the week
  useEffect(() => {
    if (!selectedWeek || !userId || !token) return;

    const [isoYear, weekNumber] = selectedWeek.split("-");
    if (!isoYear || !weekNumber) return;

    const fetchTasks = async () => {
      try {
        const res = await axios.get(
          `http://localhost:9000/api/weeklylogs/user/${userId}?isoYear=${isoYear}&weekNumber=${weekNumber}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const formatted = res.data.map((log) => ({
          id: log._id,
          week: `${log.isoYear}-${log.weekNumber}`,
          projectId: log.projectId._id || log.projectId,
          taskTypeId: log.taskTypeId._id || log.taskTypeId,
          days: log.days,
        }));
        setTasks(formatted);
      } catch (err) {
        console.error("Error fetching logs:", err);
      }
    };

    fetchTasks();
  }, [selectedWeek, userId, token]);

  const handleAddTask = () => {
    if (!selectedWeek || !selectedProject || !selectedTaskType)
      return alert("⚠️ Select all fields!");

    if (selectedWeek !== currentWeek)
      return alert("❌ You can only add tasks for the current week.");

    // Prevent duplicates
    const exists = tasks.some(
      (t) => t.projectId === selectedProject && t.taskTypeId === selectedTaskType
    );
    if (exists) return alert("⚠️ Task already exists for this project & type!");

    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        week: selectedWeek,
        projectId: selectedProject,
        taskTypeId: selectedTaskType,
        days: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
      },
    ]);
  };

  const handleHourChange = (taskId, day, value) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, days: { ...task.days, [day]: Number(value) || 0 } }
          : task
      )
    );
  };

  const handleSave = async () => {
    try {
      if (!token) {
        alert("No token found, please login again.");
        return;
      }

      // Compute week & year from selected week
      const [isoYear, weekNumber] = selectedWeek.split("-");

      // First delete existing logs for this week
      await axios.delete(
        `http://localhost:9000/api/weeklylogs/user/${userId}?isoYear=${isoYear}&weekNumber=${weekNumber}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Then create new logs
      const savePromises = tasks.map(task =>
        axios.post(
          "http://localhost:9000/api/weeklylogs",
          {
            userId,
            projectId: task.projectId,
            taskTypeId: task.taskTypeId,
            weekNumber: parseInt(weekNumber),
            isoYear: parseInt(isoYear),
            days: task.days,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      );

      await Promise.all(savePromises);
      alert("Tasks saved successfully ✅");
    } catch (err) {
      console.error("Error saving task:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to save task ❌");
    }
  };


  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white min-h-screen">
      <Card className="bg-gray-900/80 text-white border border-gray-700 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold tracking-wide flex items-center gap-2">
            ⏳ Weekly Task Manager
            {loading && <span className="text-sm text-gray-400">Loading...</span>}
          </CardTitle>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-4 gap-4">
            {/* Week */}
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="bg-black text-white border-gray-700 rounded-xl">
                <SelectValue placeholder="Select Week" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white">
                {weeks.map((w) => (
                  <SelectItem
                    key={w._id}
                    value={`${w.isoYear}-${w.weekNumber}`}
                  >
                    Week {w.weekNumber}, {w.month}{" "}
                    {`${w.isoYear}-${w.weekNumber}` === currentWeek && "(Current)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Project */}
            <Select onValueChange={setSelectedProject}>
              <SelectTrigger className="bg-black text-white border-gray-700 rounded-xl">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white">
                {projects.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* TaskType */}
            <Select onValueChange={setSelectedTaskType}>
              <SelectTrigger className="bg-black text-white border-gray-700 rounded-xl">
                <SelectValue placeholder="Select Task Type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white">
                {taskTypes.map((t) => (
                  <SelectItem key={t._id} value={t._id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleAddTask}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              ➕ Add Task
            </Button>
          </div>

          {/* Task Grid */}
          <div className="overflow-x-auto rounded-xl border border-gray-700 max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-gray-800/90 backdrop-blur">
                <TableRow>
                  <TableHead className="text-white">Project</TableHead>
                  <TableHead className="text-white">Task</TableHead>
                  {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((d) => (
                    <TableHead key={d} className="text-white">
                      {d.toUpperCase()}
                    </TableHead>
                  ))}
                  <TableHead className="text-white">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => {
                  const total = Object.values(task.days).reduce((a, b) => a + b, 0);
                  const isEditable = task.week === currentWeek;
                  const projectName =
                    projects.find((p) => p._id === task.projectId)?.name || "N/A";
                  const taskTypeName =
                    taskTypes.find((t) => t._id === task.taskTypeId)?.name || "N/A";

                  return (
                    <TableRow
                      key={task.id}
                      className={`${isEditable
                        ? "border-l-4 border-green-500"
                        : "opacity-50 cursor-not-allowed"
                        }`}
                      title={!isEditable ? "Locked – Only current week editable" : ""}
                    >
                      <TableCell>{projectName}</TableCell>
                      <TableCell>{taskTypeName}</TableCell>
                      {Object.keys(task.days).map((day) => (
                        <TableCell key={day}>
                          <Input
                            type="number"
                            value={task.days[day]}
                            onChange={(e) =>
                              handleHourChange(task.id, day, e.target.value)
                            }
                            disabled={!isEditable}
                            className={`bg-black text-white border-gray-700 text-center rounded-lg ${!isEditable ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                          />
                        </TableCell>
                      ))}
                      <TableCell>
                        <span className="px-3 py-1 rounded-full bg-gray-700 text-green-400 font-semibold">
                          {total}h
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <Button
            onClick={handleSave}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 rounded-xl py-3 text-lg"
          >
            💾 Save Weekly Logs
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
