"use client";

import { useState } from 'react';
import SettingsHeader from '../../../components/dashboard/settings/SettingsHeader';
import SettingsTabs from '../../../components/dashboard/settings/SettingsTabs';
import AccountTab from '../../../components/dashboard/settings/AccountTab';
import PreferencesTab from '../../../components/dashboard/settings/PreferencesTab';
import HelpTab from '../../../components/dashboard/settings/HelpTab';
import AboutTab from '../../../components/dashboard/settings/AboutTab';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('account');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'account':
                return <AccountTab />;
            case 'preferences':
                return <PreferencesTab />;
            case 'about':
                return <AboutTab />;
            case 'help':
                return <HelpTab />;
            default:
                return <AccountTab />;
        }
    };

    return (
        <div className="p-8 max-w-[1200px] mx-auto min-h-screen">
            <SettingsHeader />
            <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {renderTabContent()}
            </div>
        </div>
    );
}
