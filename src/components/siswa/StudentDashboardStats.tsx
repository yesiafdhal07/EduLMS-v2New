import { Layers, Loader2, CheckCircle, Upload, Clock } from 'lucide-react';
// Force refresh
import { StudentAssignment, StudentUser } from '@/types';

interface StudentStatsPanelProps {
    user: StudentUser | null;
    assignments: StudentAssignment[];
    uploading: string | null;
    onUpload: (assignmentId: string, event: React.ChangeEvent<HTMLInputElement>, format: string) => void;
}

export function StudentDashboardStats({ user, assignments, uploading, onUpload }: StudentStatsPanelProps) {
    const completedCount = assignments.filter(a => (a.submissions?.length || 0) > 0).length;
    const totalCount = assignments.length || 1;
    const progressPercentage = (completedCount / totalCount) * 100;

    return (
        <section className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Progress Card - Emerald Theme */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-emerald-200/50 relative overflow-hidden group">
                <div className="relative z-10">
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.3em]">Progress Semester</p>
                    <h3 className="text-5xl font-black mt-2 tracking-tight">
                        {completedCount}/{assignments.length} <span className="text-2xl font-bold text-white/80">Tugas</span>
                    </h3>
                    <div className="w-full bg-white/20 h-3 rounded-full mt-8 overflow-hidden">
                        <div
                            className="bg-white h-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.7)] rounded-full"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                    <p className="text-white/60 text-xs mt-4 font-bold">Terus semangat! Kamu hebat! 💪</p>
                </div>
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
            </div>

            {/* Assignments Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
                        <Layers size={20} className="text-emerald-400" />
                    </div>
                    <h2 className="text-xl font-black text-white tracking-tight">Tugas Terkini</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {assignments.slice(0, 3).map((assignment) => {
                        const submission = assignment.submissions?.[0];

                        // Deadline Logic
                        const deadlineDate = new Date(assignment.deadline);
                        const gracePeriod = new Date(deadlineDate);
                        gracePeriod.setDate(deadlineDate.getDate() + 1); // +1 day grace period

                        const now = new Date();
                        const isLate = now > deadlineDate;
                        const isClosed = now > gracePeriod;

                        // Calculate days remaining
                        const diffTime = deadlineDate.getTime() - now.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        return (
                            <div key={assignment.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden relative">
                                <div className={`absolute top-0 left-0 w-1.5 h-full rounded-l-[2.5rem] ${isClosed ? 'bg-slate-300' : 'bg-emerald-500'}`}></div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 className="font-black text-slate-900 text-lg leading-tight group-hover:text-emerald-600 transition-colors">{assignment.title}</h4>
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                <span className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold uppercase tracking-widest">.{assignment.required_format}</span>
                                                {!isClosed && (
                                                    <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest ${diffDays < 0 ? 'bg-rose-50 text-rose-500' :
                                                        diffDays <= 1 ? 'bg-orange-50 text-orange-500' :
                                                            'bg-emerald-50 text-emerald-600'
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

                                    {/* Upload Button Section */}
                                    {isClosed && !submission ? (
                                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest cursor-not-allowed">
                                            <Clock size={16} />
                                            <span>Waktu Habis</span>
                                        </div>
                                    ) : (
                                        <label className={`flex items-center justify-center gap-3 p-4 text-sm font-black rounded-2xl transition-all cursor-pointer ${submission ? 'bg-slate-50 text-slate-400' :
                                            'bg-emerald-500 text-white shadow-xl shadow-emerald-200 hover:bg-emerald-600 active:scale-95'
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
                </div>

                {assignments.length === 0 && (
                    <div className="bg-white p-16 rounded-[3rem] border border-slate-100 shadow-xl text-center">
                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={32} className="text-emerald-500" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Tidak ada tugas saat ini</p>
                    </div>
                )}
            </div>

            {assignments.length > 3 && (
                <div className="text-center pb-8">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                        + {assignments.length - 3} tugas lainnya. Buka menu <span className="text-indigo-600">Tugas</span> untuk melihat semua.
                    </p>
                </div>
            )}
        </section>
    );
}
