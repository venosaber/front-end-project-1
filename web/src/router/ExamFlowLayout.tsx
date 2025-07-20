import { Outlet } from 'react-router-dom';
import { ExamFlowProvider } from '../contexts/ExamFlowProvider';

const ExamFlowLayout = () => {
    return (
        <ExamFlowProvider>
            <Outlet />
        </ExamFlowProvider>
    );
};

export default ExamFlowLayout;