'use client';

import { useState } from 'react';
import type { Assignment } from '@/types';

// ========================================================
// TYPES
// ========================================================
export type GuruTab = 'dashboard' | 'pembelajaran' | 'kuis' | 'analytics' | 'absensi' | 'portofolio' | 'trash' | 'diskusi' | 'pipeline' | 'jadwal' | 'manajemen_kelas';

// ========================================================
// HOOK
// ========================================================
export function useGuruUI() {
    // Navigation State
    const [activeTab, setActiveTab] = useState<GuruTab>('dashboard');

    // Pagination State
    const [statsPage, setStatsPage] = useState(1);
    const [materialsPage, setMaterialsPage] = useState(1);
    const [assignmentsPage, setAssignmentsPage] = useState(1);

    // Modal Visibility States
    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [showClassModal, setShowClassModal] = useState(false);
    const [showManualGradeModal, setShowManualGradeModal] = useState(false);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [showBulkImportModal, setShowBulkImportModal] = useState(false);

    // Selected Entities for Modals
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [manualGradeAssignment, setManualGradeAssignment] = useState<Assignment | null>(null);

    // Form Temporary State
    const [newClassName, setNewClassName] = useState('');

    return {
        // Tab
        activeTab,
        setActiveTab,

        // Pagination
        statsPage,
        setStatsPage,
        materialsPage,
        setMaterialsPage,
        assignmentsPage,
        setAssignmentsPage,

        // Modal Visibility
        showMaterialModal,
        setShowMaterialModal,
        showAssignmentModal,
        setShowAssignmentModal,
        showSubmissionModal,
        setShowSubmissionModal,
        showClassModal,
        setShowClassModal,
        showManualGradeModal,
        setShowManualGradeModal,
        showArchiveModal,
        setShowArchiveModal,
        showBulkImportModal,
        setShowBulkImportModal,

        // Modal Selections
        selectedAssignment,
        setSelectedAssignment,
        manualGradeAssignment,
        setManualGradeAssignment,

        // Forms
        newClassName,
        setNewClassName,
    };
}
