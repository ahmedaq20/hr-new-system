import React from 'react';
import DependentList from '../components/DependentList';
import EmpGateSideBar from '../components/EmpGateSideBar';

const DependentPage: React.FC = () => {
    return (
        <EmpGateSideBar>
            <div className="px-2">
                <DependentList />
            </div>
        </EmpGateSideBar>
    );
};

export default DependentPage;
