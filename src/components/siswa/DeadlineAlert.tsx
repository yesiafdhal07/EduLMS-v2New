'use client';

import { AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface Assignment {
    id: string;
    title: string;
    deadline: string;
}

interface DeadlineAlertProps {
    assignments: Assignment[];
    onViewAssignment?: (id: string) => void;
}

export function DeadlineAlert({ assignments, onViewAssignment }: DeadlineAlertProps) {
    const now = new Date();

    // Filter assignments with deadline within 48 hours
    const urgentAssignments = assignments.filter(a => {
        const deadline = new Date(a.deadline);
        const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursUntilDeadline > 0 && hoursUntilDeadline <= 48;
    });

    if (urgentAssignments.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 mb-6 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                    <AlertTriangle size={24} className="text-amber-600" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-amber-800 mb-1">⚠️ Deadline Mendekat!</h4>
                    <p className="text-amber-700 text-sm mb-4">
                        Kamu punya {urgentAssignments.length} tugas yang deadline-nya dalam 48 jam
                    </p>

                    <div className="space-y-2">
                        {urgentAssignments.map(assignment => {
                            const deadline = new Date(assignment.deadline);
                            const hoursLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
                            const isVeryUrgent = hoursLeft <= 12;

                            return (
                                <div
                                    key={assignment.id}
                                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${isVeryUrgent
                                            ? 'bg-rose-100 hover:bg-rose-200'
                                            : 'bg-white hover:bg-amber-100'
                                        }`}
                                    onClick={() => onViewAssignment?.(assignment.id)}
                                    onKeyDown={(e) => e.key === 'Enter' && onViewAssignment?.(assignment.id)}
                                    tabIndex={0}
                                    role="button"
                                >
                                    <div className="flex items-center gap-3">
                                        <Clock size={16} className={isVeryUrgent ? 'text-rose-600' : 'text-amber-600'} />
                                        <span className={`font-medium text-sm ${isVeryUrgent ? 'text-rose-800' : 'text-amber-800'}`}>
                                            {assignment.title}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold ${isVeryUrgent ? 'text-rose-600' : 'text-amber-600'}`}>
                                            {formatDistanceToNow(deadline, { locale: id, addSuffix: true })}
                                        </span>
                                        <ChevronRight size={16} className="text-slate-400" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
