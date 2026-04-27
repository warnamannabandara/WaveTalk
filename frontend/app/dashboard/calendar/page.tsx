"use client";

import { useState, useEffect } from 'react';
import CalendarHeader from '@/components/dashboard/calendar/CalendarHeader';
import CalendarTabs from '@/components/dashboard/calendar/CalendarTabs';
import CalendarView from '@/components/dashboard/calendar/CalendarView';
import ProjectList from '@/components/dashboard/calendar/ProjectList';
import TaskList from '@/components/dashboard/calendar/TaskList';
import StatsCards from '@/components/dashboard/calendar/StatsCards';

export interface Task {
    id: number;
    title: string;
    project: string;
    date: string;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
}

const INITIAL_TASKS: Task[] = [
    { id: 1, title: 'Review Q4 presentation', project: 'Marketing', date: 'Today', priority: 'high', completed: false },
    { id: 2, title: 'Update project documentation', project: 'Development', date: 'Today', priority: 'medium', completed: true },
    { id: 3, title: 'Prepare client meeting agenda', project: 'Sales', date: 'Tomorrow', priority: 'high', completed: false },
    { id: 4, title: 'Code review for PR #234', project: 'Development', date: 'Jan 15', priority: 'medium', completed: false },
    { id: 5, title: 'Design mockup review', project: 'Design', date: 'Jan 12', priority: 'low', completed: true },
];

const CalendarPage = () => {
    const [activeTab, setActiveTab] = useState('calendar');
    const [tasks, setTasks] = useState<Task[]>(() => {
        try {
            const stored = localStorage.getItem('calendar_tasks');
            return stored ? JSON.parse(stored) : INITIAL_TASKS;
        } catch { return INITIAL_TASKS; }
    });

    useEffect(() => {
        localStorage.setItem('calendar_tasks', JSON.stringify(tasks));
    }, [tasks]);

    return (
        <div className="max-w-5xl mx-auto py-8 px-6">
            <CalendarHeader />
            <CalendarTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="mt-8 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                {activeTab === 'calendar' && <CalendarView />}
                {activeTab === 'tasks' && <TaskList tasks={tasks} setTasks={setTasks} />}
                {activeTab === 'projects' && (
                    <div className="space-y-8">
                        <ProjectList tasks={tasks} />
                        <StatsCards tasks={tasks} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarPage;
