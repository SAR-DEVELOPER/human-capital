// lib/api/services/suratTugas.ts
import { SuratTugasDBData, SuratTugasDetailResponse } from "../../types/suratTugas";

/**
 * Error response interface
 */
interface ErrorResponse {
  message: string;
  status: number;
}

/**
 * Create surat tugas response interface
 */
interface CreateSuratTugasResponse {
  id: string;
  message: string;
  data?: any;
}

export const SuratTugasService = {
  /**
   * Get the current number for surat tugas based on month and year
   * @param month Month (1-12)
   * @param year Year (e.g., 2025)
   * @returns Promise with the current number
   */
  getCurrentNumber: async (month: number, year: number): Promise<number> => {
    try {
      const params = new URLSearchParams();
      params.append('month', month.toString());
      params.append('year', year.toString());

      const url = `/api/surat-tugas/current-number?${params.toString()}`;

      console.log('Fetching current surat tugas number from:', url);
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // Important: include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch current surat tugas number: ${response.status}` }));
        throw new Error(errorData.message || errorData.error || 'Failed to fetch current surat tugas number');
      }

      const data = await response.json();
      console.log('Current number response:', data);

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch current surat tugas number';
      console.error('Error fetching current surat tugas number:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Create a new surat tugas
   * @param data SuratTugasDBData to send to the backend
   * @returns Promise with the creation response
   */
  createSuratTugas: async (data: SuratTugasDBData): Promise<CreateSuratTugasResponse> => {
    try {
      const url = '/api/surat-tugas/create';

      console.log('Creating surat tugas at:', url);
      console.log('Request payload:', JSON.stringify(data, null, 2));

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include', // Important: include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to create surat tugas: ${response.status}` }));
        throw new Error(errorData.message || errorData.error || 'Failed to create surat tugas');
      }

      const responseData = await response.json();
      console.log('Create surat tugas response:', responseData);

      return responseData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create surat tugas';
      console.error('Error creating surat tugas:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Get all surat tugas
   * @returns Promise with array of surat tugas
   */
  getAllSuratTugas: async (): Promise<any[]> => {
    try {
      // Use Next.js API route to avoid CORS issues
      const url = '/api/surat-tugas/get-all';

      console.log('Fetching all surat tugas from:', url);
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // Important: include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch surat tugas: ${response.status}` }));
        throw new Error(errorData.message || errorData.error || 'Failed to fetch surat tugas');
      }

      const data = await response.json();
      console.log('Get all surat tugas response:', data);

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch surat tugas';
      console.error('Error fetching surat tugas:', errorMessage);
      throw new Error(errorMessage);
    }
  },

  /**
   * Get surat tugas by ID
   * @param id The surat tugas ID
   * @returns Promise with the surat tugas details
   */
  getSuratTugasById: async (id: string): Promise<SuratTugasDetailResponse> => {
    try {
      const url = `/api/surat-tugas/get-by-id/${id}`;

      console.log('Fetching surat tugas by ID from:', url);
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // Important: include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to fetch surat tugas details: ${response.status}` }));
        throw new Error(errorData.message || errorData.error || 'Failed to fetch surat tugas details');
      }

      const data = await response.json();
      console.log('Get surat tugas by ID response:', data);

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch surat tugas details';
      console.error('Error fetching surat tugas by ID:', errorMessage);
      throw new Error(errorMessage);
    }
  }
};

