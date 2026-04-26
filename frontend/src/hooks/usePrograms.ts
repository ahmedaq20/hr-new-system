import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

export interface Program {
    id: number;
    name: string;
    duration: string;
    start_date: string;
    end_date: string;
    funding_source: string;
    notes?: string;
}

// Fetch all programs
export const usePrograms = (options: any = {}) => {
    return useQuery({
        queryKey: ['programs'],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.PROGRAMS.LIST);
            // The backend returns { data: [...] } based on TempContractProjectsResource
            return data.data || [];
        },
        ...options
    });
};

// Fetch single program
export const useProgram = (id: string | number) => {
    return useQuery({
        queryKey: ['programs', id],
        queryFn: async (): Promise<Program> => {
            const { data } = await api.get(ENDPOINTS.PROGRAMS.DETAILS(id));
            return data.data;
        },
        enabled: !!id,
    });
};

// Create program
export const useCreateProgram = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newProgram: Omit<Program, 'id'>) => {
            const { data } = await api.post(ENDPOINTS.PROGRAMS.CREATE, newProgram);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
        },
    });
};

// Update program
export const useUpdateProgram = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string | number; data: Partial<Program> }) => {
            const res = await api.put(ENDPOINTS.PROGRAMS.UPDATE(id), data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
        },
    });
};

// Delete program
export const useDeleteProgram = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string | number) => {
            await api.delete(ENDPOINTS.PROGRAMS.DELETE(id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['programs'] });
        },
    });
};
