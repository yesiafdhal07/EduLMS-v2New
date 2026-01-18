import { useState } from 'react';
import { XCircle, Upload, Loader2, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { NewMaterialForm } from '@/types';

// Helper to extract error message safely
function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
}

interface MaterialModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    subjectId: string | null;
    classId: string | null;
}

const initialFormState: NewMaterialForm = {
    title: '',
    type: 'file',
    content: '',
    url: ''
};

export function MaterialModal({
    isOpen,
    onClose,
    onSuccess,
    subjectId,
    classId
}: MaterialModalProps) {
    const [form, setForm] = useState<NewMaterialForm>(initialFormState);
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // File validation constants
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_FILE_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];
    const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];

    // Handle file upload with validation
    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            toast.error('File terlalu besar! Maksimal 10MB.');
            e.target.value = ''; // Reset input
            return;
        }

        // Validate file type
        const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
        const isValidType = ALLOWED_FILE_TYPES.includes(file.type) ||
            ALLOWED_EXTENSIONS.includes(fileExtension);

        if (!isValidType) {
            toast.error('Format file tidak didukung! Gunakan PDF, Word, atau PowerPoint.');
            e.target.value = '';
            return;
        }

        setUploading(true);
        try {
            // Sanitize filename to prevent path traversal
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `materials/${Date.now()}-${safeName}`;
            const { error } = await supabase.storage.from('materials').upload(fileName, file);
            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage.from('materials').getPublicUrl(fileName);
            setForm(prev => ({ ...prev, url: publicUrl }));
            toast.success('File berhasil diupload!');
        } catch (error: unknown) {
            toast.error(`Upload gagal: ${getErrorMessage(error)}`);
        } finally {
            setUploading(false);
        }
    }

    // Submit material
    async function handleSubmit() {
        if (!form.title || !form.url) {
            toast.warning('Judul dan URL/File wajib diisi!');
            return;
        }

        setSubmitting(true);
        try {
            // Get or create subject if needed
            let finalSubjectId = subjectId;

            if (!finalSubjectId && classId) {
                const { data: existingSubject } = await supabase
                    .from('subjects')
                    .select('id')
                    .eq('class_id', classId)
                    .maybeSingle();

                if (existingSubject) {
                    finalSubjectId = existingSubject.id;
                } else {
                    const { data: newSubject, error } = await supabase
                        .from('subjects')
                        .insert({ title: 'Matematika Umum', class_id: classId })
                        .select()
                        .single();
                    if (error) throw error;
                    finalSubjectId = newSubject.id;
                }
            }

            if (!finalSubjectId) {
                toast.warning('Tidak ada subject yang tersedia. Pilih kelas terlebih dahulu.');
                return;
            }

            const { error } = await supabase.from('materials').insert({
                title: form.title,
                content: form.content,
                content_url: form.url,
                type: form.type,
                subject_id: finalSubjectId
            });

            if (error) throw error;

            setForm(initialFormState);
            onSuccess();
            onClose();
            toast.success('Materi berhasil ditambahkan!');
        } catch (error: unknown) {
            toast.error(`Gagal menyimpan: ${getErrorMessage(error)}`);
        } finally {
            setSubmitting(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                onClick={onClose}
                aria-hidden="true"
            />
            <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                        Tambah Materi Baru
                    </h3>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                        aria-label="Tutup modal"
                    >
                        <XCircle size={24} />
                    </button>
                </div>

                <div className="p-10 space-y-8">
                    {/* Title */}
                    <div className="space-y-3">
                        <label htmlFor="material-title" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                            Judul Materi
                        </label>
                        <input
                            id="material-title"
                            type="text"
                            placeholder="Contoh: Integral Lipat Dua"
                            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all text-slate-900 placeholder:text-slate-400"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                        />
                    </div>

                    {/* Type Toggle */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, type: 'file' })}
                            className={`py-6 rounded-2xl border-2 font-black transition-all flex items-center justify-center gap-3 ${form.type === 'file' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-200' : 'bg-white text-slate-400 border-slate-100'}`}
                        >
                            <Upload size={20} />
                            <span>FILE MODUL</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setForm({ ...form, type: 'link' })}
                            className={`py-6 rounded-2xl border-2 font-black transition-all flex items-center justify-center gap-3 ${form.type === 'link' ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-200' : 'bg-white text-slate-400 border-slate-100'}`}
                        >
                            <LinkIcon size={20} />
                            <span>LINK EXTERNAL</span>
                        </button>
                    </div>

                    {/* File or Link Input */}
                    {form.type === 'file' ? (
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                                Upload File (PDF/DOCX)
                            </label>
                            <label className="flex flex-col items-center justify-center w-full h-40 border-4 border-dashed border-slate-100 rounded-[2.5rem] cursor-pointer hover:bg-slate-50 transition-all relative overflow-hidden group">
                                {uploading ? (
                                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                                ) : form.url ? (
                                    <div className="flex flex-col items-center text-emerald-500 font-black">
                                        <CheckCircle2 size={40} />
                                        <span className="mt-2 uppercase text-xs">File Siap!</span>
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={32} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                        <span className="mt-4 text-xs font-bold text-slate-400">Pilih file dari perangkat</span>
                                    </>
                                )}
                                <input type="file" className="hidden" onChange={handleFileUpload} />
                            </label>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <label htmlFor="material-url" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                                URL Link (Canva/Google Drive)
                            </label>
                            <input
                                id="material-url"
                                type="url"
                                placeholder="https://..."
                                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all text-slate-900 placeholder:text-slate-400"
                                value={form.url}
                                onChange={(e) => setForm({ ...form, url: e.target.value })}
                            />
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-3">
                        <label htmlFor="material-content" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                            Keterangan Tambahan (Opsional)
                        </label>
                        <textarea
                            id="material-content"
                            placeholder="Apa isi materi ini?"
                            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold transition-all h-32 resize-none text-slate-900 placeholder:text-slate-400"
                            value={form.content}
                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-10 bg-slate-50 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-5 bg-white border border-slate-200 text-slate-500 font-black rounded-2xl hover:bg-slate-100 transition-all"
                    >
                        BATAL
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={uploading || submitting}
                        className="flex-[2] py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all uppercase tracking-widest disabled:opacity-50"
                    >
                        {submitting ? 'MENYIMPAN...' : 'Simpan & Publikasikan'}
                    </button>
                </div>
            </div>
        </div>
    );
}
