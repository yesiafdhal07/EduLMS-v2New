
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** Klolakelas
- **Date:** 2026-04-25
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 Log in and reach the Guru dashboard
- **Test Code:** [TC001_Log_in_and_reach_the_Guru_dashboard.py](./TC001_Log_in_and_reach_the_Guru_dashboard.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/69afc8ce-a717-4063-8011-d16080ef54d2/e98970ef-9025-4d10-9695-71437e3e8af8
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 Log in and reach the Siswa dashboard
- **Test Code:** [TC002_Log_in_and_reach_the_Siswa_dashboard.py](./TC002_Log_in_and_reach_the_Siswa_dashboard.py)
- **Test Error:** TEST FAILURE

Logging in did not route the user to the Siswa dashboard — the account reached the Guru dashboard instead.

Observations:
- The page displays 'Panel Guru / dashboard' and 'Selamat Datang, Yesi Afdhal!'.
- The left navigation and UI elements correspond to a Guru (teacher) interface rather than a Siswa dashboard.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/69afc8ce-a717-4063-8011-d16080ef54d2/32a0099f-d526-437a-9d80-dd185f76cb80
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 Require authentication when opening the Guru dashboard directly
- **Test Code:** [TC003_Require_authentication_when_opening_the_Guru_dashboard_directly.py](./TC003_Require_authentication_when_opening_the_Guru_dashboard_directly.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/69afc8ce-a717-4063-8011-d16080ef54d2/99f232c4-1219-4f78-83f4-75d57f6416e2
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 Register a new account with role selection and reach the correct dashboard
- **Test Code:** [TC004_Register_a_new_account_with_role_selection_and_reach_the_correct_dashboard.py](./TC004_Register_a_new_account_with_role_selection_and_reach_the_correct_dashboard.py)
- **Test Error:** TEST BLOCKED

The registration page or link could not be reached from the login screen, so the test cannot proceed.

Observations:
- The login page shows only email and password inputs, a submit button, and a password reset link.
- There is no visible registration form or a clickable 'register' link in the interactive elements.
- A prior click on 'Konsultasi ke Ahli' did not open a registration page or start a registration flow.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/69afc8ce-a717-4063-8011-d16080ef54d2/eb1013ea-8268-4cdf-8b24-5ba46e215f13
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 Manage class roster, record attendance, and enter grades
- **Test Code:** [TC005_Manage_class_roster_record_attendance_and_enter_grades.py](./TC005_Manage_class_roster_record_attendance_and_enter_grades.py)
- **Test Error:** TEST BLOCKED

The feature could not be reached because a persistent quick-action modal overlay cannot be dismissed, preventing access to the class roster and subsequent actions.

Observations:
- The quick-action modal remains open and shows a search input with value "c".
- Multiple attempts to close it (pressing Escape twice, typing 'c', clicking the ESC badge, and clicking the sidebar 'Sampah' link) did not close the modal.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/69afc8ce-a717-4063-8011-d16080ef54d2/edb50934-aa1f-4aa5-a2b2-2f167b6f724e
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 View enrolled classes, attendance status, and grades
- **Test Code:** [TC006_View_enrolled_classes_attendance_status_and_grades.py](./TC006_View_enrolled_classes_attendance_status_and_grades.py)
- **Test Error:** TEST BLOCKED

The student dashboard cannot be tested because a student account is required but not available.

Observations:
- After login the app shows the Guru dashboard ("Selamat Datang, Guru!") and navigating to /siswa redirected to /guru.
- No student account credentials were provided in the test data, so I cannot sign in as a student to verify enrolled classes, attendance, or grades/feedback.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/69afc8ce-a717-4063-8011-d16080ef54d2/167333e3-04cb-403d-8a95-9e6225f4f2d6
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 Show empty enrolled-classes state with guidance
- **Test Code:** [TC007_Show_empty_enrolled_classes_state_with_guidance.py](./TC007_Show_empty_enrolled_classes_state_with_guidance.py)
- **Test Error:** TEST BLOCKED

The student view could not be reached — the current session is a teacher (Guru) account, so I cannot verify a student's empty enrolled-classes state.

Observations:
- After login the page shows 'Selamat Datang, Guru!' and teacher dashboard widgets.
- Repeated attempts to navigate to /siswa stayed on the Guru dashboard and did not display the student empty-state.

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/69afc8ce-a717-4063-8011-d16080ef54d2/7b3bdc47-41ec-47ce-aabe-46cd649684fb
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 Show error for invalid login credentials
- **Test Code:** [TC008_Show_error_for_invalid_login_credentials.py](./TC008_Show_error_for_invalid_login_credentials.py)
- **Test Error:** TEST FAILURE

The login form did not display an error message after submitting invalid credentials.

Observations:
- The page remained on the login screen and showed no authentication error message.
- The Email and Password fields still contain the submitted values (invalid-user@example.com / wrong-password).
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/69afc8ce-a717-4063-8011-d16080ef54d2/9a73aeb4-d23d-4c68-a230-21dbdacb304b
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 Validate attendance or grade entry invalid input
- **Test Code:** [TC009_Validate_attendance_or_grade_entry_invalid_input.py](./TC009_Validate_attendance_or_grade_entry_invalid_input.py)
- **Test Error:** Summary of everything discovered while attempting to verify that the Guru dashboard prevents saving invalid attendance/grade inputs and shows a validation error:

1) Authentication and basic navigation
- I logged in successfully using the provided credentials (yesiafdhal07@guru.sma.belajar.id / provided password).
- After login the Guru dashboard (Selamat Datang, Yesi Afdhal!) was reachable.

2) Presensi (attendance)
- I opened the Presensi page and a Live Manual Session was started earlier in the session.
- The Presensi UI shows student rows and attendance status controls (buttons labeled Hadir, Izin, Sakit, Alpha).
- There is no visible numeric/grade input on the Presensi page — only attendance status buttons. Because of that, there was no place on Presensi to enter a numeric grade value to test invalid input saving behavior.

