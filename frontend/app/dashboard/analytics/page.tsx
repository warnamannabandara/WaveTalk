"use client";

import { useState } from 'react';
import AnalyticsHeader from '../../../components/dashboard/analytics/AnalyticsHeader';
import StatsOverview from '../../../components/dashboard/analytics/StatsOverview';
import AnalyticsTabs from '../../../components/dashboard/analytics/AnalyticsTabs';
import OverviewTab from '../../../components/dashboard/analytics/OverviewTab';
import AttendanceTab from '../../../components/dashboard/analytics/AttendanceTab';
import ProjectsTab from '../../../components/dashboard/analytics/ProjectsTab';
import TeamsTab from '../../../components/dashboard/analytics/TeamsTab';

export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState('overview');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab />;
            case 'attendance':
                return <AttendanceTab />;
            case 'projects':
                return <ProjectsTab />;
            case 'teams':
                return <TeamsTab />;
            default:
                return <OverviewTab />;
        }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
            <AnalyticsHeader />
            <StatsOverview />
            <AnalyticsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {renderTabContent()}
            </div>
        </div>
    );
}
