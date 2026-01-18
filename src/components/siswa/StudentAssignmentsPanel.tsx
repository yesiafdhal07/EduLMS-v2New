import { Layers, Loader2, CheckCircle, Upload, Clock, Star, MessageCircle } from 'lucide-react';
import { StudentAssignment } from '@/types';

interface StudentAssignmentsPanelProps {
    assignments: StudentAssignment[];
    uploading: string | null;
    onUpload: (assignmentId: string, event: React.ChangeEvent<HTMLInputElement>, format: string) => void;
}

export function StudentAssignmentsPanel({ assignments, uploading, onUpload }: StudentAssignmentsPanelProps) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
            <div className="bg-white/5 backdrop-blur-md p-10 rounded-[3rem] border border-white/10 shadow-xl shadow-black/20">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                        <Layers size={28} className="text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Daftar Tugas</h2>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Kelola dan kumpulkan tugas tepat waktu</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {assignments.map((assignment) => {
                        const submission = assignment.submissions?.[0];
                        const grade = submission?.grades;

                        // Deadline Logic
                        const deadlineDate = new Date(assignment.deadline);
                        const gracePeriod = new Date(deadlineDate);
                        gracePeriod.setDate(deadlineDate.getDate() + 1); // +1 day grace period

                        const now = new Date();
                        const isLate = now > deadlineDate;
                        const isClosed = now > gracePeriod;

                        // Calculate days remaining
                        const diffTime = deadlineDate.getTime() - now.getTime();
                        const diffDays = Math.ceil(diffTime);
                        return (
                            <div key={assignment.id} className="bg-white/5 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 shadow-xl shadow-indigo-900/10 hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative hover:bg-white/10">
                                <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-[2.5rem] ${isClosed ? 'bg-slate-600' : 'bg-indigo-500'}`}></div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 className="font-black text-white text-lg leading-tight group-hover:text-indigo-300 transition-colors">{assignment.title}</h4>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                <span className="text-[10px] bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-white/10">.{assignment.required_format}</span>
                                                {!isClosed && (
                                                    <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest ${diffDays < 0 ? 'bg-rose-900/50 text-rose-300 border border-rose-500/20' :
                                                        diffDays <= 1 ? 'bg-orange-900/50 text-orange-300 border border-orange-500/20' :
                                                            'bg-emerald-900/50 text-emerald-300 border border-emerald-500/20'
                                                        }`}>
                                                        {diffDays < 0 ? 'Telat' : `H-${diffDays}`}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-wider">
                                                Deadline: {deadlineDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-[0.2em] ${submission ? 'bg-emerald-500 text-white' :
                                            isClosed ? 'bg-slate-200 text-slate-500' :
                                                'bg-orange-100 text-orange-600'
                                            }`}>
                                            {submission ? 'Selesai' : isClosed ? 'Ditutup' : 'Baru'}
                                        </div>
                                    </div>

                                    {/* Grade Display Section */}
                                    {grade?.score !== undefined && grade?.score !== null && (
                                        <div className={`mb-6 p-4 border rounded-2xl ${grade.score >= 88
                                            ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
                                            : 'bg-gradient-to-r from-rose-50 to-red-50 border-rose-200'
                                            }`}>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-inner ${grade.score >= 88 ? 'ring-2 ring-amber-300' : 'ring-2 ring-rose-300'
                                                    }`}>
                                                    <span className={`text-2xl font-black ${grade.score >= 88 ? 'text-amber-600' : 'text-rose-600'
                                                        }`}>{grade.score}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Star size={14} className={grade.score >= 88 ? 'text-amber-500' : 'text-rose-400'} />
                                                        <span className={`text-xs font-black uppercase tracking-widest ${grade.score >= 88 ? 'text-amber-700' : 'text-rose-700'
                                                            }`}>Nilai {grade.type === 'sumatif' ? 'Sumatif' : 'Formatif'}</span>
                                                    </div>
                                                    {grade.feedback && (
                                                        <div className="flex items-start gap-2 mt-2">
                                                            <MessageCircle size={12} className="text-slate-400 mt-0.5 shrink-0" />
                                                            <p className="text-xs text-slate-600 leading-relaxed">{grade.feedback}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Upload Button Section */}
                                    {isClosed && !submission ? (
                                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest cursor-not-allowed">
                                            <Clock size={16} />
                                            <span>Waktu Habis</span>
                                        </div>
                                    ) : (
                                        <label className={`flex items-center justify-center gap-3 p-4 text-sm font-black rounded-2xl transition-all cursor-pointer ${submission ? 'bg-slate-50 text-slate-400' :
                                            'bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95'
                                            }`}>
                                            {uploading === assignment.id ? <Loader2 className="animate-spin" size={16} /> : (submission ? <CheckCircle size={16} /> : <Upload size={16} />)}
                                            <span className="uppercase tracking-widest text-xs">
                                                {uploading === assignment.id ? 'Mengirim...' : (submission ? 'Sudah Terkirim' : 'Kirim Jawaban')}
                                            </span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => onUpload(assignment.id, e, assignment.required_format)}
                                                disabled={!!submission || isClosed}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {assignments.length === 0 && (
                        <div className="col-span-full bg-slate-50 p-16 rounded-[2.5rem] border border-slate-100 text-center">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <CheckCircle size={32} className="text-slate-300" />
                            </div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Belum ada tugas yang diberikan</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
