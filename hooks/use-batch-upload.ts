import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface BatchUploadResult {
  created: number;
  duplicates: string[];
  totalProcessed: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    value: any;
  }>;
}

interface BatchUploadResponse {
  success: boolean;
  data: BatchUploadResult;
  message: string;
}

export function useBatchUploadStudents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File): Promise<BatchUploadResponse> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<BatchUploadResponse>('/students/batch', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response;
    },
    onSuccess: (data) => {
      // Invalidate students query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error: any) => {
      // Let the form handle error display
      console.error('Batch upload error:', error);
    },
  });
}
