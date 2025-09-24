import { useState, useEffect } from 'react';
import { DashboardApiResponse, DashboardData } from '@/types/dashboard';

export function useDashboard(year?: string) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const url = year 
          ? `/api/dashboard?year=${encodeURIComponent(year)}`
          : '/api/dashboard';
        
        const response = await fetch(url);
        const result: DashboardApiResponse = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [year]);

  const refetch = () => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const url = year 
          ? `/api/dashboard?year=${encodeURIComponent(year)}`
          : '/api/dashboard';
        
        const response = await fetch(url);
        const result: DashboardApiResponse = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message || 'Failed to fetch dashboard data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
}
