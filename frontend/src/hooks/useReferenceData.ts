import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import toast from 'react-hot-toast';

export interface ReferenceDataItem {
    id: number;
    name: string;
    value: string;
    slug?: string;
    employee_count?: number;
    created_at?: string;
    updated_at?: string;
}

export const useReferenceData = (type: string) => {
    const queryClient = useQueryClient();

    // Fetch list
    const { data: items, isLoading, error } = useQuery<ReferenceDataItem[]>({
        queryKey: ['reference-data', type],
        queryFn: async () => {
            const { data } = await api.get(`${ENDPOINTS.REFERENCE_DATA}?type=${type}`);
            return data.data;
        },
        enabled: !!type,
    });

    // Create item
    const createItem = useMutation({
        mutationFn: async (newValue: string) => {
            const { data } = await api.post(ENDPOINTS.REFERENCE_DATA, {
                name: type,
                value: newValue
            });
            return data.reference_data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reference-data', type] });
            toast.success('تمت الإضافة بنجاح');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء الإضافة');
        }
    });

    // Update item
    const updateItem = useMutation({
        mutationFn: async ({ id, value }: { id: number, value: string }) => {
            const { data } = await api.put(`${ENDPOINTS.REFERENCE_DATA}/${id}`, {
                name: type,
                value: value
            });
            return data.referenceData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reference-data', type] });
            toast.success('تم التحديث بنجاح');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء التحديث');
        }
    });

    // Delete item
    const deleteItem = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`${ENDPOINTS.REFERENCE_DATA}/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reference-data', type] });
            toast.success('تم الحذف بنجاح');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'حدث خطأ أثناء الحذف');
        }
    });

    return {
        items,
        isLoading,
        error,
        createItem,
        updateItem,
        deleteItem
    };
};
