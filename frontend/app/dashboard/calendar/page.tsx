"use client";

import { useState } from 'react';
import CalendarHeader from '@/components/dashboard/calendar/CalendarHeader';
import CalendarTabs from '@/components/dashboard/calendar/CalendarTabs';
import ProjectList from '@/components/dashboard/calendar/ProjectList';
import TaskList from '@/components/dashboard/calendar/TaskList';
import StatsCards from '@/components/dashboard/calendar/StatsCards';

const CalendarPage = () => {
    const [activeTab, setActiveTab] = useState('projects');

    return (
        <div className="max-w-5xl mx-auto py-8 px-6">
            <CalendarHeader />
            <CalendarTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="mt-8 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
                {activeTab === 'projects' && (
                    <div className="space-y-8">
                        <ProjectList />
                        <StatsCards />
                    </div>
                )}
                {activeTab === 'tasks' && <TaskList />}
                {activeTab === 'calendar' && (
                    <div className="bg-[#1A231F] rounded-2xl p-12 border border-[#2A3430] text-center">
                        <p className="text-gray-500">Calendar view coming soon...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarPage;
