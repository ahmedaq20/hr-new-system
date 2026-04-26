import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

export interface Child {
    id: number;
    full_name: string;
    gender: 'ذكر' | 'أنثى' | string;
    id_number: string;
    birth_date: string;
    marital_status: string;
    is_working: boolean;
    is_university_student: boolean;
    mother_full_name: string;
    mother_id_number: string;
    notes: string | null;
    approval_status: 'approved' | 'pending' | 'rejected' | string;
    approval_status_ar?: string;
    rejection_reason: string | null;
    id_card_image_url: string | null;
    birth_certificate_image_url: string | null;
    university_certificate_image_url: string | null;
}

export const useEmployeeChildren = () => {
    return useQuery<Child[]>({
        queryKey: ["employeeChildren"],
        queryFn: async () => {
            const response = await api.get(ENDPOINTS.EMPLOYEE.CHILDREN);
            return response.data.data;
        },
    });
};

export const useAddEmployeeChild = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData: FormData) => {
            const response = await api.post(ENDPOINTS.EMPLOYEE.CHILDREN, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employeeChildren"] });
            queryClient.invalidateQueries({ queryKey: ["employee-dashboard"] });
        },
    });
};

export const useUpdateEmployeeChild = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
            const response = await api.post(`${ENDPOINTS.EMPLOYEE.CHILDREN}/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employeeChildren"] });
            queryClient.invalidateQueries({ queryKey: ["employee-dashboard"] });
        },
    });
};

export const useDeleteEmployeeChild = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const response = await api.delete(`${ENDPOINTS.EMPLOYEE.CHILDREN}/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employeeChildren"] });
            queryClient.invalidateQueries({ queryKey: ["employee-dashboard"] });
        },
    });
};
