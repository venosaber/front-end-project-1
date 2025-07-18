import {Dispatch, SetStateAction} from "react";

interface ExamFlowContextType {
    examsWithStatus: ExamWithStatus[];
    setExamsWithStatus: Dispatch<SetStateAction<ExamWithStatus[]>>;
    isWaitingForUnlock: boolean;
    setIsWaitingForUnlock: Dispatch<SetStateAction<boolean>>;
    awaitingTime: number;
    setAwaitingTime: Dispatch<SetStateAction<number>>;
    examGroupDetail?: ExamGroup;
    setExamGroupDetail: Dispatch<SetStateAction<ExamGroup | undefined>>;
    unlockingIndex: number | null;
    setUnlockingIndex: Dispatch<SetStateAction<number | null>>;
    unlockNextExam: () => void;
}

export const ExamFlowContext = createContext<ExamFlowContextType | null>(null);

export const useExamFlow = () => {
    const context = useContext(ExamFlowContext);
    if (!context) {
        throw new Error("useExamFlow must be used inside ExamFlowProvider");
    }
    return context;
};