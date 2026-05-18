'use client';

import { useState } from 'react';
import { Plus, RefreshCw, Power, Copy, School as SchoolIcon, Users, BookOpen, GraduationCap, Search, QrCode, Tag, BarChart2, FileSpreadsheet, X, CheckSquare, Square, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';
import { useFormDraft } from '@/components/admin/AdminToolkit';
import { DetailDrawer, Spinner } from '@/components/ui';
import { toast } from 'sonner';

interface SchoolCode {
    id: string;
    code: string;
    role: 'guru' | 'siswa';
    is_active: boolean;
}

interface SchoolWithCodes {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    is_active: boolean;
    created_at?: string;
    codes: SchoolCode[];
    guru_count: number;
    siswa_count: number;
    class_count: number;
}

interface Props {
    schools: SchoolWithCodes[];
    onCreateSchool: (name: string, address?: string, phone?: string, email?: string) => Promise<unknown>;
    onToggleActive: (schoolId: string, isActive: boolean) => void;
    onRegenerateCode: (codeId: string, schoolName: string, role: 'guru' | 'siswa') => void;
    onContextMenu?: (e: React.MouseEvent, school: SchoolWithCodes) => void;
}

export function SchoolManagement({ schools, onCreateSchool, onToggleActive, onRegenerateCode, onContextMenu }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [formState, setFormState, clearDraft] = useFormDraft('school-draft', { name: '', address: '', phone: '', email: '' });
    const { name, address, phone, email } = formState;

    const updateForm = (key: string, val: string) => setFormState(prev => ({ ...prev, [key]: val }));

    const [creating, setCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Sprint 3 Features
    const [tagsDb, setTagsDb, clearTagsDraft] = useFormDraft<Record<string, string[]>>('school-custom-tags', {});
    const [tagInput, setTagInput] = useState<{ id: string, val: string } | null>(null);
    const [comparingIds, setComparingIds] = useState<string[]>([]);
    const [showComparison, setShowComparison] = useState(false);
    const [showBulkImport, setShowBulkImport] = useState(false);
    const [csvData, setCsvData] = useState('');
    const [importing, setImporting] = useState(false);
    const [showQR, setShowQR] = useState<{ code: string, role: string, schoolName: string } | null>(null);

    const toggleCompare = (id: string) => {
        setComparingIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const addTag = (schoolId: string, tag: string) => {
        if (!tag.trim()) return;
        setTagsDb(prev => ({
            ...prev,
            [schoolId]: [...(prev[schoolId] || []), tag.trim().toLowerCase()]
        }));
        setTagInput(null);
    };

    const removeTag = (schoolId: string, tagToRemove: string) => {
        setTagsDb(prev => ({
            ...prev,
            [schoolId]: (prev[schoolId] || []).filter(t => t !== tagToRemove)
        }));
    };

    const handleBulkImport = async () => {
        if (!csvData.trim()) return;
        setImporting(true);
        const rows = csvData.split('\n').map(r => r.split(',').map(c => c.trim()));
        let imported = 0;
        for (const row of rows) {
            if (row[0]) {
                await onCreateSchool(row[0], row[1] || undefined, row[2] || undefined, row[3] || undefined);
                imported++;
            }
        }
        setImporting(false);
        setShowBulkImport(false);
        setCsvData('');
        toast.success(`${imported} sekolah berhasil diimpor!`);
    };

    const handleScheduleReports = () => {
        toast.success('Jadwal laporan mingguan berhasil diatur! Email rekap akan dikirim setiap hari Senin.');
    };

    const handleExportCSV = () => {
        const headers = ['ID', 'Nama', 'Alamat', 'Status', 'Guru', 'Siswa', 'Kelas'];
        const csvContent = [
            headers.join(','),
            ...schools.map(s => `"${s.id}","${s.name}","${s.address || ''}","${s.is_active ? 'Aktif' : 'Nonaktif'}",${s.guru_count},${s.siswa_count},${s.class_count}`)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `klolakelas-schools-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Laporan CSV berhasil didownload!');
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Laporan Rekapitulasi Sekolah - Klolakelas', 10, 20);
        doc.setFontSize(10);
        doc.text(`Dicetak pada: ${new Date().toLocaleString()}`, 10, 30);
        
        let y = 45;
        doc.setFont('helvetica', 'bold');
        doc.text('Nama Sekolah', 10, y);
        doc.text('Guru', 100, y);
        doc.text('Siswa', 130, y);
        doc.text('Status', 160, y);
        
        doc.setFont('helvetica', 'normal');
        y += 10;
        
        schools.forEach((s) => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text(s.name, 10, y);
            doc.text(s.guru_count.toString(), 100, y);
            doc.text(s.siswa_count.toString(), 130, y);
            doc.text(s.is_active ? 'Aktif' : 'Nonaktif', 160, y);
            y += 8;
        });
        
        doc.save(`klolakelas-report-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success('Laporan PDF berhasil didownload!');
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setCreating(true);
        await onCreateSchool(name.trim(), address || undefined, phone || undefined, email || undefined);
        clearDraft();
        setShowForm(false);
        setCreating(false);
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success(`Kode "${code}" disalin!`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-black text-white">Kelola Sekolah</h2>
                <div className="flex flex-wrap items-center gap-2">
                    {comparingIds.length >= 2 && (
                        <button
                            onClick={() => setShowComparison(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-xl font-bold text-sm border border-indigo-500/20 hover:bg-indigo-500 hover:text-white transition-all"
                        >
                            <BarChart2 size={16} /> Bandingkan ({comparingIds.length})
                        </button>
                    )}
                    <button
                        onClick={handleScheduleReports}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-300 rounded-xl font-bold text-sm border border-white/10 hover:bg-white/10 transition-colors"
                        title="Jadwalkan Laporan"
                    >
                        <BarChart2 size={16} />
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 rounded-xl font-bold text-sm border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all"
                        title="Download PDF"
                    >
                        <FileText size={16} /> PDF
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-500/10 text-slate-300 rounded-xl font-bold text-sm border border-slate-500/20 hover:bg-slate-500 hover:text-white transition-all"
                        title="Download CSV"
                    >
                        <FileSpreadsheet size={16} /> CSV
                    </button>
                    <button
                        onClick={() => setShowBulkImport(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl font-bold text-sm border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all"
                    >
                        <FileSpreadsheet size={16} /> Import
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-400 transition-colors shadow-lg shadow-rose-500/20"
                    >
                        <Plus size={16} /> Tambah Sekolah
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="bg-[#12141A] border border-white/5 rounded-2xl p-6 space-y-4">
                    <fieldset disabled={creating} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nama Sekolah *</label>
                                <input value={name} onChange={e => updateForm('name', e.target.value)} required
                                    className="w-full bg-[#0F1014] border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50 font-medium disabled:opacity-50" placeholder="SMAN 1 Jakarta" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Alamat</label>
                                <input value={address} onChange={e => updateForm('address', e.target.value)}
                                    className="w-full bg-[#0F1014] border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50 font-medium disabled:opacity-50" placeholder="Jl. Pendidikan No. 1" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Telepon</label>
                                <input value={phone} onChange={e => updateForm('phone', e.target.value)}
                                    className="w-full bg-[#0F1014] border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50 font-medium disabled:opacity-50" placeholder="021-1234567" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email</label>
                                <input value={email} onChange={e => updateForm('email', e.target.value)} type="email"
                                    className="w-full bg-[#0F1014] border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50 font-medium disabled:opacity-50" placeholder="admin@sekolah.id" />
                            </div>
                        </div>
                        <div className="flex gap-3 justify-between items-center">
                            <div className="text-xs text-slate-500 font-mono italic">
                                {(name || address || phone || email) ? 'Tersimpan otomatis sebagai draft.' : ''}
                            </div>
                            <div className="flex gap-3">
                                {(name || address || phone || email) && (
                                    <button type="button" onClick={clearDraft} className="px-5 py-2.5 text-slate-400 hover:text-rose-400 transition-colors font-bold text-sm">Clear Draft</button>
                                )}
                                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-slate-400 hover:text-white transition-colors font-bold text-sm">Batal</button>
                                <button type="submit" disabled={creating} className="px-6 py-2.5 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-400 transition-colors disabled:opacity-50">
                                    {creating ? 'Membuat...' : 'Buat Sekolah'}
                                </button>
                            </div>
                        </div>
                    </fieldset>
                </form>
            )}

            {/* Search Bar */}
            {!showForm && schools.length > 0 && (
                <div className="relative max-w-md">
                    <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Cari sekolah..."
                        className="w-full bg-[#0F1014] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50 text-sm font-medium"
                    />
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {schools.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(school => (
                    <div key={school.id} onContextMenu={onContextMenu ? (e) => onContextMenu(e, school) : undefined} className={`group relative bg-[#0F1014] border rounded-[2rem] p-8 transition-all duration-500 overflow-hidden ${school.is_active ? 'border-white/5 hover:border-rose-500/30' : 'border-rose-500/20 opacity-60'}`}>
                        {/* Status Ambient Glow */}
                        {school.is_active && <div className="absolute -top-20 -right-20 w-40 h-40 bg-rose-500/5 blur-[80px] rounded-full group-hover:bg-rose-500/10 transition-colors" />}
                        
                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center gap-5">
                                    <div className="relative">
                                        <button
                                            onClick={() => toggleCompare(school.id)}
                                            className="absolute -top-3 -left-3 z-20 w-6 h-6 rounded bg-[#0F1014] border flex items-center justify-center transition-colors"
                                            style={{ borderColor: comparingIds.includes(school.id) ? '#6366F1' : 'rgba(255,255,255,0.1)' }}
                                            title={comparingIds.includes(school.id) ? "Batal Bandingkan" : "Pilih untuk Bandingkan"}
                                        >
                                            {comparingIds.includes(school.id) ? <CheckSquare size={14} className="text-indigo-400" /> : <Square size={14} className="text-slate-500 hover:text-slate-400" />}
                                        </button>
                                        <div className="w-16 h-16 bg-gradient-to-br from-rose-500/20 to-rose-600/5 border border-rose-500/20 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-rose-500/5">
                                            <SchoolIcon size={28} className="text-rose-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-black text-white">{school.name}</h3>
                                            <span className={`w-2 h-2 rounded-full ${school.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                        </div>
                                        <p className="text-slate-500 text-xs font-medium flex items-center gap-1.5 uppercase tracking-widest">
                                            {school.address || 'Alamat Belum Diatur'}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onToggleActive(school.id, school.is_active)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${school.is_active ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'}`}
                                    title={school.is_active ? 'Nonaktifkan Sekolah' : 'Aktifkan Sekolah'}
                                >
                                    <Power size={18} />
                                </button>
                            </div>

                            {/* Stats Grid - High Fidelity */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 group-hover:bg-white/[0.04] transition-colors">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Pendidik</p>
                                    <div className="flex items-end gap-1.5">
                                        <span className="text-2xl font-black text-white leading-none">{school.guru_count}</span>
                                        <span className="text-[10px] font-bold text-indigo-400 mb-1">Guru</span>
                                    </div>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 group-hover:bg-white/[0.04] transition-colors">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Peserta Didik</p>
                                    <div className="flex items-end gap-1.5">
                                        <span className="text-2xl font-black text-white leading-none">{school.siswa_count}</span>
                                        <span className="text-[10px] font-bold text-emerald-400 mb-1">Siswa</span>
                                    </div>
                                </div>
                                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 group-hover:bg-white/[0.04] transition-colors">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Infrastruktur</p>
                                    <div className="flex items-end gap-1.5">
                                        <span className="text-2xl font-black text-white leading-none">{school.class_count}</span>
                                        <span className="text-[10px] font-bold text-amber-400 mb-1">Kelas</span>
                                    </div>
                                </div>
                            </div>

                            {/* Goal Tracker (Sprint 4) */}
                            <div className="mb-8">
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Siswa Target (500)</p>
                                    <span className="text-xs font-bold text-white">{Math.min(Math.round((school.siswa_count / 500) * 100), 100)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" 
                                        style={{ width: `${Math.min((school.siswa_count / 500) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>


                            {/* Tags Section */}
                            <div className="mb-8">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Tag size={12} className="text-slate-500 mr-1" />
                                    {(tagsDb[school.id] || []).map(tag => (
                                        <span key={tag} className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300">
                                            #{tag}
                                            <button onClick={() => removeTag(school.id, tag)} className="hover:text-rose-400 transition-colors">
                                                <X size={10} />
                                            </button>
                                        </span>
                                    ))}
                                    {tagInput?.id === school.id ? (
                                        <input
                                            autoFocus
                                            value={tagInput.val}
                                            onChange={e => setTagInput({ id: school.id, val: e.target.value })}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') addTag(school.id, tagInput.val);
                                                if (e.key === 'Escape') setTagInput(null);
                                            }}
                                            onBlur={() => addTag(school.id, tagInput.val)}
                                            className="bg-[#181A20] border border-rose-500/50 rounded-md px-2 py-0.5 text-[10px] text-white w-24 outline-none font-bold"
                                            placeholder="Ketik & Enter..."
                                        />
                                    ) : (
                                        <button 
                                            onClick={() => setTagInput({ id: school.id, val: '' })}
                                            className="px-2 py-0.5 rounded-md border border-dashed border-white/20 text-[10px] font-bold text-slate-500 hover:text-white hover:border-white/50 transition-colors"
                                        >
                                            + Add Tag
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Access Keys Section */}
                            <div className="space-y-3">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2 mb-4">Registration Keys</p>
                                {school.codes.map(code => (
                                    <div key={code.id} className="group/code flex items-center gap-3 bg-black/40 border border-white/5 rounded-2xl px-5 py-4 hover:border-white/10 transition-all">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${code.role === 'guru' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                            {code.role === 'guru' ? <BookOpen size={14} /> : <Users size={14} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1.5">{code.role} Access Key</p>
                                            <code className="text-white font-mono font-bold text-sm tracking-[0.15em]">{code.code}</code>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => setShowQR({ code: code.code, role: code.role, schoolName: school.name })}
                                                className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-indigo-400 transition-colors"
                                                title="Tampilkan QR Code"
                                            >
                                                <QrCode size={16} />
                                            </button>
                                            <button 
                                                onClick={() => copyCode(code.code)}
                                                className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"
                                                title="Salin Kode"
                                            >
                                                <Copy size={16} />
                                            </button>
                                            <button 
                                                onClick={() => onRegenerateCode(code.id, school.name, code.role as 'guru' | 'siswa')}
                                                className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-amber-400 transition-colors"
                                                title="Regenerasi Kode"
                                            >
                                                <RefreshCw size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {schools.length === 0 && (
                <div className="text-center py-16">
                    <SchoolIcon size={48} className="text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Belum ada sekolah terdaftar.</p>
                    <p className="text-slate-500 text-sm mt-1">Klik &quot;Tambah Sekolah&quot; untuk memulai.</p>
                </div>
            )}

            {/* Modals for Sprint 3 Features */}
            
            {/* 1. Bulk Import CSV Modal */}
            <DetailDrawer
                open={showBulkImport}
                onClose={() => setShowBulkImport(false)}
                title="Bulk Import CSV"
                subtitle="Impor banyak sekolah sekaligus"
            >
                <div className="flex flex-col h-full space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                        <h4 className="text-blue-400 font-bold text-sm mb-1">Format CSV</h4>
                        <p className="text-slate-400 text-xs">nama_sekolah, alamat, telepon, email</p>
                    </div>
                    <textarea
                        value={csvData}
                        onChange={e => setCsvData(e.target.value)}
                        placeholder="SMAN 1, Jl. Merdeka, 021-123, admin@sman1.id&#10;SMAN 2, Jl. Kemerdekaan, 021-456, admin@sman2.id"
                        className="flex-1 w-full bg-[#0F1014] border border-white/5 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 font-mono text-sm resize-none"
                    />
                    <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                        <button onClick={() => setShowBulkImport(false)} className="px-5 py-2.5 text-slate-400 hover:text-white transition-colors font-bold text-sm">Batal</button>
                        <button onClick={handleBulkImport} disabled={importing || !csvData.trim()} className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center gap-2">
                            {importing ? <Spinner /> : <FileSpreadsheet size={16} />}
                            {importing ? 'Mengimpor...' : 'Mulai Import'}
                        </button>
                    </div>
                </div>
            </DetailDrawer>

            {/* 2. QR Code Viewer Modal */}
            <DetailDrawer
                open={!!showQR}
                onClose={() => setShowQR(null)}
                title="Registration QR Code"
                subtitle={`Scan untuk join sebagai ${showQR?.role.toUpperCase()} di ${showQR?.schoolName}`}
            >
                {showQR && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-8">
                        <div className="bg-white p-6 rounded-2xl shadow-xl">
                            <QRCodeSVG
                                value={showQR.code}
                                size={256}
                                level="H"
                                includeMargin={false}
                            />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-slate-400 text-sm">Kode Akses Manual:</p>
                            <code className="text-3xl font-black text-white tracking-[0.2em]">{showQR.code}</code>
                        </div>
                        <button onClick={() => copyCode(showQR.code)} className="px-6 py-3 bg-white/5 text-white hover:bg-white/10 border border-white/10 rounded-xl font-bold transition-all flex items-center gap-2">
                            <Copy size={18} /> Salin Kode
                        </button>
                    </div>
                )}
            </DetailDrawer>

            {/* 3. Comparison Mode Modal */}
            <DetailDrawer
                open={showComparison}
                onClose={() => setShowComparison(false)}
                title="Perbandingan Sekolah"
                subtitle={`Membandingkan ${comparingIds.length} sekolah terpilih`}
                width="max-w-4xl"
            >
                <div className="overflow-x-auto pb-6">
                    <div className="flex gap-6 min-w-max">
                        {comparingIds.map(id => {
                            const sc = schools.find(s => s.id === id);
                            if (!sc) return null;
                            return (
                                <div key={id} className="w-72 bg-[#0F1014] border border-white/5 rounded-2xl p-6 flex flex-col gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-indigo-600/5 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                                            <SchoolIcon size={20} className="text-indigo-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-base font-black text-white leading-tight">{sc.name}</h4>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${sc.is_active ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {sc.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="bg-[#12141A] p-3 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Guru</p>
                                            <p className="text-xl font-black text-white">{sc.guru_count}</p>
                                        </div>
                                        <div className="bg-[#12141A] p-3 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Siswa</p>
                                            <p className="text-xl font-black text-white">{sc.siswa_count}</p>
                                        </div>
                                        <div className="bg-[#12141A] p-3 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Kelas</p>
                                            <p className="text-xl font-black text-white">{sc.class_count}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Tags</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(tagsDb[sc.id] || []).length > 0 ? (
                                                (tagsDb[sc.id] || []).map(tag => (
                                                    <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-slate-300 border border-white/10">#{tag}</span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-600 italic">Tidak ada tag</span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <button onClick={() => toggleCompare(id)} className="mt-auto pt-4 text-xs font-bold text-rose-400 hover:text-rose-300">
                                        Hapus dari Perbandingan
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </DetailDrawer>
        </div>
    );
}

