'use client';

import { useState, useEffect } from 'react';
import { Loader2, FileText, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PeerReviewPanel } from './PeerReviewPanel';

interface PeerReviewTabProps {
    studentId: string;
    studentName: string;
}

interface AssignmentWithReview {
    id: string;
    title: string;
    deadline: string;
    reviewed: boolean;
}

export function PeerReviewTab({ studentId, studentName }: PeerReviewTabProps) {
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState<AssignmentWithReview[]>([]);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

    useEffect(() => {
        fetchAssignmentsWithPeerReview();
    }, [studentId]);

    const fetchAssignmentsWithPeerReview = async () => {
        setLoading(true);
        try {
            // Get all peer reviews assigned to this student
            const { data, error } = await supabase
                .from('peer_reviews')
                .select(`
                    id,
                    assignment_id,
                    reviewed_at,
                    assignments (id, title, deadline)
                `)
                .eq('reviewer_id', studentId);

            if (error) throw error;

            const assignmentsMap = new Map<string, AssignmentWithReview>();

            (data || []).forEach((pr: any) => {
                if (pr.assignments) {
                    assignmentsMap.set(pr.assignment_id, {
                        id: pr.assignment_id,
                        title: pr.assignments.title,
                        deadline: pr.assignments.deadline,
                        reviewed: !!pr.reviewed_at,
                    });
                }
            });

            setAssignments(Array.from(assignmentsMap.values()));
        } catch (error) {
            console.error('Error fetching peer reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white/5 backdrop-blur-md p-12 rounded-[2.5rem] border border-white/10 flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-purple-400" />
            </div>
        );
    }

    if (assignments.length === 0) {
        return (
            <div className="bg-white/5 backdrop-blur-md p-12 rounded-[2.5rem] border border-white/10 text-center">
                <Users size={48} className="mx-auto text-slate-500 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Belum Ada Peer Review</h3>
                <p className="text-slate-400">Anda belum ditugaskan untuk mereview tugas teman.</p>
            </div>
        );
    }

    // If an assignment is selected, show the review panel
    if (selectedAssignmentId) {
        const assignment = assignments.find(a => a.id === selectedAssignmentId);
        return (
            <div className="space-y-6">
                <button
                    type="button"
                    onClick={() => setSelectedAssignmentId(null)}
                    className="text-indigo-400 font-bold hover:underline flex items-center gap-2"
                >
                    ← Kembali ke Daftar
                </button>
                <h3 className="text-xl font-bold text-white">{assignment?.title}</h3>
                <PeerReviewPanel
                    assignmentId={selectedAssignmentId}
                    studentId={studentId}
                    studentName={studentName}
                />
            </div>
        );
    }

    // Show list of assignments with peer reviews
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
                <Users size={24} className="text-purple-400" />
                <h2 className="text-xl font-bold text-white">Peer Review Anda</h2>
            </div>

            <div className="grid gap-4">
                {assignments.map((assignment) => (
                    <button
                        key={assignment.id}
                        type="button"
                        onClick={() => setSelectedAssignmentId(assignment.id)}
                        className={`w-full p-6 rounded-2xl border text-left transition-all ${assignment.reviewed
                                ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${assignment.reviewed ? 'bg-emerald-500/20' : 'bg-purple-500/20'
                                    }`}>
                                    <FileText size={24} className={assignment.reviewed ? 'text-emerald-400' : 'text-purple-400'} />
                                </div>
                                <div>
                                    <p className="font-bold text-white">{assignment.title}</p>
                                    <p className="text-sm text-slate-400">
                                        Deadline: {new Date(assignment.deadline).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${assignment.reviewed
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-amber-500 text-white'
                                }`}>
                                {assignment.reviewed ? 'Selesai' : 'Belum'}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
