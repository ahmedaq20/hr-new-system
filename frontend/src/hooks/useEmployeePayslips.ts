import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

export const useEmployeePayslips = () => {
    return useQuery({
        queryKey: ['employee-payslips'],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.EMPLOYEE.PAYSLIPS);
            return data.data;
        },
    });
};
