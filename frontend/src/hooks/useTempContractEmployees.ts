import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

export interface TempEmployeeFilters {
    filter_full_name?: string;
    filter_national_id?: string;
    filter_primary_phone?: string;
    filter_position_type?: string;
    filter_temp_contract_project_id?: string | number;
    filter_governorate_id?: string | number;
    filter_certificate_id?: string | number;
    filter_gender?: string;
    filter_marital_status?: string;
    filter_birthdate_from?: string;
    filter_birthdate_to?: string;
    filter_start_contract_from?: string;
    filter_start_contract_to?: string;
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
            if (filters.filter_primary_phone) params.append("filter_primary_phone", filters.filter_primary_phone);
            if (filters.filter_position_type) params.append("filter_position_type", filters.filter_position_type);
            if (filters.filter_temp_contract_project_id) params.append("filter_temp_contract_project_id", filters.filter_temp_contract_project_id.toString());
            if (filters.filter_governorate_id) params.append("filter_governorate_id", filters.filter_governorate_id.toString());
            if (filters.filter_certificate_id) params.append("filter_certificate_id", filters.filter_certificate_id.toString());
            if (filters.filter_gender) params.append("filter_gender", filters.filter_gender);
            if (filters.filter_marital_status) params.append("filter_marital_status", filters.filter_marital_status);
            if (filters.filter_birthdate_from) params.append("filter_birthdate_from", filters.filter_birthdate_from);
            if (filters.filter_birthdate_to) params.append("filter_birthdate_to", filters.filter_birthdate_to);
            if (filters.filter_start_contract_from) params.append("filter_start_contract_from", filters.filter_start_contract_from);
            if (filters.filter_start_contract_to) params.append("filter_start_contract_to", filters.filter_start_contract_to);
            
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
