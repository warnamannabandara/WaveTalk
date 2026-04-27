"use client";

import { useState } from 'react';
import { CheckCircle2, Circle, Plus, X } from 'lucide-react';
import type { Task } from '@/app/dashboard/calendar/page';

interface Props {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const PRIORITIES = ['high', 'medium', 'low'] as const;

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
        case 'medium': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        case 'low': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
};

const TaskList = ({ tasks, setTasks }: Props) => {
    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newProject, setNewProject] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');

    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

    const toggleTask = (id: number) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const addTask = () => {
        if (!newTitle.trim()) return;
        const task: Task = {
            id: Date.now(),
            title: newTitle.trim(),
            project: newProject.trim() || 'General',
            date: newDate.trim() || 'No date',
            priority: newPriority,
            completed: false,
        };
        setTasks(prev => [...prev, task]);
        setNewTitle('');
        setNewProject('');
        setNewDate('');
        setNewPriority('medium');
        setShowForm(false);
    };

    return (
        <div className="bg-[#1A231F] rounded-2xl p-8 border border-[#2A3430]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-medium text-white">Task Manager</h2>
                    <p className="text-sm text-gray-500 mt-1">{completed} of {total} tasks completed</p>
                </div>
                <button
                    onClick={() => setShowForm(v => !v)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl transition-all font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add Task
                </button>
            </div>

            <div className="h-2 w-full bg-[#141B18] rounded-full overflow-hidden mb-10 border border-[#2A3430]">
                <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>

            {showForm && (
                <div className="mb-8 p-5 rounded-xl border border-emerald-500/30 bg-emerald-900/10 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">New Task</span>
                        <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <input
                        className="w-full bg-[#141B18] border border-[#2A3430] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
                        placeholder="Task title *"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addTask()}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            className="bg-[#141B18] border border-[#2A3430] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
                            placeholder="Project"
                            value={newProject}
                            onChange={e => setNewProject(e.target.value)}
                        />
                        <input
                            className="bg-[#141B18] border border-[#2A3430] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
                            placeholder="Date"
                            value={newDate}
                            onChange={e => setNewDate(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {PRIORITIES.map(p => (
                            <button
                                key={p}
                                onClick={() => setNewPriority(p)}
                                className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded border transition-all ${
                                    newPriority === p ? getPriorityColor(p) + ' ring-1 ring-current' : 'bg-[#141B18] border-[#2A3430] text-gray-500'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={addTask}
                            className="ml-auto bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-1.5 rounded-lg transition-all font-medium"
                        >
                            Add
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className="flex items-center justify-between group cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            {task.completed ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                            ) : (
                                <Circle className="w-6 h-6 text-gray-600 group-hover:text-emerald-500 transition-colors shrink-0" />
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
