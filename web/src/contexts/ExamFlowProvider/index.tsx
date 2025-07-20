// // src/contexts/ExamFlowProvider.tsx
//
// import {createContext, useContext, useState, useEffect, type ReactNode, useCallback} from "react";
// import type {ExamGroup, ExamWithStatus, Exam, ExamResult} from '../../utils/types';
// import {useParams, useNavigate} from "react-router-dom";
// import {getMethod} from "../../utils/api.ts";
// import {getValidAccessToken, getUserInfo} from "../../router/auth.ts";
//
// // 1. Định nghĩa kiểu dữ liệu cho Context
// interface ExamFlowContextType {
//     isLoading: boolean;
//     examsWithStatus: ExamWithStatus[];
//     examGroupDetail?: ExamGroup;
//     awaitingTime: number;
//     isUnlocking: boolean;
//     startUnlockTimer: (completedExamId: number) => void;
//     initializeExamData: (examGroupId: string) => Promise<void>;
// }
//
// // 2. Tạo Context
// export const ExamFlowContext = createContext<ExamFlowContextType | null>(null);
//
// // 3. Tạo hook tùy chỉnh để sử dụng context dễ dàng hơn
// export const useExamFlow = () => {
//     const context = useContext(ExamFlowContext);
//     if (!context) {
//         throw new Error("useExamFlow must be used inside an ExamFlowProvider");
//     }
//     return context;
// };
//
// // 4. Tạo Provider Component
// export function ExamFlowProvider({children}: { children: ReactNode }) {
//     const navigate = useNavigate();
//     const {examGroupId} = useParams<{ examGroupId: string }>();
//
//     const [isLoading, setIsLoading] = useState(true);
//     const [examGroupDetail, setExamGroupDetail] = useState<ExamGroup | undefined>(undefined);
//     const [examsWithStatus, setExamsWithStatus] = useState<ExamWithStatus[]>([]);
//     const [awaitingTime, setAwaitingTime] = useState(-1);
//     const [isUnlocking, setIsUnlocking] = useState(false);
//
//     const [userId, setUserId] = useState<number | null>(null);
//
//     // Load initial data - check for localStorage
//     const initializeExamData = useCallback(async (examGroupId: string) => {
//         if (!examGroupId){
//             setIsLoading(false);
//             return;
//         }
//         setIsLoading(true);
//
//         const accessToken = await getValidAccessToken();
//         if (!accessToken) {
//             navigate('/login');
//             return;
//         }
//         const {id: userId} = getUserInfo(accessToken);
//         setUserId(userId);
//
//         const [examGroupData, exams, examResults] = await Promise.all([
//             getMethod(`/exam_group/${examGroupId}`, {headers: {Authorization: `Bearer ${accessToken}`}}),
//             getMethod(`/exam/?exam_group=${examGroupId}`, {headers: {Authorization: `Bearer ${accessToken}`}}),
//             getMethod(`/exam_result/?student=${userId}&exam_group=${examGroupId}`, {headers: {Authorization: `Bearer ${accessToken}`}})
//         ]);
//
//         setExamGroupDetail(examGroupData);
//
//         const initialExams: ExamWithStatus[] = exams.map((exam: Exam) => ({
//             ...exam,
//             status: examResults.some((r: ExamResult) => r.exam === exam.id) ? 'completed' : 'locked'
//         }));
//
//         const unlockStartTime = localStorage.getItem(`unlockStartTime-${userId}-${examGroupId}`);
//         const unlockingExamId = localStorage.getItem(`unlockingExamId-${userId}-${examGroupId}`);
//
//         if (unlockStartTime && unlockingExamId) {
//             const elapsed = Math.floor((Date.now() - parseInt(unlockStartTime)) / 1000);
//             const remainingTime = examGroupData.await_time - elapsed;
//
//             const unlockingExamIndex = initialExams.findIndex(e => e.id === Number(unlockingExamId));
//
//             // still have to wait to unlock
//             if (remainingTime > 0 && unlockingExamIndex !== -1) {
//                 initialExams[unlockingExamIndex].status = 'unlocking';
//                 setIsUnlocking(true);
//                 setAwaitingTime(remainingTime);
//             } else {
//                 // the waiting time is over
//                 if (unlockingExamIndex !== -1) initialExams[unlockingExamIndex].status = 'unlocked';
//                 localStorage.removeItem(`unlockStartTime-${userId}-${examGroupId}`);
//                 localStorage.removeItem(`unlockStartTime-${userId}-${examGroupId}`);
//             }
//         } else {
//             // unlock the first locked if there is no unlocking or unlocked exam
//             const hasActiveExam = initialExams.some(e => ['unlocked', 'unlocking'].includes(e.status));
//             if (!hasActiveExam) {
//                 const firstLockedIndex = initialExams.findIndex(e => e.status === 'locked');
//                 if (firstLockedIndex !== -1) initialExams[firstLockedIndex].status = 'unlocked';
//             }
//         }
//
//         setExamsWithStatus(initialExams);
//         setIsLoading(false);
//     }, [navigate]);
//
//     // Call from StudentExamDetail on submitting the exam
//     const startUnlockTimer = useCallback((completedExamId: number) => {
//         if (!examGroupDetail || !userId || !examGroupId) return;
//
//         setExamsWithStatus(prevExams => {
//             /*********** find the next exam to unlock ***************/
//             let nextExamToUnlockId: number | undefined = undefined;
//             // find the index of the just now completed exam
//             const completedIndex = prevExams.findIndex(exam => exam.id === completedExamId);
//
//             // find the first next 'locked' exam
//             for (let i = completedIndex + 1; i < prevExams.length; i++) {
//                 if (prevExams[i].status === 'locked') {
//                     nextExamToUnlockId = prevExams[i].id;
//                     break;
//                 }
//             }
//
//             if(nextExamToUnlockId){
//                 // write to localStorage
//                 localStorage.setItem(`unlockStartTime-${userId}-${examGroupId}`, Date.now().toString());
//                 localStorage.setItem(`unlockingExamId-${userId}-${examGroupId}`, nextExamToUnlockId.toString());
//                 setIsUnlocking(true);
//                 setAwaitingTime(examGroupDetail.await_time);
//             }
//
//             // update status
//             return prevExams.map(exam =>{
//                 if (exam.id === completedExamId) {
//                     return { ...exam, status: 'completed' };
//                 }
//                 if (exam.id === nextExamToUnlockId) {
//                     return { ...exam, status: 'unlocking' };
//                 }
//                 return exam;
//             });
//         });
//     }, [examGroupDetail, examGroupId, userId]);
//
//     // Countdown Logic
//     useEffect(() => {
//         if (!isUnlocking || awaitingTime <= 0) return;
//         const interval = setInterval(() => setAwaitingTime(prev => prev - 1), 1000);
//         return () => clearInterval(interval);
//     }, [isUnlocking, awaitingTime]);
//
//     // Unlock ('unlocking' -> 'unlocked') when timeout
//     useEffect(() => {
//         if (isUnlocking && awaitingTime === 0) {
//             if (userId && examGroupId) {
//                 const unlockingExamId = localStorage.getItem(`unlockingExamId-${userId}-${examGroupId}`);
//                 if (unlockingExamId) {
//                     setExamsWithStatus(prevExams =>
//                         prevExams.map(exam=> exam.id === Number(unlockingExamId)
//                             ? {...exam, status: 'unlocked'}
//                             : exam)
//                     );
//                 }
//                 // DÙNG KHÓA MỚI KHI XÓA
//                 localStorage.removeItem(`unlockStartTime-${userId}-${examGroupId}`);
//                 localStorage.removeItem(`unlockingExamId-${userId}-${examGroupId}`);
//             }
//             setIsUnlocking(false);
//             setAwaitingTime(-1);
//         }
//     }, [isUnlocking, awaitingTime, examGroupId, userId]);
//
//     const value = { isLoading, examsWithStatus, examGroupDetail, awaitingTime, isUnlocking, startUnlockTimer, initializeExamData };
//
//     return <ExamFlowContext.Provider value={value}>{children}</ExamFlowContext.Provider>;
// }

