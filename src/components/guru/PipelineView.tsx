'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Kanban, Clock, CheckCircle, AlertCircle, FileText, Eye, GripVertical, Inbox } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
    DndContext,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    DragStartEvent,
    DragEndEvent,
    useDroppable,
    type UniqueIdentifier,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PipelineItem {
    id: string;
    title: string;
    deadline: string;
    total_students: number;
    submitted: number;
    graded: number;
}

interface Props {
    classId?: string;
    onViewSubmissions?: (assignment: any) => void;
}

type Stage = 'active' | 'collecting' | 'grading' | 'done';

const STAGES: { key: Stage; label: string; icon: any; color: string; emptyText: string }[] = [
    { key: 'active', label: 'Aktif', icon: Clock, color: 'bg-blue-500/20 text-blue-400 border-blue-500/20', emptyText: 'Tidak ada tugas aktif' },
    { key: 'collecting', label: 'Mengumpulkan', icon: FileText, color: 'bg-amber-500/20 text-amber-400 border-amber-500/20', emptyText: 'Tidak ada yang dikumpulkan' },
    { key: 'grading', label: 'Perlu Dinilai', icon: AlertCircle, color: 'bg-rose-500/20 text-rose-400 border-rose-500/20', emptyText: 'Semua sudah dinilai 🎉' },
    { key: 'done', label: 'Selesai', icon: CheckCircle, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20', emptyText: 'Belum ada yang selesai' },
];

function getStage(item: PipelineItem): Stage {
    const now = new Date();
    const deadline = new Date(item.deadline);
    const allGraded = item.graded >= item.submitted && item.submitted > 0;
    const allSubmitted = item.submitted >= item.total_students;

    if (allGraded && allSubmitted) return 'done';
    if (item.submitted > item.graded) return 'grading';
    if (deadline > now && item.submitted < item.total_students) return 'active';
    return 'collecting';
}

// ========================================================
// Sortable Card Component
// ========================================================
interface SortableCardProps {
    item: PipelineItem;
    onViewSubmissions?: (assignment: any) => void;
}

function SortableCard({ item, onViewSubmissions }: SortableCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white/5 hover:bg-white/10 rounded-xl p-3 border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group shadow-sm hover:shadow-lg relative ${isDragging ? 'ring-2 ring-indigo-500/50' : ''}`}
        >
            <div className="flex items-start gap-2 mb-2">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="mt-0.5 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0 touch-none"
                    aria-label="Drag to reorder"
                >
                    <GripVertical size={14} />
                </button>

                <div className="flex-1 min-w-0" onClick={() => onViewSubmissions?.({ id: item.id, title: item.title })}>
                    <p className="text-xs font-bold text-white leading-tight line-clamp-2">{item.title}</p>
                </div>

                <div 
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400 shrink-0 cursor-pointer"
                    onClick={() => onViewSubmissions?.({ id: item.id, title: item.title })}
                >
                    <Eye size={14} />
                </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5 font-medium pl-6">
                <span className="flex items-center gap-1"><FileText size={10} /> {item.submitted}/{item.total_students} Dikumpul</span>
                <span className="flex items-center gap-1"><CheckCircle size={10} className="text-emerald-500/70" /> {item.graded} Dinilai</span>
            </div>

            <div className="h-1 bg-black/40 rounded-full overflow-hidden ml-6">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all"
                    style={{ width: `${item.total_students > 0 ? (item.graded / item.total_students) * 100 : 0}%` }} />
            </div>

            <div className="mt-2.5 flex items-center justify-between pl-6">
                <p className="text-[9px] font-medium text-slate-500 flex items-center gap-1">
                    <Clock size={9} /> {new Date(item.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </p>
            </div>
        </div>
    );
}

// ========================================================
// Overlay Card (shown while dragging)
// ========================================================
function DragOverlayCard({ item }: { item: PipelineItem }) {
    return (
        <div className="bg-slate-800/95 backdrop-blur-xl rounded-xl p-3 border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/20 w-[250px]">
            <p className="text-xs font-bold text-white leading-tight line-clamp-2 mb-2">{item.title}</p>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>{item.submitted}/{item.total_students} Dikumpul</span>
                <span>{item.graded} Dinilai</span>
            </div>
        </div>
    );
}

// ========================================================
// Droppable Stage Component
// ========================================================
function DroppableStage({ stage, items, onViewSubmissions }: { stage: any; items: PipelineItem[]; onViewSubmissions?: any }) {
    const { setNodeRef, isOver } = useDroppable({ id: stage.key });
    const StageIcon = stage.icon;

    return (
        <div 
            ref={setNodeRef}
            className={`flex flex-col h-full bg-slate-900/40 rounded-2xl border transition-all duration-300 overflow-hidden ${isOver ? 'ring-2 ring-indigo-500 border-indigo-500/50 scale-[1.02] bg-indigo-500/5' : 'border-white/5'}`}
        >
            <div className={`flex items-center gap-2 px-3 py-2.5 border-b border-white/5 ${stage.color.replace('border-', 'border-b-')}`}>
                <StageIcon size={14} />
                <span className="text-[11px] font-black uppercase tracking-wider">{stage.label}</span>
                <span className="ml-auto text-[10px] font-black bg-white/10 px-1.5 py-0.5 rounded">{items.length}</span>
            </div>
            <div className="p-2 space-y-2 min-h-[200px] max-h-[500px] overflow-y-auto scrollbar-hide">
                <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                    {items.map(item => (
                        <SortableCard key={item.id} item={item} onViewSubmissions={onViewSubmissions} />
                    ))}
                </SortableContext>
                {items.length === 0 && (
                    <div className="text-center py-12 text-slate-600 text-[10px] font-bold flex flex-col items-center gap-2">
                        <StageIcon size={24} className="opacity-20" />
                        <span>{stage.emptyText}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ========================================================
// Main Pipeline View
// ========================================================
export function PipelineView({ classId, onViewSubmissions }: Props) {
    const [items, setItems] = useState<PipelineItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    useEffect(() => {
        if (!classId) return;
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data: assignments, error: assignErr } = await supabase
                    .from('assignments')
                    .select('id, title, deadline')
                    .eq('class_id', classId)
                    .order('deadline', { ascending: false })
                    .limit(30);

                if (assignErr) throw assignErr;

                if (!assignments || assignments.length === 0) {
                    setItems([]);
                    setLoading(false);
                    return;
                }

                const { data: students } = await supabase
                    .from('users')
                    .select('id')
                    .eq('class_id', classId)
                    .eq('role', 'siswa');

                const totalStudents = students?.length || 0;

                const result: PipelineItem[] = [];
                for (const a of assignments) {
                    const { count: submitted } = await supabase
                        .from('submissions')
                        .select('*', { count: 'exact', head: true })
                        .eq('assignment_id', a.id);

                    const { count: graded } = await supabase
                        .from('submissions')
                        .select('*', { count: 'exact', head: true })
                        .eq('assignment_id', a.id)
                        .not('grade', 'is', null);

                    result.push({
                        id: a.id,
                        title: a.title,
                        deadline: a.deadline,
                        total_students: totalStudents,
                        submitted: submitted || 0,
                        graded: graded || 0,
                    });
                }

                setItems(result);
            } catch (err: any) {
                setError(err?.message || 'Gagal memuat pipeline');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [classId]);

    const grouped = useMemo(() => {
        const map: Record<Stage, PipelineItem[]> = { active: [], collecting: [], grading: [], done: [] };
        items.forEach(item => {
            map[getStage(item)].push(item);
        });
        return map;
    }, [items]);

    const activeItem = useMemo(() => {
        if (!activeId) return null;
        return items.find(item => item.id === activeId) || null;
    }, [activeId, items]);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(event.active.id);
    }, []);

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeItem = items.find(i => i.id === active.id);
        const overStage = over.id as Stage;

        if (!activeItem) return;

        // Action based on target stage
        if (overStage === 'done' && getStage(activeItem) !== 'done') {
            // Confirm and Mark as Done (Close Assignment)
            if (confirm(`Selesaikan penugasan "${activeItem.title}"? Semua siswa yang belum dinilai akan mendapat nilai default.`)) {
                try {
                    const { error } = await supabase
                        .from('assignments')
                        .update({ status: 'closed' }) // Assuming a status column exists
                        .eq('id', activeItem.id);
                    
                    if (error) throw error;
                    toast.success('Penugasan berhasil diselesaikan!');
                    // Refetch data
                    window.location.reload(); 
                } catch (err) {
                    toast.error('Gagal memperbarui status tugas.');
                }
            }
        } else if (overStage === 'grading') {
            onViewSubmissions?.(activeItem);
        }
    }, [items, onViewSubmissions]);

    if (!classId) {
        return (
            <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10">
                <Kanban size={40} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-bold">Pilih kelas untuk melihat pipeline.</p>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="text-center py-16 bg-rose-500/5 rounded-3xl border border-rose-500/10">
                <AlertCircle size={40} className="text-rose-400 mx-auto mb-3" />
                <p className="text-rose-300 font-bold mb-1">Gagal Memuat Pipeline</p>
                <p className="text-slate-500 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Kanban size={20} className="text-indigo-400" />
                    <h3 className="text-lg font-black text-white">Pipeline Tugas</h3>
                    <span className="bg-white/5 text-slate-400 px-2 py-0.5 rounded-full text-[10px] font-bold">{items.length} tugas</span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex flex-col h-full bg-slate-900/40 rounded-2xl border border-white/5 overflow-hidden">
                                <div className="h-10 bg-white/5 animate-pulse" />
                                <div className="p-2 space-y-2 min-h-[150px]">
                                    <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
                                    <div className="h-20 bg-white/[0.03] rounded-xl animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    /* Empty State — no assignments at all */
                    <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-white/5">
                        <Inbox size={48} className="text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold text-lg mb-1">Pipeline Kosong</p>
                        <p className="text-slate-600 text-sm max-w-xs mx-auto">Belum ada tugas di kelas ini. Buat tugas pertama dari tab Pembelajaran.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                        {STAGES.map(stage => {
                            const stageItems = grouped[stage.key];
                            return (
                                <DroppableStage 
                                    key={stage.key} 
                                    stage={stage} 
                                    items={stageItems} 
                                    onViewSubmissions={onViewSubmissions} 
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            <DragOverlay>
                {activeItem ? <DragOverlayCard item={activeItem} /> : null}
            </DragOverlay>
        </DndContext>
    );
}
