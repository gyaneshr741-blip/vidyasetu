import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AdminView } from './components/AdminView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FacultyView } from './components/FacultyView';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { Modal } from './components/Modal';
import { SidebarNav } from './components/SidebarNav';
import { StudentParentView } from './components/StudentParentView';
import { Toast } from './components/Toast';
import { DEMO_PASSWORD, INITIAL_STATE, USERS } from './data/initialState';
import type {
  ModalState,
  NotificationTarget,
  PortalState,
  TabId,
  User,
} from './types/portal';
import { calcOverallAttendance } from './utils/portal';
import {
  clearPortalStorage,
  cloneInitialState,
  loadPortalBundle,
  savePortalBundle,
} from './utils/storage';

function PortalShell() {
  const [isReady, setIsReady] = useState(false);
  const [state, setState] = useState<PortalState>(() => cloneInitialState());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [modal, setModal] = useState<ModalState>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMsg(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
      toastTimerRef.current = null;
    }, 2600);
  }, []);

  useEffect(() => {
    const loaded = loadPortalBundle();
    setState(loaded.state);
    if (loaded.session) {
      const user = USERS[loaded.session.userId] ?? null;
      setCurrentUser(user);
      setActiveTab(loaded.session.tab);
    }
    if (loaded.recoveredFromError) {
      showToast('Recovered portal data from invalid saved state');
    }
    setIsReady(true);

    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, [showToast]);

  useEffect(() => {
    if (!isReady) return;
    savePortalBundle(
      state,
      currentUser ? { userId: currentUser.id, tab: activeTab } : null,
    );
  }, [isReady, state, currentUser, activeTab]);

  const hasCustomState = useMemo(
    () => JSON.stringify(state) !== JSON.stringify(INITIAL_STATE),
    [state],
  );

  const handleLogin = useCallback((username: string, password: string) => {
    const user = USERS[username.trim().toLowerCase()];
    if (!user || password !== DEMO_PASSWORD) {
      return 'Username or password is incorrect. Use a demo account.';
    }
    setCurrentUser(user);
    setActiveTab('home');
    setModal(null);
    return null;
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setActiveTab('home');
    setModal(null);
  }, []);

  const handleResetDemo = useCallback(() => {
    clearPortalStorage();
    setState(cloneInitialState());
    setCurrentUser(null);
    setActiveTab('home');
    setModal(null);
    showToast('Demo data restored');
  }, [showToast]);

  const handleToggleCourse = useCallback(
    (courseId: string) => {
      if (!currentUser?.sid) return;
      const sid = currentUser.sid;
      setState((prev) => {
        if (!prev.regOpen) return prev;
        const student = prev.stu[sid];
        if (!student) return prev;
        const exists = student.el.includes(courseId);
        const nextEl = exists
          ? student.el.filter((id) => id !== courseId)
          : [...student.el, courseId];
        return {
          ...prev,
          stu: {
            ...prev.stu,
            [sid]: { ...student, el: nextEl },
          },
        };
      });
    },
    [currentUser],
  );

  const handleApplyCondonation = useCallback(
    (reason: string) => {
      if (!currentUser?.sid) return;
      const sid = currentUser.sid;
      setState((prev) => {
        const student = prev.stu[sid];
        if (!student) return prev;
        return {
          ...prev,
          stu: {
            ...prev.stu,
            [sid]: { ...student, cond: 'Pending' },
          },
          notes: [
            {
              to: 'admin',
              m: `${student.n} applied for attendance condonation: ${reason}`,
              t: 'Just now',
            },
            ...prev.notes,
          ],
        };
      });
      showToast('Request sent');
    },
    [currentUser, showToast],
  );

  const handleSubmitGrievance = useCallback(
    (text: string) => {
      if (!currentUser?.sid) return;
      const sid = currentUser.sid;
      setState((prev) => {
        const nextId =
          prev.griev.reduce((max, item) => Math.max(max, item.id), 0) + 1;
        return {
          ...prev,
          griev: [
            ...prev.griev,
            { id: nextId, by: sid, t: text, st: 'Submitted' },
          ],
        };
      });
      showToast('Grievance submitted');
    },
    [currentUser, showToast],
  );

  const handleConfirmPayment = useCallback(
    (feeId: number) => {
      if (!currentUser?.sid) return;
      const sid = currentUser.sid;
      setState((prev) => {
        const student = prev.stu[sid];
        if (!student) return prev;
        return {
          ...prev,
          stu: {
            ...prev.stu,
            [sid]: {
              ...student,
              fees: student.fees.map((fee) =>
                fee.id === feeId ? { ...fee, paid: true } : fee,
              ),
            },
          },
        };
      });
      showToast('Payment received');
      setModal({ type: 'receipt', feeId });
    },
    [currentUser, showToast],
  );

  const handleSaveAttendance = useCallback(
    (presentMap: Record<string, boolean>) => {
      setState((prev) => {
        const nextStu = { ...prev.stu };
        const extraNotes = [...prev.notes];

        for (const [id, student] of Object.entries(prev.stu)) {
          const subjectKey = student.att['Data Structures']
            ? 'Data Structures'
            : Object.keys(student.att)[0];
          if (!subjectKey) continue;

          const [present, total] = student.att[subjectKey];
          const updatedStudent = {
            ...student,
            att: {
              ...student.att,
              [subjectKey]: [
                present + (presentMap[id] ? 1 : 0),
                total + 1,
              ] as [number, number],
            },
          };
          nextStu[id] = updatedStudent;

          const overall = calcOverallAttendance(updatedStudent);
          const threshold = prev.policy[updatedStudent.dept] ?? 75;
          if (overall < threshold) {
            extraNotes.unshift({
              to: 'parent',
              m: `${updatedStudent.n}’s attendance is ${overall}%, below the ${threshold}% requirement.`,
              t: 'Just now',
            });
          }
        }

        return {
          ...prev,
          stu: nextStu,
          notes: extraNotes,
        };
      });
      showToast('Attendance saved');
    },
    [showToast],
  );

  const handlePublishMarks = useCallback(
    (marksMap: Record<string, number>) => {
      setState((prev) => {
        const nextStu = { ...prev.stu };
        for (const [id, score] of Object.entries(marksMap)) {
          const student = prev.stu[id];
          if (!student || student.res.length === 0) continue;

          const targetIdx = student.res.findIndex(
            (item) => item.c === 'Data Structures',
          );
          const idxToUpdate =
            targetIdx >= 0 ? targetIdx : student.res.length - 1;

          nextStu[id] = {
            ...student,
            res: student.res.map((item, idx) =>
              idx === idxToUpdate ? { ...item, m: score } : item,
            ),
          };
        }

        return {
          ...prev,
          stu: nextStu,
          notes: [
            {
              to: 'student',
              m: 'Data Structures results are published.',
              t: 'Just now',
            },
            {
              to: 'parent',
              m: 'New examination results are available.',
              t: 'Just now',
            },
            ...prev.notes,
          ],
        };
      });
      showToast('Results published');
    },
    [showToast],
  );

  const handleSendAnnouncement = useCallback(
    (payload: {
      message: string;
      target: NotificationTarget;
      assignmentTitle: string;
    }) => {
      setState((prev) => ({
        ...prev,
        assign: payload.assignmentTitle
          ? [
              {
                c: 'Data Structures',
                n: payload.assignmentTitle,
                due: 'Next week',
              },
              ...prev.assign,
            ]
          : prev.assign,
        notes: payload.message
          ? [
              { to: payload.target, m: payload.message, t: 'Just now' },
              ...prev.notes,
            ]
          : prev.notes,
      }));
      showToast('Sent');
    },
    [showToast],
  );

  const handleSavePolicies = useCallback(
    (policies: Record<string, number>) => {
      setState((prev) => ({
        ...prev,
        policy: policies,
        notes: [
          {
            to: 'all',
            m: 'Attendance policy updated by administration.',
            t: 'Just now',
          },
          ...prev.notes,
        ],
      }));
      showToast('Policy saved');
    },
    [showToast],
  );

  const handleToggleRegWindow = useCallback(() => {
    setState((prev) => {
      const nextOpen = !prev.regOpen;
      showToast(nextOpen ? 'Window opened' : 'Window closed');
      return {
        ...prev,
        regOpen: nextOpen,
      };
    });
  }, [showToast]);

  const handleApproveCondonation = useCallback(
    (studentId: string) => {
      setState((prev) => {
        const student = prev.stu[studentId];
        if (!student || student.cond === 'Approved') return prev;
        return {
          ...prev,
          stu: {
            ...prev.stu,
            [studentId]: { ...student, cond: 'Approved' },
          },
          notes: [
            {
              to: 'student',
              m: `${student.n}’s attendance condonation request was approved.`,
              t: 'Just now',
            },
            ...prev.notes,
          ],
        };
      });
      showToast('Condonation approved');
    },
    [showToast],
  );

  const handleResolveGrievance = useCallback(
    (grievanceId: number) => {
      setState((prev) => {
        const target = prev.griev.find((item) => item.id === grievanceId);
        if (!target || target.st === 'Resolved') return prev;
        return {
          ...prev,
          griev: prev.griev.map((item) =>
            item.id === grievanceId ? { ...item, st: 'Resolved' } : item,
          ),
          notes: [
            {
              to: 'student',
              m: `Grievance #${grievanceId} was resolved.`,
              t: 'Just now',
            },
            ...prev.notes,
          ],
        };
      });
      showToast('Grievance resolved');
    },
    [showToast],
  );

  if (!isReady) {
    return (
      <div className="boot-state" aria-busy="true">
        <div>
          <div className="spinner" />
          <p>Loading VidyaSetu…</p>
        </div>
      </div>
    );
  }

  const activeStudent = currentUser?.sid
    ? state.stu[currentUser.sid]
    : undefined;

  return (
    <>
      {!currentUser ? (
        <LoginView
          onLogin={handleLogin}
          hasCustomState={hasCustomState}
          onResetDemo={handleResetDemo}
        />
      ) : (
        <div id="app">
          <Header user={currentUser} onLogout={handleLogout} />
          <div className="layout">
            <SidebarNav
              role={currentUser.r}
              activeTab={activeTab}
              onSelect={setActiveTab}
            />
            <main id="main">
              {currentUser.r === 'student' || currentUser.r === 'parent' ? (
                <StudentParentView
                  user={currentUser}
                  tab={activeTab}
                  state={state}
                  onToggleCourse={handleToggleCourse}
                  onApplyCondonation={handleApplyCondonation}
                  onSubmitGrievance={handleSubmitGrievance}
                  onOpenPayModal={(feeId) => setModal({ type: 'pay', feeId })}
                  onOpenReceiptModal={(feeId) =>
                    setModal({ type: 'receipt', feeId })
                  }
                  onToast={showToast}
                />
              ) : currentUser.r === 'faculty' ? (
                <FacultyView
                  user={currentUser}
                  tab={activeTab}
                  state={state}
                  onSaveAttendance={handleSaveAttendance}
                  onPublishMarks={handlePublishMarks}
                  onSendAnnouncement={handleSendAnnouncement}
                  onToast={showToast}
                />
              ) : (
                <AdminView
                  tab={activeTab}
                  state={state}
                  onSavePolicies={handleSavePolicies}
                  onToggleRegWindow={handleToggleRegWindow}
                  onApproveCondonation={handleApproveCondonation}
                  onResolveGrievance={handleResolveGrievance}
                  onSendAnnouncement={handleSendAnnouncement}
                  onToast={showToast}
                />
              )}
            </main>
          </div>
        </div>
      )}
      <Modal
        modal={modal}
        student={activeStudent}
        onClose={() => setModal(null)}
        onConfirmPayment={handleConfirmPayment}
        onToast={showToast}
      />
      <Toast message={toastMsg} />
    </>
  );
}

export default function App() {
  const [resetEpoch, setResetEpoch] = useState(0);

  const handleBoundaryReset = () => {
    clearPortalStorage();
    setResetEpoch((n) => n + 1);
  };

  return (
    <ErrorBoundary onReset={handleBoundaryReset}>
      <PortalShell key={resetEpoch} />
    </ErrorBoundary>
  );
}
