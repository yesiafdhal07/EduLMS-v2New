// Tool definitions for OpenRouter Function Calling

export const ADMIN_TOOLS = [
    {
        type: "function",
        function: {
            name: "search_users",
            description: "Cari pengguna berdasarkan nama atau email di platform",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "Nama atau email pengguna" },
                    role_filter: { type: "string", enum: ["admin", "guru", "siswa", "kepala_sekolah", "orang_tua", "all"] }
                },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_school_health_report",
            description: "Dapatkan laporan kesehatan sekolah (health score)",
            parameters: {
                type: "object",
                properties: {
                    limit: { type: "number", description: "Jumlah sekolah yang ditampilkan" },
                    sort_by: { type: "string", enum: ["health_score", "login_rate_30d", "submission_rate"] }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_recent_audit_logs",
            description: "Lihat aktivitas terbaru di platform",
            parameters: {
                type: "object",
                properties: {
                    limit: { type: "number", description: "Jumlah log yang ditampilkan" }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_inactive_schools",
            description: "Temukan sekolah yang sudah lama tidak aktif",
            parameters: {
                type: "object",
                properties: {
                    inactive_days: { type: "number", description: "Jumlah hari tidak aktif (default 30)" }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_platform_anomaly_report",
            description: "Deteksi anomali atau masalah otomatis di platform (sekolah kritis, orphaned users)",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    }
];

export const GURU_TOOLS = [
    {
        type: "function",
        function: {
            name: "get_latest_materials",
            description: "Dapatkan materi pelajaran terbaru yang diunggah di suatu kelas",
            parameters: {
                type: "object",
                properties: {
                    class_id: { type: "string", description: "UUID kelas" },
                    limit: { type: "number" }
                },
                required: ["class_id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_assignment_history",
            description: "Lihat riwayat tugas yang pernah diberikan di suatu kelas",
            parameters: {
                type: "object",
                properties: {
                    class_id: { type: "string" },
                    limit: { type: "number" }
                },
                required: ["class_id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_at_risk_students",
            description: "Identifikasi siswa yang berisiko gagal (nilai rendah, kehadiran rendah)",
            parameters: {
                type: "object",
                properties: {
                    class_id: { type: "string" },
                    grade_threshold: { type: "number", description: "Batas nilai bawah (default 70)" },
                    attendance_threshold: { type: "number", description: "Batas persentase kehadiran bawah (default 75)" }
                },
                required: ["class_id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_submission_stats",
            description: "Dapatkan statistik pengumpulan tugas tertentu (berapa yang mengumpulkan, siapa yang belum)",
            parameters: {
                type: "object",
                properties: {
                    assignment_id: { type: "string", description: "UUID tugas" }
                },
                required: ["assignment_id"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "draft_assignment",
            description: "Buat draft tugas/soal otomatis (bisa berdasarkan materi). Ini HANYA menghasilkan draft untuk direview, belum di-publish ke murid.",
            parameters: {
                type: "object",
                properties: {
                    class_id: { type: "string" },
                    based_on_material_id: { type: "string", description: "UUID materi acuan (opsional)" },
                    type: { type: "string", enum: ["essay", "pilihan_ganda"] },
                    bloom_level: { type: "string", enum: ["C1", "C2", "C3", "C4", "C5", "C6"], description: "Tingkat kognitif Taksonomi Bloom" },
                    topic: { type: "string", description: "Topik spesifik jika tidak menggunakan based_on_material_id" }
                },
                required: ["class_id", "type", "bloom_level"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "generate_differentiated_tasks",
            description: "Buat 3 versi tugas/soal (remedial, standar, pengayaan) untuk pembelajaran berdiferensiasi dari satu topik.",
            parameters: {
                type: "object",
                properties: {
                    class_id: { type: "string" },
                    topic: { type: "string", description: "Topik pelajaran yang ingin dibuat tugasnya" }
                },
                required: ["class_id", "topic"]
            }
        }
    }
];

export const SISWA_TOOLS = [
    {
        type: "function",
        function: {
            name: "get_my_pending_assignments",
            description: "Lihat daftar tugas yang belum dikumpulkan dan tenggat waktunya.",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_my_grade_trajectory",
            description: "Lihat tren nilai tugas-tugas sebelumnya.",
            parameters: {
                type: "object",
                properties: {
                    limit: { type: "number" }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_class_materials_for_study",
            description: "Lihat materi pelajaran terbaru yang diunggah oleh guru di kelasku.",
            parameters: {
                type: "object",
                properties: {
                    limit: { type: "number" }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "generate_personal_study_plan",
            description: "Buat jadwal belajar harian yang dipersonalisasi berdasarkan nilai dan tugas terdekat.",
            parameters: {
                type: "object",
                properties: {
                    days_available: { type: "number", description: "Berapa hari jadwal yang ingin dibuat (1-14)" }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "generate_practice_quiz",
            description: "Buat kuis latihan singkat (pilihan ganda) untuk belajar sendiri.",
            parameters: {
                type: "object",
                properties: {
                    subject: { type: "string", description: "Mata pelajaran" },
                    based_on: { type: "string", description: "Topik atau nama materi acuan (opsional)" },
                    count: { type: "number", description: "Jumlah soal (maksimal 10)" }
                },
                required: ["subject"]
            }
        }
    }
];

export const KEPSEK_TOOLS = [
    {
        type: "function",
        function: {
            name: "get_class_performance_ranking",
            description: "Lihat peringkat kelas berdasarkan rata-rata nilai, kehadiran, dll.",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_teacher_performance_report",
            description: "Lihat kinerja pengisian nilai dan manajemen kelas oleh guru.",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_subject_weakness_map",
            description: "Identifikasi mata pelajaran apa yang nilainya paling rendah lintas kelas.",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_at_risk_students_school",
            description: "Dapatkan jumlah atau daftar kelas dengan rata-rata sangat rendah (butuh intervensi).",
            parameters: {
                type: "object",
                properties: {
                    threshold: { type: "number", description: "Batas nilai rata-rata (default 70)" }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "generate_board_report",
            description: "Buat laporan eksekutif (Executive Summary, Achievements, Areas of Improvement) untuk komite/yayasan.",
            parameters: {
                type: "object",
                properties: {
                    semester: { type: "string", description: "Nama semester atau periode (opsional)" }
                }
            }
        }
    }
];

export const ORANG_TUA_TOOLS = [
    {
        type: "function",
        function: {
            name: "get_child_academic_overview",
            description: "Dapatkan ringkasan profil akademik anak (kelas, kehadiran, rata-rata).",
            parameters: {
                type: "object",
                properties: {}
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_child_upcoming_deadlines",
            description: "Cek apakah ada tugas yang belum dikumpulkan anak dalam waktu dekat.",
            parameters: {
                type: "object",
                properties: {
                    student_id: { type: "string", description: "UUID anak (jika punya lebih dari satu anak, opsional)" },
                    days_ahead: { type: "number", description: "Jarak hari ke depan (default 7)" }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_child_attendance_summary",
            description: "Cek catatan absensi anak.",
            parameters: {
                type: "object",
                properties: {
                    student_id: { type: "string", description: "UUID anak (opsional)" }
                }
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_parenting_tips_for_weak_subject",
            description: "Dapatkan saran spesifik tentang cara membantu anak belajar mata pelajaran yang paling lemah berdasarkan nilai nyata.",
            parameters: {
                type: "object",
                properties: {
                    student_id: { type: "string", description: "UUID anak (opsional)" }
                }
            }
        }
    }
];

export function getToolsForRole(role: string) {
    switch (role) {
        case 'admin': return ADMIN_TOOLS;
        case 'guru': return GURU_TOOLS;
        case 'siswa': return SISWA_TOOLS;
        case 'kepala_sekolah': return KEPSEK_TOOLS;
        case 'orang_tua': return ORANG_TUA_TOOLS;
        default: return [];
    }
}
