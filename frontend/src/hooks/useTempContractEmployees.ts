import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

export interface TempEmployeeFilters {
    filter_full_name?: string;
    filter_national_id?: string;
    filter_primary_phone?: string;
    filter_position_type?: string;
    page?: number;
    length?: number;
}

export const useTempContractEmployees = (filters: TempEmployeeFilters = {}) => {
    return useQuery({
        queryKey: ["temp-contract-employees", filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.filter_full_name) params.append("filter_full_name", filters.filter_full_name);
            if (filters.filter_national_id) params.append("filter_national_id", filters.filter_national_id);
            if (filters.page) params.append("start", ((filters.page - 1) * (filters.length || 10)).toString());
            if (filters.length) params.append("length", filters.length.toString());

            const { data } = await api.get(ENDPOINTS.TEMP_CONTRACT_EMPLOYEES.LIST, { params });
            return data;
        },
    });
};

export const useTempContractEmployee = (id: string | number) => {
    return useQuery({
        queryKey: ["temp-contract-employees", id],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.TEMP_CONTRACT_EMPLOYEES.DETAILS(id));
            return data.data; // Backend returns { data: ... }
        },
        enabled: !!id,
    });
};

export const useCreateTempEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newEmployee: any) => api.post(ENDPOINTS.TEMP_CONTRACT_EMPLOYEES.CREATE, newEmployee),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["temp-contract-employees"] });
        },
    });
};

export const useUpdateTempEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string | number; data: any }) =>
            api.put(ENDPOINTS.TEMP_CONTRACT_EMPLOYEES.UPDATE(id), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["temp-contract-employees"] });
        },
    });
};

export const useDeleteTempEmployee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string | number) => api.delete(ENDPOINTS.TEMP_CONTRACT_EMPLOYEES.DELETE(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["temp-contract-employees"] });
        },
    });
};
