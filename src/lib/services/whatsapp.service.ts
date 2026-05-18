/**
 * WhatsApp Notification Service — Fonnte Gateway
 * USP #20: Automated WA notifications for grades & attendance
 *
 * Docs: https://fonnte.com/docs
 * Requires env: FONNTE_API_KEY
 */

export type WANotificationType =
    | 'grade_alert'
    | 'attendance_alert'
    | 'payment_reminder'
    | 'forum_mention'
    | 'ptm_invite'
    | 'announcement';

export interface WANotificationPayload {
    phone: string;     // Format: 628xxx (without +)
    message: string;
    type: WANotificationType;
    metadata?: Record<string, unknown>;
}

export interface WABatchPayload {
    recipients: { phone: string; name: string }[];
    message: string;
    type: WANotificationType;
}

export interface WAResult {
    success: boolean;
    status?: string;
    error?: string;
}

// ─── Core send function (Fonnte API via Proxy) ──────────────────────────
async function sendViaFonnte(phone: string, message: string): Promise<WAResult> {
    try {
        const res = await fetch('/api/wa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: phone, message }),
        });

        const json = await res.json();
        
        if (json.status === 'dev_simulated') {
            console.log(`[WA Proxy] DEV MODE — to ${phone}:\n${message}`);
            return { success: true, status: 'dev_simulated' };
        }

        if (!res.ok || !json.success) {
            return { success: false, error: json.error ?? 'Fonnte error', status: json.status };
        }
        return { success: true, status: json.status };
    } catch (err) {
        console.error('[WA Client] Network error:', err);
        return { success: false, error: 'Network error' };
    }
}

// Normalize phone: strip spaces, leading 0 → 62, strip +
function normalizePhone(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('0')) return '62' + digits.slice(1);
    if (digits.startsWith('62')) return digits;
    return '62' + digits;
}

// ─── Message Templates ─────────────────────────────────────────
const templates = {
    grade_alert: (studentName: string, subject: string, score: number, type: string) =>
        `🎓 *Klolakelas — Update Nilai*\n\nYth. Orang Tua/Wali dari *${studentName}*,\n\nAnak Anda mendapatkan nilai baru:\n📚 Mata Pelajaran: *${subject}*\n📝 Jenis: *${type}*\n⭐ Nilai: *${score}*\n\nPantau perkembangan lengkap di portal Klolakelas.\n\n_Pesan otomatis dari Klolakelas_`,

    attendance_alert: (studentName: string, status: string, date: string, className: string) => {
        const emoji: Record<string, string> = {
            hadir: '✅', izin: '📝', sakit: '🤒', alpa: '❌',
        };
        return `${emoji[status] ?? '🔔'} *Klolakelas — Presensi*\n\nYth. Orang Tua/Wali dari *${studentName}*,\n\nInformasi kehadiran hari ini (${date}):\n🏫 Kelas: *${className}*\nStatus: *${status.toUpperCase()}*\n\n_Pesan otomatis dari Klolakelas_`;
    },

    ptm_invite: (parentName: string, studentName: string, date: string, time: string, teacherName: string) =>
        `📅 *Klolakelas — Undangan PTM*\n\nYth. *${parentName}*,\n\nKami mengundang Anda untuk Pertemuan Orang Tua & Guru (PTM) bersama wali murid *${studentName}*:\n\n📆 Tanggal: *${date}*\n🕐 Pukul: *${time}*\n👨‍🏫 Guru: *${teacherName}*\n\nMohon konfirmasi kehadiran melalui portal Klolakelas.\n\n_Pesan otomatis dari Klolakelas_`,

    announcement: (title: string, content: string, className: string) =>
        `📢 *Klolakelas — Pengumuman*\n\n*${title}*\n🏫 ${className}\n\n${content}\n\n_Pesan otomatis dari Klolakelas_`,
};

// ─── Public API ────────────────────────────────────────────────
export const whatsappService = {
    /**
     * Send a single notification (typed)
     */
    async sendNotification(payload: WANotificationPayload): Promise<WAResult> {
        const phone = normalizePhone(payload.phone);
        return sendViaFonnte(phone, payload.message);
    },

    /**
     * Send batch notifications (sequential with 300ms delay to avoid rate limits)
     */
    async sendBatch(batch: WABatchPayload): Promise<{ sent: number; failed: number }> {
        let sent = 0;
        let failed = 0;

        for (const recipient of batch.recipients) {
            const phone = normalizePhone(recipient.phone);
            const result = await sendViaFonnte(phone, batch.message);
            if (result.success) sent++;
            else failed++;
            await new Promise(r => setTimeout(r, 300));
        }

        return { sent, failed };
    },

    // ─── Typed helpers ───────────────────────────────────────
    async notifyGradeAlert(phone: string, studentName: string, subject: string, score: number, gradeType = 'Nilai') {
        return this.sendNotification({
            phone,
            message: templates.grade_alert(studentName, subject, score, gradeType),
            type: 'grade_alert',
        });
    },

    async notifyAttendance(phone: string, studentName: string, status: string, date: string, className: string) {
        return this.sendNotification({
            phone,
            message: templates.attendance_alert(studentName, status, date, className),
            type: 'attendance_alert',
        });
    },

    async notifyPTMInvite(phone: string, parentName: string, studentName: string, date: string, time: string, teacherName: string) {
        return this.sendNotification({
            phone,
            message: templates.ptm_invite(parentName, studentName, date, time, teacherName),
            type: 'ptm_invite',
        });
    },

    async notifyAnnouncement(phones: string[], title: string, content: string, className: string) {
        return this.sendBatch({
            recipients: phones.map(p => ({ phone: p, name: '' })),
            message: templates.announcement(title, content, className),
            type: 'announcement',
        });
    },

    // ─── Legacy compat ───────────────────────────────────────
    formatGradeAlert: (studentName: string, subject: string, score: number) =>
        templates.grade_alert(studentName, subject, score, 'Nilai'),

    formatAttendanceAlert: (studentName: string, status: string, date: string) =>
        templates.attendance_alert(studentName, status, date, ''),
};