3) Pembelajaran (grades area)
- I navigated to the Pembelajaran page multiple times to look for a grade/score input field where I could attempt entering an invalid value.
- Some clicks to open Pembelajaran or related controls succeeded; several click attempts failed (element not interactable or stale). Known failed element indexes encountered: 655, 3480, and 4222.
- Because of repeated navigation attempts and occasional stale/uninteractable elements, I was unable to reliably find and open a specific grade editing form that would allow entering and saving an invalid numeric value.

4) Validation test outcome
- I did NOT perform the intended invalid-input test (enter invalid attendance/grade value and save) — 0 out of 1 required invalid-input tests completed.
- Therefore I observed no validation error message related to saving invalid attendance/grade inputs, because the save/edit flow for a numeric grade input was never reached.

5) Failures and termination
- Multiple navigation/click failures and repeated navigation loops were observed; the user also indicated the agent failed 3 times and requested termination.
- The test is incomplete and cannot be marked as passed.

Conclusion and recommended next steps for a future run (if you want to continue testing):
- Identify exactly where grades are edited (which page/modal and which button opens the grade edit). It’s likely in a specific class or assignment context under Pembelajaran rather than the global Presensi page.
- From the class/assignment details, open the numeric grade edit form (ensure the correct context/class is selected). Then attempt to enter an invalid value and save to confirm validation behavior.
- If click/stale-element issues persist, reload the page once, then retry navigation; ensure the page has finished rendering and interactive elements are visible before clicking.

Current status: test incomplete. The invalid-input validation check was not executed, so I cannot confirm whether the system prevents saving invalid attendance/grade inputs or displays a validation error.

Agent terminated by user. No further actions will be taken.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/69afc8ce-a717-4063-8011-d16080ef54d2/e095e246-d4f1-4384-8560-e6baa75e9f7a
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 Block registration when required fields are missing
- **Test Code:** [TC010_Block_registration_when_required_fields_are_missing.py](./TC010_Block_registration_when_required_fields_are_missing.py)
- **Test Error:** TEST BLOCKED

The registration form cannot be reached — entering and checking the school code did not reveal the rest of the registration fields, so the validation test cannot be executed.

Observations:
- After entering 'SCHOOL001' and attempting validation, only the KODE SEKOLAH input is visible; no email, password, or register/submit button appeared.
- There is no way to submit a registration form from this page as the required fields are not present.
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/69afc8ce-a717-4063-8011-d16080ef54d2/e2039309-6cc9-4adc-adb7-c62909e10814
- **Status:** BLOCKED
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **20.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---