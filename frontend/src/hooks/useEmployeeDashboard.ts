import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

export const useEmployeeDashboard = () => {
    return useQuery({
        queryKey: ['employee-dashboard'],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.EMPLOYEE.DASHBOARD);
            return data.data;
        },
    });
};
