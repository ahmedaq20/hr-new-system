import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import { toast } from 'react-hot-toast';

export const useAddCourseRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ courseId, data }: { courseId?: number; data: FormData }) => {
            const endpoint = courseId
                ? `${ENDPOINTS.TRAINING_COURSES.LIST}/${courseId}/request-registration`
                : `${ENDPOINTS.TRAINING_COURSES.LIST}/request-registration-manual`;
            const { data: responseData } = await api.post(endpoint, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return responseData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
            toast.success('تم إرسال طلب التسجيل في الدورة بنجاح.');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب';
            toast.error(message);
        },
    });
};

export const useUpdateCourseRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ participantId, data }: { participantId: number; data: FormData }) => {
            // Use POST with _method=PUT for multipart/form-data support in Laravel for PUT requests
            data.append('_method', 'PUT');
            const { data: responseData } = await api.post(`${ENDPOINTS.TRAINING_COURSES.LIST}/participants/${participantId}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return responseData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
            toast.success('تم تحديث طلب التسجيل بنجاح.');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'حدث خطأ أثناء تحديث الطلب';
            toast.error(message);
        },
    });
};

export const useDeleteCourseRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (participantId: number) => {
            const { data } = await api.delete(`${ENDPOINTS.TRAINING_COURSES.LIST}/participants/${participantId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employee-dashboard'] });
            toast.success('تم حذف طلب التسجيل بنجاح.');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'حدث خطأ أثناء حذف الطلب';
            toast.error(message);
        },
    });
};
