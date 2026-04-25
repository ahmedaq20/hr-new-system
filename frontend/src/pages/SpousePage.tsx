import React from 'react'
import EmpGateSideBar from '../components/EmpGateSideBar';
import SpouseList from '../components/SpouseList';

const SpousePage: React.FC = () => {
    return (
        <div>
            <EmpGateSideBar>
                <SpouseList />
            </EmpGateSideBar>
        </div>
    )
}

export default SpousePage;
