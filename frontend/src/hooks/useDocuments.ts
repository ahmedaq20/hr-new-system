import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import toast from 'react-hot-toast';

export interface EmployeeDocument {
    id: number;
    employee_id: number;
    employee_name: string;
    document_type: string;
    certificate_type?: string;
    status: 'pending' | 'accepted' | 'refused';
    notes?: string;
    file_url?: string;
    upload_date: string;
}

export const useDocuments = (type: 'academic' | 'administrative', params: { page?: number, pageSize?: number, search?: string, status?: string } = {}) => {
    const queryClient = useQueryClient();
    const endpoint = type === 'academic' ? ENDPOINTS.DOCUMENTS.ACADEMIC : ENDPOINTS.DOCUMENTS.ADMINISTRATIVE;

    // Fetch documents
    const { data, isLoading, error } = useQuery<{ data: EmployeeDocument[], meta: any }>({
        queryKey: ['documents', type, params],
        queryFn: async () => {
            const { data } = await api.get(endpoint, {
                params: {
                    start: params.page ? (params.page - 1) * (params.pageSize || 10) : 0,
                    length: params.pageSize || 10,
                    search: params.search,
                    status: params.status,
                    draw: params.page || 1
                }
            });
            return data;
        },
    });

    const documents = data?.data || [];
    const meta = data?.meta || null;

    // Create document (Upload)
    const uploadDocument = useMutation({
        mutationFn: async (formData: FormData) => {
            const { data } = await api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents', type] });
            toast.success('تم رفع الوثيقة بنجاح');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء الرفع');
        }
    });

    // Update Status
    const updateStatus = useMutation({
        mutationFn: async ({ id, status, notes }: { id: number, status: string, notes?: string }) => {
            console.log('Updating document:', { id, status, notes, url: ENDPOINTS.DOCUMENTS.STATUS(id) });
            const { data } = await api.put(ENDPOINTS.DOCUMENTS.STATUS(id), { status, notes });
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents', type] });
            toast.success('تم تحديث الحالة بنجاح');
        },
        onError: (err: any) => {
            console.error('Update status error:', err);
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء تحديث الحالة');
        }
    });

    // Delete document
    const deleteDocument = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(ENDPOINTS.DOCUMENTS.DELETE(id));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents', type] });
            toast.success('تم حذف الوثيقة بنجاح');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء الحذف');
        }
    });

    // Download document
    const downloadDocument = useMutation({
        mutationFn: async ({ id, fileName }: { id: number, fileName: string }) => {
            const response = await api.get(ENDPOINTS.DOCUMENTS.DOWNLOAD(id), {
                responseType: 'blob',
            });

            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || `document-${id}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        },
        onError: (err: any) => {
            console.error('Download error:', err);
            toast.error('حدث خطأ أثناء تحميل الملف');
        }
    });

    return {
        documents,
        meta,
        isLoading,
        error,
        uploadDocument,
        updateStatus,
        deleteDocument,
        downloadDocument
    };
};
