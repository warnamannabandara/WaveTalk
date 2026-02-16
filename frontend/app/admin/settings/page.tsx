"use client";

import { useState } from 'react';
import SettingsHeader from '@/components/admin/settings/SettingsHeader';
import SettingsTabs from '@/components/admin/settings/SettingsTabs';
import AccountTab from '@/components/admin/settings/AccountTab';
import PreferencesTab from '@/components/admin/settings/PreferencesTab';

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState('account');

    return (
        <div className="max-w-4xl mx-auto py-8">
            <SettingsHeader />
            <SettingsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="mt-8">
                {activeTab === 'account' && <AccountTab />}
                {activeTab === 'preferences' && <PreferencesTab />}
            </div>
        </div>
    );
}
