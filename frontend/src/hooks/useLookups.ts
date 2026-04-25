import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';

export const useLookups = () => {
    return useQuery({
        queryKey: ['reference-data'],
        queryFn: async () => {
            const { data } = await api.get(ENDPOINTS.REFERENCE_DATA);
            return data.data; // Looking at the response format provided by user
        },
        staleTime: 1000 * 60 * 30, // Reference data is stable, cache for 30 mins
    });
};
