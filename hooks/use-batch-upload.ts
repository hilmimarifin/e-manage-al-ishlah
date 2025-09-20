import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

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
      
      if (data.success) {
        const { created, duplicates, totalProcessed } = data.data;
        let message = `Successfully uploaded ${created} students`;
        
        if (duplicates.length > 0) {
          message += `, ${duplicates.length} duplicates skipped`;
        }
        
        if (totalProcessed > created + duplicates.length) {
          const failed = totalProcessed - created - duplicates.length;
          message += `, ${failed} failed`;
        }
        
        toast.success(message);
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || 'Failed to upload students';
      toast.error(errorMessage);
    },
  });
}
