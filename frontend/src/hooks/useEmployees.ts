import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

interface Employee {
    id: string;
    name: string;
    position: string;
    email: string;
    // Add other fields as needed
}

// Fetch all employees with pagination and search
export const useEmployees = (
    page: number = 1,
    pageSize: number = 10,
    searchTerm: string = "",
    extraFilters: Record<string, any> = {},
    options: any = {}
) => {
    return useQuery({
        queryKey: ['employees', page, pageSize, searchTerm, extraFilters],
        queryFn: async () => {
            // DataTables parameters: start (offset), length (limit), draw
            const start = (page - 1) * pageSize;

            // Merge search term and extra filters
            const params: Record<string, any> = {
                start: start,
                length: pageSize,
                draw: page,
                "search[value]": searchTerm,
                ...extraFilters
            };

            const { data } = await api.get(ENDPOINTS.EMPLOYEES.LIST, { params });
            return data;
        },
        placeholderData: (previousData) => previousData, // Keep previous data while fetching new data
        ...options
    });
};

// Fetch single employee
export const useEmployee = (id: string) => {
    return useQuery({
        queryKey: ['employees', id],
        queryFn: async (): Promise<Employee> => {
            const { data } = await api.get(ENDPOINTS.EMPLOYEES.DETAILS(id));
            return data;
        },
        enabled: !!id,
    });
};

// Create employee mutation
export const useCreateEmployee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newEmployee: Omit<Employee, 'id'>) => {
            const { data } = await api.post(ENDPOINTS.EMPLOYEES.CREATE, newEmployee);
            return data;
        },
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['reference-data'] });
        },
    });
};

// Update employee mutation
export const useUpdateEmployee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string | number; data: Partial<Employee> }) => {
            const res = await api.put(ENDPOINTS.EMPLOYEES.UPDATE(id), data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['reference-data'] });
        },
    });
};

// Delete employee mutation
export const useDeleteEmployee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string | number) => {
            await api.delete(ENDPOINTS.EMPLOYEES.DELETE(id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            queryClient.invalidateQueries({ queryKey: ['reference-data'] });
        },
    });
};
