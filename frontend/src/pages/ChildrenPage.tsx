import React from 'react';
import EmpGateSideBar from '../components/EmpGateSideBar';
import ChildrenList from '../components/ChildrenList';

const ChildrenPage: React.FC = () => {
    return (
        <div dir="rtl">
            <EmpGateSideBar>
                <div className="px-2">
                    <ChildrenList />
                </div>
            </EmpGateSideBar>
        </div>
    );
};

export default ChildrenPage;
