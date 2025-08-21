import { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [taskTypes, setTaskTypes] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTaskType, setSelectedTaskType] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("");
  const [currentWeek, setCurrentWeek] = useState("");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;
  const token = localStorage.getItem("token");

  // Load projects, taskTypes, current week logs
  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !token) return;

      setIsLoading(true);
      try {
        const [projRes, taskRes, logsRes] = await Promise.all([
          axios.get("http://localhost:9000/api/projects", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:9000/api/tasktypes", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:9000/api/weeklylogs/current/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setProjects(projRes.data);
        setTaskTypes(taskRes.data);

        const today = new Date();
        const weekNumber = getWeekNumber(today);
        setCurrentWeek(weekNumber);
        setSelectedWeek(weekNumber.toString());
        setCurrentYear(today.getFullYear());

        // Load existing tasks for current week
        if (logsRes.data && logsRes.data.length > 0) {
          const existingTasks = logsRes.data.map(log => ({
            id: log._id,
            week: log.weekNumber,
            projectId: log.projectId?._id || log.projectId,
            taskTypeId: log.taskTypeId?._id || log.taskTypeId,
            status: log.status,
            days: log.days
          }));
          setTasks(existingTasks);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        alert("Error loading data. Please check console for details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, token]);

  const getWeekNumber = (date) => {
    const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = temp.getUTCDay() || 7;
    temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
    return Math.ceil(((temp - yearStart) / 86400000 + 1) / 7);
  };

  // Add new task (only if not already exists)
  const handleAddTask = () => {
    if (!selectedProject || !selectedTaskType || !selectedWeek) {
      alert("Please select project, task type and week");
      return;
    }

    // Check if task already exists for this project/taskType/week
    const existingTask = tasks.find(task =>
      task.projectId === selectedProject &&
      task.taskTypeId === selectedTaskType &&
      task.week === parseInt(selectedWeek)
    );

    if (existingTask) {
      alert("This task already exists for the selected week");
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

  // Remove task
  const handleRemoveTask = async (taskId) => {
    if (taskId.startsWith('temp-')) {
      // Remove temporary task
      setTasks(prev => prev.filter(task => task.id !== taskId));
      return;
    }

    // Remove from server
    try {
      await axios.delete(`http://localhost:9000/api/weeklylogs/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Error deleting task. Check console for details.");
    }
  };

  // Change hours
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

  // Change status
  const handleStatusChange = (taskId, value) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status: value } : task))
    );
  };

  // Save all tasks (UPSERT)
  const handleSave = async () => {
    if (!user || !user._id) {
      alert("User not found. Please login again.");
      return;
    }

    if (tasks.length === 0) {
      alert("No tasks to save");
      return;
    }

    setIsLoading(true);
    try {
      const tasksToSave = tasks.map(task => ({
        userId: user._id,
        projectId: task.projectId,
        taskTypeId: task.taskTypeId,
        weekNumber: parseInt(task.week),
        isoYear: currentYear,
        status: task.status,
        days: task.days
      }));

      // Use bulk upsert endpoint
      const response = await axios.post('http://localhost:9000/api/weeklylogs/upsert-bulk',
        { tasks: tasksToSave },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Tasks saved:', response.data);

      // Reload tasks to get updated IDs
      const logsRes = await axios.get(`http://localhost:9000/api/weeklylogs/current/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (logsRes.data && logsRes.data.length > 0) {
        const updatedTasks = logsRes.data.map(log => ({
          id: log._id,
          week: log.weekNumber,
          projectId: log.projectId?._id || log.projectId,
          taskTypeId: log.taskTypeId?._id || log.taskTypeId,
          status: log.status,
          days: log.days
        }));
        setTasks(updatedTasks);
      }

      alert('All tasks saved successfully!');
    } catch (error) {
      console.error('Error saving tasks:', error);
      alert('Error saving tasks. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get project name
  const getProjectName = (projectId) => {
    return projects.find((p) => p._id === projectId)?.name || "N/A";
  };

  // Get task type name
  const getTaskTypeName = (taskTypeId) => {
    return taskTypes.find((t) => t._id === taskTypeId)?.name || "N/A";
  };

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
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>

        <select
          value={selectedTaskType}
          onChange={(e) => setSelectedTaskType(e.target.value)}
          className="bg-gray-900 p-2 rounded-lg text-white"
        >
          <option value="">Select Task Type</option>
          {taskTypes.map((t) => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>

        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          className="bg-gray-900 p-2 rounded-lg text-white"
        >
          <option value="">Select Week</option>
          {Array.from({ length: 52 }, (_, i) => i + 1).map(week => (
            <option key={week} value={week}>Week {week}</option>
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
          disabled={tasks.length === 0 || isLoading}
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
                <TableHead key={d} className="text-white text-center">{d.toUpperCase()}</TableHead>
              ))}
              <TableHead className="text-white text-center">Total</TableHead>
              <TableHead className="text-white text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {tasks.map((task) => {
              const total = Object.values(task.days).reduce((a, b) => a + b, 0);
              const isEditable = task.week === currentWeek;
              const projectName = getProjectName(task.projectId);
              const taskTypeName = getTaskTypeName(task.taskTypeId);

              return (
                <TableRow key={task.id} className={isEditable ? "border-l-4 border-green-500" : "opacity-50"}>
                  <TableCell>{projectName}</TableCell>
                  <TableCell>{taskTypeName}</TableCell>

                  {/* Status */}
                  <TableCell>
                    <Select
                      value={task.status}
                      onValueChange={(val) => handleStatusChange(task.id, val)}
                      disabled={!isEditable}
                    >
                      <SelectTrigger className="bg-black text-white border-gray-700 rounded-xl">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 text-white">
                        <SelectItem value="todo">📝 Todo</SelectItem>
                        <SelectItem value="inprogress">⏳ In Progress</SelectItem>
                        <SelectItem value="done">✅ Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {Object.keys(task.days).map((day) => (
                    <TableCell key={day} className="text-center">
                      <Input
                        type="number"
                        min="0"
                        max="24"
                        value={task.days[day]}
                        onChange={(e) => handleHourChange(task.id, day, e.target.value)}
                        disabled={!isEditable}
                        className="bg-black text-white border-gray-700 text-center rounded-lg w-16"
                      />
                    </TableCell>
                  ))}

                  <TableCell className="text-center">
                    <span className="px-3 py-1 rounded-full bg-gray-700 text-green-400 font-semibold">
                      {total}h
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      onClick={() => handleRemoveTask(task.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-1 text-xs"
                      disabled={!isEditable}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {tasks.length === 0 && (
        <div className="text-center text-gray-400 mt-8">
          No tasks added yet. Select a project and task type to get started.
        </div>
      )}

      {tasks.length > 0 && (
        <div className="mt-4 text-sm text-gray-400">
          <p>💡 Only tasks for the current week (Week {currentWeek}) are editable.</p>
          <p>💡 Each user can have only one record per project/task type per week.</p>
        </div>
      )}
    </div>
  );
}