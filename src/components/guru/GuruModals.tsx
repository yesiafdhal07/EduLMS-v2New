'use client';

import { ReactNode } from 'react';
import { SubmissionReviewModal, MaterialModal, AssignmentModal, ManualGradeModal, DataArchiveModal, BulkImportModal } from '@/components/guru';
import { ProfileSettingsModal, QuickAddModal } from '@/components/ui';
import type { ClassData, Assignment } from '@/types';

// ========================================================
// GURU MODALS — Extracted from page.tsx for cleanliness
// All modal state managed by parent via props
// ========================================================

interface GuruModalsProps {
    // User
    user: any;

    // Class
    classes: ClassData[];
    selectedClassId: string | null;

    // Submission Review
    showSubmissionModal: boolean;
    setShowSubmissionModal: (v: boolean) => void;
    selectedAssignment: Assignment | null;

    // Material
    showMaterialModal: boolean;
    setShowMaterialModal: (v: boolean) => void;
    fetchMaterials: () => void;

    // Assignment
    showAssignmentModal: boolean;
    setShowAssignmentModal: (v: boolean) => void;
    fetchAssignments: () => void;

    // Manual Grade
    showManualGradeModal: boolean;
    setShowManualGradeModal: (v: boolean) => void;
    manualGradeAssignment: Assignment | null;
    setManualGradeAssignment: (v: Assignment | null) => void;

    // Archive
    showArchiveModal: boolean;
    setShowArchiveModal: (v: boolean) => void;

    // Profile
    showProfileModal: boolean;
    setShowProfileModal: (v: boolean) => void;

    // Quick Add
    showQuickAddModal: boolean;
    setShowQuickAddModal: (v: boolean) => void;
    setShowClassModal: (v: boolean) => void;
    setActiveTab: (tab: string) => void;

    // Bulk Import
    showBulkImportModal: boolean;
    setShowBulkImportModal: (v: boolean) => void;
    fetchStudents: () => void;
}

export function GuruModals({
    user,
    classes,
    selectedClassId,
    showSubmissionModal, setShowSubmissionModal, selectedAssignment,
    showMaterialModal, setShowMaterialModal, fetchMaterials,
    showAssignmentModal, setShowAssignmentModal, fetchAssignments,
    showManualGradeModal, setShowManualGradeModal, manualGradeAssignment, setManualGradeAssignment,
    showArchiveModal, setShowArchiveModal,
    showProfileModal, setShowProfileModal,
    showQuickAddModal, setShowQuickAddModal, setShowClassModal, setActiveTab,
    showBulkImportModal, setShowBulkImportModal, fetchStudents,
}: GuruModalsProps) {
    return (
        <>
            <SubmissionReviewModal
                isOpen={showSubmissionModal}
                onClose={() => setShowSubmissionModal(false)}
                assignment={selectedAssignment}
            />
            <MaterialModal
                isOpen={showMaterialModal}
                onClose={() => setShowMaterialModal(false)}
                onSuccess={fetchMaterials}
                classId={selectedClassId}
            />
            <AssignmentModal
                isOpen={showAssignmentModal}
                onClose={() => setShowAssignmentModal(false)}
                onSuccess={fetchAssignments}
                classes={classes}
                selectedClassId={selectedClassId}
            />
            <ManualGradeModal
                isOpen={showManualGradeModal}
                onClose={() => { setShowManualGradeModal(false); setManualGradeAssignment(null); }}
                classId={selectedClassId}
                assignment={manualGradeAssignment}
                mode={manualGradeAssignment ? 'manual' : 'keaktifan'}
            />
            <DataArchiveModal
                isOpen={showArchiveModal}
                onClose={() => setShowArchiveModal(false)}
                classes={classes}
            />
            <ProfileSettingsModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                role="guru"
                user={user}
            />
            <QuickAddModal
                isOpen={showQuickAddModal}
                onClose={() => setShowQuickAddModal(false)}
                onAddTask={() => setShowAssignmentModal(true)}
                onAddMaterial={() => setShowMaterialModal(true)}
                onAddClass={() => setShowClassModal(true)}
                onStartAttendance={() => { setActiveTab('presensi'); }}
            />
            {selectedClassId && (
                <BulkImportModal
                    isOpen={showBulkImportModal}
                    onClose={() => setShowBulkImportModal(false)}
                    onSuccess={() => {
                        setShowBulkImportModal(false);
                        fetchStudents();
                    }}
                    classId={selectedClassId}
                    schoolId={user?.school_id || ''}
                />
            )}
        </>
    );
}
