'use client';

import { AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface Task {
    id: string;
    title: string;
    deadline: string;
}

export function DeadlineBanner({ tasks }: { tasks: Task[] }) {
    if (!tasks || tasks.length === 0) return null;

    // Only show for tasks deadline < 24 hours
    const urgentTasks = tasks.filter(t => {
        const diff = new Date(t.deadline).getTime() - Date.now();
        return diff > 0 && diff < 24 * 60 * 60 * 1000;
    });

    if (urgentTasks.length === 0) return null;

    const task = urgentTasks[0]; // Show the most urgent one

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start sm:items-center gap-4 animate-pulse">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 text-amber-600">
                <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-amber-900">Deadline Segera Berakhir!</h4>
                <p className="text-amber-700 text-sm">
                    Tugas <span className="font-bold">"{task.title}"</span> harus dikumpulkan dalam {formatDistanceToNow(new Date(task.deadline), { locale: id })}.
                </p>
            </div>
            <Link
                href={`/siswa?tab=assignments`}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap"
            >
                Kumpulkan
                <ArrowRight size={16} />
            </Link>
        </div>
    );
}
