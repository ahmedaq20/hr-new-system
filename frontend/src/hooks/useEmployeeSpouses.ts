import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

export interface Spouse {
    id: number;
    full_name: string;
    spouse_id_number: string;
    birth_date: string | null;
    marriage_date: string;
    approval_status: 'approved' | 'pending' | 'rejected' | string;
    rejection_reason: string | null;
    is_working: boolean;
    mobile: string | null;
    marriage_contract_url: string | null;
}

export const useEmployeeSpouses = () => {
    return useQuery<Spouse[]>({
        queryKey: ["employeeSpouses"],
        queryFn: async () => {
            const response = await api.get(ENDPOINTS.EMPLOYEE.SPOUSES);
            return response.data.data;
        },
    });
};

export const useAddEmployeeSpouse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            const response = await api.post(ENDPOINTS.EMPLOYEE.SPOUSES, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employeeSpouses"] });
            queryClient.invalidateQueries({ queryKey: ["employee-dashboard"] });
        },
    });
};

export const useUpdateEmployeeSpouse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
            const response = await api.post(`${ENDPOINTS.EMPLOYEE.SPOUSES}/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employeeSpouses"] });
            queryClient.invalidateQueries({ queryKey: ["employee-dashboard"] });
        },
    });
};

export const useDeleteEmployeeSpouse = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const response = await api.delete(`${ENDPOINTS.EMPLOYEE.SPOUSES}/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employeeSpouses"] });
            queryClient.invalidateQueries({ queryKey: ["employee-dashboard"] });
        },
    });
};
