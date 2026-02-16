"use client";

import AdminHeader from "@/components/admin/AdminHeader";
import UserStats from "@/components/admin/user/UserStats";
import UserList from "@/components/admin/user/UserList";

export default function AdminUserPage() {
    return (
        <div className="space-y-6">
            <AdminHeader />
            <UserStats />
            <UserList />
        </div>
    );
}
