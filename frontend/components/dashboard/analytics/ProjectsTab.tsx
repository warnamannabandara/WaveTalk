"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, Circle } from 'lucide-react';

const progressData = [
    { name: 'Project Alpha', completed: 85, inProgress: 15 },
    { name: 'Project Beta', completed: 60, inProgress: 40 },
    { name: 'Project Gamma', completed: 100, inProgress: 0 },
    { name: 'Project Delta', completed: 45, inProgress: 55 },
    { name: 'Project Epsilon', completed: 70, inProgress: 30 },
];

const completedProjects = [
    { id: 1, name: 'Project Gamma', status: 'Completed', date: 'Dec 15, 2025' },
    { id: 2, name: 'Project Zeta', status: 'Completed', date: 'Nov 20, 2025' },
    { id: 3, name: 'Project Theta', status: 'Completed', date: 'Oct 05, 2025' },
];

const inProgressProjects = [
    { id: 1, name: 'Project Alpha', status: 'Active', progress: 85 },
    { id: 2, name: 'Project Beta', status: 'Active', progress: 60 },
    { id: 3, name: 'Project Delta', status: 'Active', progress: 45 },
];

const ProjectsTab = () => {
    return (
        <div className="space-y-6">
            {/* Project Progress */}
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
                            <XAxis type="number" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                            <YAxis dataKey="name" type="category" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} width={100} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1A231F', border: '1px solid #2A3430', borderRadius: '8px' }}
                            />
                            <Bar dataKey="completed" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} barSize={20} />
                            <Bar dataKey="inProgress" stackId="a" fill="#065F46" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-xs text-gray-400">completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-900" />
                        <span className="text-xs text-gray-400">inProgress</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Completed Projects */}
                <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Completed Projects</h3>
                    <div className="space-y-3">
                        {completedProjects.map((project) => (
                            <div key={project.id} className="flex items-center justify-between p-4 bg-[#15231D] border border-[#2A3430] rounded-xl">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <span className="text-sm font-medium text-white">{project.name}</span>
                                </div>
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-medium border border-emerald-500/20">
                                    {project.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* In Progress */}
                <div className="bg-[#1A231F] border border-[#2A3430] rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">In Progress</h3>
                    <div className="space-y-3">
                        {inProgressProjects.map((project) => (
                            <div key={project.id} className="flex items-center justify-between p-4 bg-[#15231D] border border-[#2A3430] rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Circle className="w-5 h-5 text-emerald-500" />
                                    <span className="text-sm font-medium text-white">{project.name}</span>
                                </div>
                                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-medium border border-blue-500/20">
                                    {project.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectsTab;
