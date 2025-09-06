export interface ApiResponse<T = any> {
  status: 'success' | 'error'
  message: string
  dateTime: string
  data?: T
  error?: string
}

export function createSuccessResponse<T>(data: T, message: string = 'Success'): ApiResponse<T> {
  return {
    status: 'success',
    message,
    dateTime: new Date().toISOString(),
    data
  }
}

export function createErrorResponse(error: string, message: string = 'Error occurred'): ApiResponse {
  return {
    status: 'error',
    message,
    dateTime: new Date().toISOString(),
    error
  }
}

export function formatApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  return response.json()
}
