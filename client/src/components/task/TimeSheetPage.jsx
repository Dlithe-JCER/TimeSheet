import { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import AlertMessage from "../AlertMessage";

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTaskType, setSelectedTaskType] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [weeksOfMonth, setWeeksOfMonth] = useState([]);
  const [currentWeek, setCurrentWeek] = useState("");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;
  const token = localStorage.getItem("token");

  // 🔹 Alerts
  const [alert, setAlert] = useState({ type: "", message: "" });
  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: "", message: "" }), 3000);
  };

  // 🔹 Helper: Get ISO week number
  const getWeekNumber = (date) => {
    const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = temp.getUTCDay() || 7;
    temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
    return Math.ceil(((temp - yearStart) / 86400000 + 1) / 7);
  };

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const getWeeksOfMonth = (year, month) => {
    const weeks = [];
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    let current = new Date(firstDayOfMonth);

    while (current.getDay() !== 1) {
      current.setDate(current.getDate() - 1);
    }

    while (current <= lastDayOfMonth) {
      const weekStart = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);

      weeks.push({
        weekNumber: getWeekNumber(weekStart),
        start: new Date(weekStart),
        end: new Date(weekEnd),
      });

      current.setDate(current.getDate() + 7);
    }

    return weeks;
  };

  // 🔹 Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !token) return;
      setIsLoading(true);
      try {
        const [projRes, taskRes, logsRes] = await Promise.all([
          axios.get("http://localhost:9000/api/projects/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:9000/api/tasktypes", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:9000/api/weeklylogs/current/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setProjects(projRes.data);
        setTaskTypes(taskRes.data);

        const today = new Date();
        const weekNumber = getWeekNumber(today);
        setCurrentWeek(weekNumber);
        setCurrentYear(today.getFullYear());

        const monthWeeks = getWeeksOfMonth(today.getFullYear(), today.getMonth());
        setWeeksOfMonth(monthWeeks);

        const currentWeekInMonth = monthWeeks.find(
          (w) => w.weekNumber === weekNumber
        );
        if (currentWeekInMonth)
          setSelectedWeek(currentWeekInMonth.weekNumber.toString());

        if (logsRes.data && logsRes.data.length > 0) {
          const existingTasks = logsRes.data.map((log) => ({
            id: log._id,
            week: log.weekNumber,
            projectId: log.projectId?._id || log.projectId,
            taskTypeId: log.taskTypeId?._id || log.taskTypeId,
            status: log.status,
            days: log.days,
          }));
          setTasks(existingTasks);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        showAlert("error", "Error loading data. Please check console for details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, token]);

  // 🔹 Add new task
  const handleAddTask = () => {
    if (!selectedProject || !selectedTaskType || !selectedWeek) {
      showAlert("error", "Please select project, task type and week");
      return;
    }

    const existingTask = tasks.find(
      (task) =>
        task.projectId === selectedProject &&
        task.taskTypeId === selectedTaskType &&
        task.week === parseInt(selectedWeek)
    );

    if (existingTask) {
      showAlert("error", "This task already exists for the selected week");
      return;
    }

    setTasks((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        week: parseInt(selectedWeek),
        projectId: selectedProject,
        taskTypeId: selectedTaskType,
        status: "todo",
        days: { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
      },
    ]);
  };
  // Fetch logs whenever selectedWeek changes
  useEffect(() => {
    const fetchLogsForWeek = async () => {
      if (!userId || !token || !selectedWeek) return;

      try {
        const logsRes = await axios.get(
          `http://localhost:9000/api/weeklylogs/user/${userId}?isoYear=${currentYear}&weekNumber=${selectedWeek}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (logsRes.data && logsRes.data.length > 0) {
          const updatedTasks = logsRes.data.map((log) => ({
            id: log._id,
            week: log.weekNumber,
            projectId: log.projectId?._id || log.projectId,
            taskTypeId: log.taskTypeId?._id || log.taskTypeId,
            status: log.status,
            days: log.days,
          }));
          setTasks(updatedTasks);
        } else {
          setTasks([]); // No logs for that week
        }
      } catch (err) {
        console.error("Error fetching logs for week:", err);
        showAlert("error", "Error fetching logs. Please try again.");
      }
    };

    fetchLogsForWeek();
  }, [selectedWeek, userId, token, currentYear]);

  const handleRemoveTask = async (taskId) => {
    if (taskId.startsWith("temp-")) {
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      return;
    }
    try {
      await axios.delete(`http://localhost:9000/api/weeklylogs/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      showAlert("error", "Error deleting task. Check console for details.");
    }
  };

  const handleHourChange = (taskId, day, value) => {
    const hours = Math.max(0, Math.min(24, parseInt(value) || 0));
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, days: { ...task.days, [day]: hours } }
          : task
      )
    );
  };

  const handleStatusChange = (taskId, value) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: value } : task
      )
    );
  };

  const handleSave = async () => {
    if (!user || !user._id) {
      showAlert("error", "User not found. Please login again.");
      return;
    }
    if (tasks.length === 0) {
      showAlert("error", "No tasks to save");
      return;
    }
    setIsLoading(true);
    try {
      const tasksToSave = tasks.map((task) => ({
        userId: user._id,
        projectId: task.projectId,
        taskTypeId: task.taskTypeId,
        weekNumber: parseInt(task.week),
        isoYear: currentYear,
        status: task.status,
        days: task.days,
      }));

      await axios.post(
        "http://localhost:9000/api/weeklylogs/upsert-bulk",
        { tasks: tasksToSave },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const logsRes = await axios.get(
        `http://localhost:9000/api/weeklylogs/user/${userId}?isoYear=${currentYear}&weekNumber=${selectedWeek}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (logsRes.data && logsRes.data.length > 0) {
        const updatedTasks = logsRes.data.map((log) => ({
          id: log._id,
          week: log.weekNumber,
          projectId: log.projectId?._id || log.projectId,
          taskTypeId: log.taskTypeId?._id || log.taskTypeId,
          status: log.status,
          days: log.days,
        }));
        setTasks(updatedTasks);
      }
      showAlert("success", "All tasks saved successfully!");
    } catch (error) {
      console.error("Error saving tasks:", error);
      showAlert("error", "Error saving tasks. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const getProjectName = (projectId) =>
    projects.find((p) => p._id === projectId)?.name || "N/A";
  const getTaskTypeName = (taskTypeId) =>
    taskTypes.find((t) => t._id === taskTypeId)?.name || "N/A";

  if (isLoading) {
    return (
      <div className="p-6 bg-black min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <AlertMessage
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: "", message: "" })}
      />

      <h1 className="text-2xl font-bold mb-6">Weekly Task Manager</h1>

      {/* Controls */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="bg-gray-900 p-2 rounded-lg text-white"
        >
          <option value="">Select Project</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={selectedTaskType}
          onChange={(e) => setSelectedTaskType(e.target.value)}
          className="bg-gray-900 p-2 rounded-lg text-white"
        >
          <option value="">Select Task Type</option>
          {taskTypes.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>

        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          className="bg-gray-900 p-2 rounded-lg text-white"
        >
          <option value="">Select Week</option>
          {weeksOfMonth.map((w) => (
            <option key={w.weekNumber} value={w.weekNumber}>
              Week {w.weekNumber} ({formatDate(w.start)} - {formatDate(w.end)})
            </option>
          ))}
        </select>

        <Button
          onClick={handleAddTask}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!selectedProject || !selectedTaskType || !selectedWeek}
        >
          Add Task
        </Button>

        <Button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700"
          disabled={
            tasks.length === 0 ||
            isLoading ||
            parseInt(selectedWeek) !== currentWeek
          }
        >
          {isLoading ? "Saving..." : "Save All"}
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-gray-800/90">
            <TableRow>
              <TableHead className="text-white">Project</TableHead>
              <TableHead className="text-white">Task</TableHead>
              <TableHead className="text-white">Status</TableHead>
              {["mon", "tue", "wed", "thu", "fri", "sat", "sun"].map((d) => (
                <TableHead key={d} className="text-white text-center">
                  {d.toUpperCase()}
                </TableHead>
              ))}
              <TableHead className="text-white text-center">Total</TableHead>
              <TableHead className="text-white text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {tasks
              .filter((task) => task.week === parseInt(selectedWeek))
              .map((task) => {
                const total = Object.values(task.days).reduce((a, b) => a + b, 0);
                const isEditable = parseInt(selectedWeek) === currentWeek;
                const projectName = getProjectName(task.projectId);
                const taskTypeName = getTaskTypeName(task.taskTypeId);

                return (
                  <TableRow
                    key={task.id}
                    className={
                      isEditable ? "border-l-4 border-green-500" : "opacity-60"
                    }
                  >
                    <TableCell>{projectName}</TableCell>
                    <TableCell>{taskTypeName}</TableCell>

                    {/* Status */}
                    <TableCell>
                      {isEditable ? (
                        <Select
                          value={task.status}
                          onValueChange={(val) =>
                            handleStatusChange(task.id, val)
                          }
                        >
                          <SelectTrigger className="bg-black text-white border-gray-700 rounded-xl">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 text-white">
                            <SelectItem value="todo">📝 Todo</SelectItem>
                            <SelectItem value="inprogress">
                              ⏳ In Progress
                            </SelectItem>
                            <SelectItem value="done">✅ Done</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-gray-700">
                          {task.status}
                        </span>
                      )}
                    </TableCell>

                    {Object.keys(task.days).map((day) => (
                      <TableCell key={day} className="text-center">
                        {isEditable ? (
                          <Input
                            type="number"
                            min="0"
                            max="24"
                            value={task.days[day]}
                            onChange={(e) =>
                              handleHourChange(task.id, day, e.target.value)
                            }
                            className="bg-black text-white border-gray-700 text-center rounded-lg w-16"
                          />
                        ) : (
                          <span>{task.days[day]}h</span>
                        )}
                      </TableCell>
                    ))}

                    <TableCell className="text-center">
                      <span className="px-3 py-1 rounded-full bg-gray-700 text-green-400 font-semibold">
                        {total}h
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      {isEditable ? (
                        <Button
                          onClick={() => handleRemoveTask(task.id)}
                          className="bg-red-600 hover:bg-red-700 text-white p-1 text-xs"
                        >
                          Remove
                        </Button>
                      ) : (
                        <span className="text-gray-400">Locked</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {tasks.filter((task) => task.week === parseInt(selectedWeek)).length ===
        0 && (
          <div className="text-center text-gray-400 mt-8">
            No tasks for Week {selectedWeek}. Add one above.
          </div>
        )}

      {tasks.length > 0 && (
        <div className="mt-4 text-sm text-gray-400">
          <p>💡 Only the current week (Week {currentWeek}) is editable.</p>
          <p>💡 Other weeks are locked for viewing.</p>
        </div>
      )}
    </div>
  );
}