// src/contexts/ExamFlowProvider.tsx

import {createContext, useContext, useState, useEffect, type ReactNode, useCallback} from "react";
import type {ExamGroup, ExamWithStatus, Exam, ExamResult} from '../../utils/types';
import {useNavigate} from "react-router-dom";
import {getMethod} from "../../utils/api.ts";
import {getValidAccessToken, getUserInfo} from "../../router/auth.ts";

// 1. interface for the context
interface ExamFlowContextType {
    isLoading: boolean;
    examsWithStatus: ExamWithStatus[];
    examGroupDetail?: ExamGroup;
    awaitingTime: number;
    isUnlocking: boolean;
    startUnlockTimer: (completedExamId: number) => void;
    initializeExamData: (examGroupId: string) => Promise<void>;
}

// 2. create the context
export const ExamFlowContext = createContext<ExamFlowContextType | null>(null);

// 3. create a custom hook to use the context
export const useExamFlow = () => {
    const context = useContext(ExamFlowContext);
    if (!context) {
        throw new Error("useExamFlow must be used inside an ExamFlowProvider");
    }
    return context;
}

export function ExamFlowProvider({children}: { children: ReactNode }) {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [examGroupDetail, setExamGroupDetail] = useState<ExamGroup | undefined>(undefined);
    const [examsWithStatus, setExamsWithStatus] = useState<ExamWithStatus[]>([]);
    const [awaitingTime, setAwaitingTime] = useState(-1);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);


    const [activeExamGroupId, setActiveExamGroupId] = useState<string | null>(null);

    const initializeExamData = useCallback(async (examGroupId: string) => {
        if (!examGroupId) {
            setIsLoading(false);
            return;
        }
        // save the examGroupId to state
        setActiveExamGroupId(examGroupId);
        setIsLoading(true);

        const accessToken = await getValidAccessToken();
        if (!accessToken) { navigate('/login'); return; }

        const userInfo = getUserInfo(accessToken);
        if (!userInfo || !userInfo.id) { navigate('/login'); return; }

        const currentUserId: number = userInfo.id;
        setUserId(currentUserId);

        try {
            const [examGroupData, exams, examResults] = await Promise.all([
                getMethod(`/exam_group/${examGroupId}`, {headers: {Authorization: `Bearer ${accessToken}`}}),
                getMethod(`/exam/?exam_group=${examGroupId}`, {headers: {Authorization: `Bearer ${accessToken}`}}),
                getMethod(`/exam_result/?student=${currentUserId}&exam_group=${examGroupId}`, {headers: {Authorization: `Bearer ${accessToken}`}})
            ]);

            setExamGroupDetail(examGroupData);

            // if an exam has its id appear in the ids of examResults, that exam's status is 'completed'
            // otherwise its status can be temporarily assigned to 'locked'
            let processedExams: ExamWithStatus[] = exams.map((exam: Exam) => ({
                ...exam,
                status: examResults.some((r: ExamResult) => r.exam === exam.id) ? 'completed' : 'locked'
            }));

            const unlockStartTime: string | null = localStorage.getItem(`unlockStartTime-${currentUserId}-${examGroupId}`);
            const unlockingExamId: string | null = localStorage.getItem(`unlockingExamId-${currentUserId}-${examGroupId}`);

            if (unlockStartTime && unlockingExamId) {
                const elapsed: number = Math.floor((Date.now() - parseInt(unlockStartTime)) / 1000);
                const remainingTime: number = examGroupData.await_time - elapsed;

                if (remainingTime > 0) {
                    processedExams = processedExams.map(exam => exam.id === Number(unlockingExamId) ? { ...exam, status: 'unlocking' } : exam);
                    setIsUnlocking(true);
                    setAwaitingTime(remainingTime);
                } else {
                    // when timeout, change status from 'unlocking' to 'unlocked' and clear localStorage
                    processedExams = processedExams.map(exam => exam.id === Number(unlockingExamId) ? { ...exam, status: 'unlocked' } : exam);

                    localStorage.removeItem(`unlockStartTime-${currentUserId}-${examGroupId}`);
                    localStorage.removeItem(`unlockingExamId-${currentUserId}-${examGroupId}`);
                }
            } else {
                const hasActiveExam: boolean = processedExams.some(e => ['unlocked', 'unlocking'].includes(e.status));
                // if there is no 'unlocking' or 'unlocked' exam, unlock a 'locked' exam (if any)

                if (!hasActiveExam) {
                    const firstLockedIndex: number = processedExams.findIndex(e => e.status === 'locked');
                    if (firstLockedIndex !== -1) {
                        processedExams = processedExams.map((exam, index) => index === firstLockedIndex ? { ...exam, status: 'unlocked' } : exam);
                    }
                }
            }
            setExamsWithStatus(processedExams);
        } catch (error) {
            console.error("Error initializing exam data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    const startUnlockTimer = useCallback((completedExamId: number) => {

        if (!examGroupDetail || !userId || !activeExamGroupId) return;

        // pick one from locked exams to unlock
        setExamsWithStatus(prevExams => {
            let nextExamToUnlockId: number | undefined;
            const completedIndex: number = prevExams.findIndex(exam => exam.id === completedExamId);
            for (let i = completedIndex + 1; i < prevExams.length; i++) {
                if (prevExams[i].status === 'locked') {
                    nextExamToUnlockId = prevExams[i].id;
                    break;
                }
            }

            if (nextExamToUnlockId) {
                localStorage.setItem(`unlockStartTime-${userId}-${activeExamGroupId}`, Date.now().toString());
                localStorage.setItem(`unlockingExamId-${userId}-${activeExamGroupId}`, nextExamToUnlockId.toString());
                setIsUnlocking(true);
                setAwaitingTime(examGroupDetail.await_time);
            }

            return prevExams.map(exam => {
                if (exam.id === completedExamId) return { ...exam, status: 'completed' };
                if (exam.id === nextExamToUnlockId) return { ...exam, status: 'unlocking' };
                return exam;
            });
        });
    }, [examGroupDetail, userId, activeExamGroupId]);

    // countdown
    useEffect(() => {
        if (!isUnlocking || awaitingTime <= 0) return;
        const interval = setInterval(() => setAwaitingTime(prev => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [isUnlocking, awaitingTime]);

    // timeout scenario, change the exam's status from 'unlocking' to 'unlocked' and clear localStorage
    useEffect(() => {

        if (isUnlocking && awaitingTime === 0) {

            if (userId && activeExamGroupId) {
                const unlockingExamId: string | null = localStorage.getItem(`unlockingExamId-${userId}-${activeExamGroupId}`);
                if (unlockingExamId) {
                    setExamsWithStatus(prevExams =>
                        prevExams.map(exam =>
                            exam.id === Number(unlockingExamId)
                                ? { ...exam, status: 'unlocked' }
                                : exam
                        )
                    );
                }
                localStorage.removeItem(`unlockStartTime-${userId}-${activeExamGroupId}`);
                localStorage.removeItem(`unlockingExamId-${userId}-${activeExamGroupId}`);
            }
            setIsUnlocking(false);
            setAwaitingTime(-1);
        }
    }, [isUnlocking, awaitingTime, userId, activeExamGroupId]);

    const value = { isLoading, examsWithStatus, examGroupDetail, awaitingTime, isUnlocking, startUnlockTimer, initializeExamData };

    return <ExamFlowContext.Provider value={value}>{children}</ExamFlowContext.Provider>;
}