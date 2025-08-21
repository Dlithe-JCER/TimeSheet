import React, { useEffect, useState } from "react";

function ViewTimeSheet() {
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [logs, setLogs] = useState([]);

    const [selectedUser, setSelectedUser] = useState("");
    const [selectedProject, setSelectedProject] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedWeek, setSelectedWeek] = useState("");

    // ✅ Fetch users and projects for dropdowns
    useEffect(() => {
        fetch("http://localhost:9000/api/auth/users")
            .then((res) => res.json())
            .then((data) => setUsers(data));

        fetch("http://localhost:9000/api/projects")
            .then((res) => res.json())
            .then((data) => setProjects(data));
    }, []);

    // ✅ Helper: get weeks of a month
    const getWeeksInMonth = (month, year) => {
        const weeks = [];
        const firstDay = new Date(year, month, 1);
        let currentDate = firstDay;

        while (currentDate.getMonth() === month) {
            const weekNum = getWeekNumber(currentDate);
            if (!weeks.includes(weekNum)) {
                weeks.push(weekNum);
            }
            currentDate.setDate(currentDate.getDate() + 7);
        }
        return weeks;
    };

    // ✅ ISO Week Number function
    function getWeekNumber(date) {
        const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = temp.getUTCDay() || 7;
        temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
        return Math.ceil(((temp - yearStart) / 86400000 + 1) / 7);
    }

    // ✅ Fetch logs when filters are applied
    const fetchLogs = () => {
        if (!selectedUser) return;

        let url = `http://localhost:9000/api/weeklylogs/user/${selectedUser}?`;
        if (selectedWeek) url += `weekNumber=${selectedWeek}&`;
        if (selectedMonth) url += `isoYear=${new Date().getFullYear()}&`; // keep same year for now

        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                const filtered = selectedProject
                    ? data.filter((log) => log.projectId._id === selectedProject)
                    : data;
                setLogs(filtered);
            });
    };

    // ✅ Calculate grand total hours
    const totalHours = logs.reduce((sum, log) => {
        return (
            sum +
            (Number(log.days.mon || 0) +
                Number(log.days.tue || 0) +
                Number(log.days.wed || 0) +
                Number(log.days.thu || 0) +
                Number(log.days.fri || 0) +
                Number(log.days.sat || 0) +
                Number(log.days.sun || 0))
        );
    }, 0);

    return (
        <div className="p-10 bg-black min-h-screen text-white">
            <h1 className="text-3xl font-bold mb-6">View Employee Timesheets</h1>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Employee Dropdown */}
                <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="bg-gray-900 p-2 rounded-lg"
                >
                    <option value="">Select Employee</option>
                    {users.map((u) => (
                        <option key={u._id} value={u._id}>
                            {u.employeeId} - {u.name}
                        </option>
                    ))}
                </select>

                {/* Project Dropdown */}
                <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="bg-gray-900 p-2 rounded-lg"
                >
                    <option value="">All Projects</option>
                    {projects.map((p) => (
                        <option key={p._id} value={p._id}>
                            {p.name}
                        </option>
                    ))}
                </select>

                {/* Month Dropdown */}
                <select
                    value={selectedMonth}
                    onChange={(e) => {
                        setSelectedMonth(e.target.value);
                        setSelectedWeek(""); // reset week
                    }}
                    className="bg-gray-900 p-2 rounded-lg"
                >
                    <option value="">Select Month</option>
                    {Array.from({ length: 12 }, (_, i) => i).map((m) => (
                        <option key={m} value={m}>
                            {new Date(0, m).toLocaleString("default", { month: "long" })}
                        </option>
                    ))}
                </select>

                {/* Week Dropdown */}
                <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className="bg-gray-900 p-2 rounded-lg"
                    disabled={!selectedMonth}
                >
                    <option value="">Select Week</option>
                    {selectedMonth !== "" &&
                        getWeeksInMonth(parseInt(selectedMonth), new Date().getFullYear()).map((week) => (
                            <option key={week} value={week}>
                                Week {week}
                            </option>
                        ))}
                </select>
            </div>

            <button
                onClick={fetchLogs}
                className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
                Apply Filters
            </button>

            {/* Results */}
            <div className="mt-8">
                {logs.length === 0 ? (
                    <p className="text-gray-400">No timesheet logs found.</p>
                ) : (
                    <>
                        {/* ✅ Group by project if "All Projects" selected */}
                        {selectedProject === "" ? (
                            <>
                                {projects
                                    .filter((proj) => logs.some((log) => log.projectId?._id === proj._id))
                                    .map((proj) => {
                                        const projLogs = logs.filter((log) => log.projectId?._id === proj._id);

                                        const projectTotal = projLogs.reduce((sum, log) => {
                                            return (
                                                sum +
                                                (Number(log.days.mon || 0) +
                                                    Number(log.days.tue || 0) +
                                                    Number(log.days.wed || 0) +
                                                    Number(log.days.thu || 0) +
                                                    Number(log.days.fri || 0) +
                                                    Number(log.days.sat || 0) +
                                                    Number(log.days.sun || 0))
                                            );
                                        }, 0);

                                        return (
                                            <div key={proj._id} className="mb-6">
                                                <h2 className="text-xl font-bold text-green-400 mb-2">
                                                    Project: {proj.name} (Total Hours: {projectTotal})
                                                </h2>
                                                <table className="w-full border border-gray-700">
                                                    <thead>
                                                        <tr className="bg-gray-800">
                                                            <th className="p-2">Employee</th>
                                                            <th className="p-2">Task Type</th>
                                                            <th className="p-2">Week</th>
                                                            <th className="p-2">Days</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {projLogs.map((log) => (
                                                            <tr key={log._id} className="border-b border-gray-700">
                                                                <td className="p-2">{log.userId?.name}</td>
                                                                <td className="p-2">{log.taskTypeId?.name}</td>
                                                                <td className="p-2">
                                                                    Week {log.weekNumber} ({log.isoYear})
                                                                </td>
                                                                <td className="p-2">
                                                                    Mon: {log.days.mon}, Tue: {log.days.tue}, Wed:{" "}
                                                                    {log.days.wed}, Thu: {log.days.thu}, Fri:{" "}
                                                                    {log.days.fri}, Sat: {log.days.sat}, Sun:{" "}
                                                                    {log.days.sun}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        );
                                    })}
                            </>
                        ) : (
                            <>
                                {/* ✅ Show single project table */}
                                <table className="w-full border border-gray-700">
                                    <thead>
                                        <tr className="bg-gray-800">
                                            <th className="p-2">Employee</th>
                                            <th className="p-2">Project</th>
                                            <th className="p-2">Task Type</th>
                                            <th className="p-2">Week</th>
                                            <th className="p-2">Days</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log) => (
                                            <tr key={log._id} className="border-b border-gray-700">
                                                <td className="p-2">{log.userId?.name}</td>
                                                <td className="p-2">{log.projectId?.name}</td>
                                                <td className="p-2">{log.taskTypeId?.name}</td>
                                                <td className="p-2">
                                                    Week {log.weekNumber} ({log.isoYear})
                                                </td>
                                                <td className="p-2">
                                                    Mon: {log.days.mon}, Tue: {log.days.tue}, Wed: {log.days.wed}, Thu:{" "}
                                                    {log.days.thu}, Fri: {log.days.fri}, Sat: {log.days.sat}, Sun:{" "}
                                                    {log.days.sun}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}

                        {/* ✅ Show Grand Total Hours */}
                        <div className="mt-4 text-lg font-semibold text-yellow-400">
                            Grand Total Hours: {totalHours}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ViewTimeSheet;
