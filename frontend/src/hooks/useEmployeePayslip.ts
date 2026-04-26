import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

export const useEmployeePayslip = (year: number, month: number) => {
    return useQuery({
        queryKey: ['employee-payslip', year, month],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.EMPLOYEE.PAYSLIP, {
                params: { year, month }
            });
            return data.data;
        },
        enabled: !!year && !!month,
    });
};
