import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import { toast } from 'react-hot-toast';

export interface EmployeeDegree {
    id: number;
    employee_id: number;
    qualification_id: number;
    major_name: string;
    university_name: string;
    graduation_year: number;
    document_path: string;
    grade: string;
    certificate_attachment: string;
    notes: string;
    approval_status: 'pending' | 'approved' | 'rejected';
    rejection_reason?: string;
    qualification?: {
        id: number;
        value: string;
    };
}

export const useEmployeeDegrees = (employeeId?: number) => {
    return useQuery({
        queryKey: ['employee-degrees', employeeId],
        queryFn: async () => {
            const url = employeeId
                ? `${ENDPOINTS.EMPLOYEE.DEGREES}/employee/${employeeId}`
                : `${ENDPOINTS.EMPLOYEE.DEGREES}/all`; // Or handle differently for current user
            const { data } = await api.get(url);
            return data.data as EmployeeDegree[];
        },
        enabled: true,
    });
};

export const useAddEmployeeDegree = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (formData: FormData) => {
            const { data } = await api.post(ENDPOINTS.EMPLOYEE.DEGREES, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employee-degrees'] });
            queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
            toast.success('تم إرسال طلب إضافة الشهادة بنجاح.');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'حدث خطأ أثناء إرسال البيانات';
            toast.error(message);
        },
    });
};

export const useUpdateEmployeeDegree = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
            // Because we might send files, use POST with _method=PUT spoofing
            data.append('_method', 'PUT');
            const response = await api.post(`${ENDPOINTS.EMPLOYEE.DEGREES}/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employee-degrees'] });
            queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
            toast.success('تم تحديث بيانات الشهادة بنجاح.');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'حدث خطأ أثناء التحديث';
            toast.error(message);
        },
    });
};

export const useDeleteEmployeeDegree = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await api.delete(`${ENDPOINTS.EMPLOYEE.DEGREES}/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employee-degrees'] });
            queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
            toast.success('تم حذف الشهادة بنجاح.');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'حدث خطأ أثناء الحذف';
            toast.error(message);
        },
    });
};
