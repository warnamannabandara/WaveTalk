"use client";

const ProjectList = () => {
    const projects = [
        { name: 'Marketing', completedTasks: 0, totalTasks: 1, progress: 0 },
        { name: 'Development', completedTasks: 1, totalTasks: 2, progress: 50 },
        { name: 'Sales', completedTasks: 0, totalTasks: 1, progress: 0 },
        { name: 'Design', completedTasks: 1, totalTasks: 1, progress: 100 },
    ];

    return (
        <div className="bg-[#1A231F] rounded-2xl p-8 border border-[#2A3430]">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-medium text-white">Projects</h2>
                <button className="text-sm text-gray-400 hover:text-white transition-colors bg-[#2A3430] px-4 py-1.5 rounded-lg border border-white/5">
                    View All
                </button>
            </div>

            <div className="space-y-6">
                {projects.map((project) => (
                    <div key={project.name} className="space-y-3 p-6 bg-[#141B18] border border-[#2A3430] rounded-2xl hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-white">{project.name}</h3>
                            <span className="text-sm text-gray-500">{project.completedTasks}/{project.totalTasks} tasks</span>
                        </div>
                        <div className="h-2 w-full bg-[#1A231F] rounded-full overflow-hidden border border-[#2A3430]">
                            <div
                                className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                                style={{ width: `${project.progress}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectList;
