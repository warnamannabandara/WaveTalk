import Sidebar from '../../components/dashboard/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-[#15231D] text-white overflow-hidden font-sans">
            {/* Sidebar - Fixed width */}
            <aside className="w-64 flex-shrink-0">
                <Sidebar />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header could go here if global */}
                <div className="flex-1 overflow-auto bg-[#15231D]">
                    {children}
                </div>
            </main>
        </div>
    );
}
