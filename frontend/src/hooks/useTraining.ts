import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import toast from 'react-hot-toast';

export const useTraining = () => {
    const queryClient = useQueryClient();

    const { data: courses = [], isLoading, error } = useQuery({
        queryKey: ['training-courses'],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.TRAINING_COURSES.LIST);
            // The controller returns DataTables payload if it's not a View
            // But we modified index to return this.data($request) which is Datatables format
            // Actually, if we want a simple list for the frontend, we might need a separate way or just handle the DT format
            return data.data || data;
        },
    });

    const createCourse = useMutation({
        mutationFn: (newCourse: any) => api.post(ENDPOINTS.TRAINING_COURSES.CREATE, newCourse),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-courses'] });
            toast.success('تم إضافة الدورة بنجاح');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء الإضافة');
        },
    });

    const updateCourse = useMutation({
        mutationFn: ({ id, data }: { id: number | string; data: any }) => api.put(ENDPOINTS.TRAINING_COURSES.UPDATE(id), data),
        onSuccess: (_, variables) => {
            const courseId = String(variables.id);
            queryClient.invalidateQueries({ queryKey: ['training-courses'] });
            queryClient.invalidateQueries({ queryKey: ['training-course-details', courseId] });
            toast.success('تم تحديث الدورة بنجاح');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء التحديث');
        },
    });

    const deleteCourse = useMutation({
        mutationFn: (id: number) => api.delete(ENDPOINTS.TRAINING_COURSES.DELETE(id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-courses'] });
            toast.success('تم حذف الدورة بنجاح');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء الحذف');
        },
    });

    return {
        courses,
        isLoading,
        error,
        createCourse,
        updateCourse,
        deleteCourse,
    };
};

export const useCourseDetails = (id: number | string | undefined) => {
    const queryClient = useQueryClient();
    const courseId = id ? String(id) : undefined;

    const { data, isLoading, error } = useQuery({
        queryKey: ['training-course-details', courseId],
        queryFn: async () => {
            if (!courseId) return null;
            const { data } = await api.get(ENDPOINTS.TRAINING_COURSES.DETAILS(courseId));
            return data;
        },
        enabled: !!courseId,
    });

    const addParticipant = useMutation({
        mutationFn: (participantData: { employee_ids: number[] }) =>
            api.post(`/training-courses/${courseId}/participants`, participantData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-course-details', courseId] });
            toast.success('تم إضافة المشاركين بنجاح');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء إضافة المشاركين');
        },
    });

    const removeParticipant = useMutation({
        mutationFn: (participantId: number) =>
            api.delete(`/training-courses/${courseId}/participants/${participantId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-course-details', courseId] });
            toast.success('تم حذف المشارك بنجاح');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء حذف المشارك');
        },
    });

    const addSupervisor = useMutation({
        mutationFn: (supervisorData: any) =>
            api.post(`/training-courses/${courseId}/supervisors`, supervisorData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-course-details', courseId] });
            toast.success('تم إضافة المشرف بنجاح');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء إضافة المشرف');
        },
    });

    const removeSupervisor = useMutation({
        mutationFn: (supervisorId: number) =>
            api.delete(`/training-courses/${courseId}/supervisors/${supervisorId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-course-details', courseId] });
            toast.success('تم حذف المشرف بنجاح');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء حذف المشرف');
        },
    });

    const uploadAttachment = useMutation({
        mutationFn: (formData: FormData) =>
            api.post(`/training-courses/${courseId}/attachments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-course-details', courseId] });
            toast.success('تم رفع المرفق بنجاح');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء رفع المرفق');
        },
    });

    const deleteAttachment = useMutation({
        mutationFn: (attachmentId: number) =>
            api.delete(`/training-courses/${courseId}/attachments/${attachmentId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-course-details', courseId] });
            toast.success('تم حذف المرفق بنجاح');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء حذف المرفق');
        },
    });

    const uploadCertificate = useMutation({
        mutationFn: (formData: FormData) =>
            api.post(`/training-courses/${courseId}/certificates`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-course-details', courseId] });
            toast.success('تم رفع الشهادة بنجاح');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء رفع الشهادة');
        },
    });

    const deleteCertificate = useMutation({
        mutationFn: (certificateId: number) =>
            api.delete(`/training-courses/${courseId}/certificates/${certificateId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-course-details', courseId] });
            toast.success('تم حذف الشهادة بنجاح');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء حذف الشهادة');
        },
    });

    const addAttendance = useMutation({
        mutationFn: (attendanceData: any) =>
            api.post(`/training-courses/${courseId}/attendance`, attendanceData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-attendance', courseId] });
            queryClient.invalidateQueries({ queryKey: ['training-course-details', courseId] });
            toast.success('تم تسجيل الحضور بنجاح');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء تسجيل الحضور');
        },
    });

    const updateAttendance = useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) =>
            api.put(`/training-courses/${courseId}/attendance/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['training-attendance', courseId] });
            queryClient.invalidateQueries({ queryKey: ['training-course-details', courseId] });
            toast.success('تم تحديث البيانات بنجاح');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء التحديث');
        },
    });

    const importAttendance = useMutation({
        mutationFn: (formData: FormData) =>
            api.post(`/training-courses/${courseId}/attendance/import`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            }),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['training-attendance', courseId] });
            queryClient.invalidateQueries({ queryKey: ['training-course-details', courseId] });
            toast.success(response.data.message || 'تم استيراد البيانات بنجاح');
        },
        onError: (error: any) => {
            if (error.response?.status === 422 && error.response.data?.errors) {
                const errorMessages = Object.values(error.response.data.errors).flat();
                if (errorMessages.length > 0) {
                    toast.error(errorMessages[0] as string, { duration: 5000 });
                    if (errorMessages.length > 1) {
                        console.warn('Multiple validation errors:', errorMessages);
                    }
                    return;
                }
            }
            toast.error(error.response?.data?.message || 'حدث خطأ أثناء الاستيراد');
        },
    });

    return {
        course: data?.course,
        sections: data?.sections,
        participants: data?.participants,
        supervisors: data?.supervisors,
        attachments: data?.attachments,
        meta: data?.meta,
        isLoading,
        error,
        addParticipant,
        removeParticipant,
        addSupervisor,
        removeSupervisor,
        uploadAttachment,
        deleteAttachment,
        uploadCertificate,
        deleteCertificate,
        addAttendance,
        updateAttendance,
        importAttendance
    };
};

export const useAttendance = (courseId: string | undefined, filters: any = {}) => {
    return useQuery({
        queryKey: ['training-attendance', courseId, filters],
        queryFn: async () => {
            if (!courseId) return null;
            const { data } = await api.get(`/training-courses/${courseId}/attendance`, { params: filters });
            return data;
        },
        enabled: !!courseId,
    });
};
