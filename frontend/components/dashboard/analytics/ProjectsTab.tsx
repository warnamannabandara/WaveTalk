"use client";

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, Circle, FolderOpen } from 'lucide-react';

interface Task {
    id: number;
    title: string;
    project: string;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
}

interface ProjectStat {
    name: string;
    completedTasks: number;
    totalTasks: number;
    completed: number;
    inProgress: number;
    fullyDone: boolean;
}

const ProjectsTab = () => {
    const [projects, setProjects] = useState<ProjectStat[]>([]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('calendar_tasks');
            const tasks: Task[] = stored ? JSON.parse(stored) : [];

            const map = new Map<string, { completed: number; total: number }>();
            for (const t of tasks) {
                const entry = map.get(t.project) ?? { completed: 0, total: 0 };
                entry.total += 1;
                if (t.completed) entry.completed += 1;
                map.set(t.project, entry);
            }

            const derived: ProjectStat[] = Array.from(map.entries()).map(([name, { completed, total }]) => ({
                name,
                completedTasks: completed,
                totalTasks: total,
                completed: total > 0 ? Math.round((completed / total) * 100) : 0,
                inProgress: total > 0 ? Math.round(((total - completed) / total) * 100) : 0,
                fullyDone: completed === total && total > 0,
            }));

            setProjects(derived);
        } catch {
            setProjects([]);
        }
    }, []);

    const completedProjects = projects.filter(p => p.fullyDone);
    const inProgressProjects = projects.filter(p => !p.fullyDone);

    const progressData = projects.map(p => ({
        name: p.name,
        completed: p.completed,
        inProgress: p.inProgress,
    }));

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <FolderOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No projects yet</p>
                <p className="text-gray-600 text-xs mt-1">Add tasks in Calendar → Tasks to see project data here</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Project Progress Chart */}
            <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Project Progress</h3>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={progressData}
                            layout="vertical"
                            margin={{ left: 20, right: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#2A3430" horizontal={true} vertical={false} />
                            <XAxis type="number" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                            <YAxis dataKey="name" type="category" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} width={100} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1A231F', border: '1px solid #2A3430', borderRadius: '8px' }}
                                formatter={(v: number) => `${v}%`}
                            />
                            <Bar dataKey="completed" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} barSize={20} name="Completed" />
                            <Bar dataKey="inProgress" stackId="a" fill="#065F46" radius={[0, 4, 4, 0]} barSize={20} name="In Progress" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-xs text-gray-400">Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-900" />
                        <span className="text-xs text-gray-400">In Progress</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Completed Projects */}
                <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Completed Projects</h3>
                    {completedProjects.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-6">No fully completed projects yet</p>
                    ) : (
                        <div className="space-y-3">
                            {completedProjects.map((project) => (
                                <div key={project.name} className="flex items-center justify-between p-4 bg-[#15231D] border border-[#2A3430] rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        <div>
                                            <span className="text-sm font-medium text-white">{project.name}</span>
                                            <p className="text-xs text-gray-500 mt-0.5">{project.totalTasks} tasks</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-medium border border-emerald-500/20">
                                        Completed
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* In Progress */}
                <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">In Progress</h3>
                    {inProgressProjects.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-6">No projects in progress</p>
                    ) : (
                        <div className="space-y-3">
                            {inProgressProjects.map((project) => (
                                <div key={project.name} className="flex items-center justify-between p-4 bg-[#15231D] border border-[#2A3430] rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <Circle className="w-5 h-5 text-emerald-500" />
                                        <div>
                                            <span className="text-sm font-medium text-white">{project.name}</span>
                                            <p className="text-xs text-gray-500 mt-0.5">{project.completedTasks}/{project.totalTasks} tasks done</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-medium border border-blue-500/20">
                                        {project.completed}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectsTab;
