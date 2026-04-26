import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

export interface Dependent {
    id: number;
    full_name: string;
    dependent_id_number: string;
    birth_date: string;
    mobile: string;
    relationship: string;
    address: string;
    gender: string;
    notes: string;
    approval_status: string;
    approval_status_ar: string;
    rejection_reason: string | null;
    dependency_proof_url: string | null;
}

export const useEmployeeDependents = () => {
    return useQuery<Dependent[]>({
        queryKey: ['employeeDependents'],
        queryFn: async () => {
            const response = await api.get(ENDPOINTS.EMPLOYEE.DEPENDENTS);
            return response.data.data;
        },
    });
};

export const useAddEmployeeDependent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const response = await api.post(ENDPOINTS.EMPLOYEE.DEPENDENTS, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employeeDependents'] });
            queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
        },
    });
};

export const useUpdateEmployeeDependent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
            const response = await api.post(`${ENDPOINTS.EMPLOYEE.DEPENDENTS}/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employeeDependents'] });
            queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
        },
    });
};

export const useDeleteEmployeeDependent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const response = await api.delete(`${ENDPOINTS.EMPLOYEE.DEPENDENTS}/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employeeDependents'] });
            queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
        },
    });
};
