"use client";

import { CheckCircle2, Circle, Plus } from 'lucide-react';

const TaskList = () => {
    const tasks = [
        { id: 1, title: 'Review Q4 presentation', project: 'Marketing', date: 'Today', priority: 'high', completed: false },
        { id: 2, title: 'Update project documentation', project: 'Development', date: 'Today', priority: 'medium', completed: true },
        { id: 3, title: 'Prepare client meeting agenda', project: 'Sales', date: 'Tomorrow', priority: 'high', completed: false },
        { id: 4, title: 'Code review for PR #234', project: 'Development', date: 'Jan 15', priority: 'medium', completed: false },
        { id: 5, title: 'Design mockup review', project: 'Design', date: 'Jan 12', priority: 'low', completed: true },
    ];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'medium': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'low': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    return (
        <div className="bg-[#1A231F] rounded-2xl p-8 border border-[#2A3430]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-medium text-white">Task Manager</h2>
                    <p className="text-sm text-gray-500 mt-1">2 of 5 tasks completed</p>
                </div>
                <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl transition-all font-medium">
                    <Plus className="w-4 h-4" />
                    Add Task
                </button>
            </div>

            <div className="h-2 w-full bg-[#141B18] rounded-full overflow-hidden mb-10 border border-[#2A3430]">
                <div className="h-full bg-emerald-600 w-[40%] rounded-full" />
            </div>

            <div className="space-y-6">
                {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-4">
                            {task.completed ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            ) : (
                                <Circle className="w-6 h-6 text-gray-600 group-hover:text-emerald-500 transition-colors" />
                            )}
                            <div>
                                <h3 className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-white group-hover:text-emerald-400 transition-colors'}`}>
                                    {task.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] uppercase tracking-wider font-bold bg-[#141B18] text-gray-500 px-2 py-0.5 rounded border border-[#2A3430]">
                                        {task.project}
                                    </span>
                                    <span className="text-xs text-gray-600">{task.date}</span>
                                </div>
                            </div>
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskList;
