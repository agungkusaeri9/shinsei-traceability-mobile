import { apiClient } from '../../services/httpClient';

export interface Area {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'maintenance' | 'inactive';
  capacity: number;
  currentUsage: number;
  manager: string;
  lastUpdate: string;
}

export interface AreaStats {
  total: number;
  active: number;
  maintenance: number;
  inactive: number;
}

export const areaService = {
  getAreas: async (): Promise<Area[]> => {
    // Mock data - replace with actual API call
    return [
      {
        id: '1',
        name: 'Area Produksi A',
        code: 'PROD-A',
        status: 'active',
        capacity: 150,
        currentUsage: 120,
        manager: 'Ahmad Rizki',
        lastUpdate: '2 jam lalu',
      },
      {
        id: '2',
        name: 'Area Produksi B',
        code: 'PROD-B',
        status: 'active',
        capacity: 200,
        currentUsage: 180,
        manager: 'Siti Nurhaliza',
        lastUpdate: '3 jam lalu',
      },
      {
        id: '3',
        name: 'Gudang Utama',
        code: 'GDG-01',
        status: 'maintenance',
        capacity: 500,
        currentUsage: 350,
        manager: 'Budi Santoso',
        lastUpdate: '1 hari lalu',
      },
      {
        id: '4',
        name: 'Area QC',
        code: 'QC-01',
        status: 'active',
        capacity: 80,
        currentUsage: 65,
        manager: 'Dewi Lestari',
        lastUpdate: '30 menit lalu',
      },
    ];
  },

  getAreaStats: async (): Promise<AreaStats> => {
    // Mock data - replace with actual API call
    return {
      total: 4,
      active: 3,
      maintenance: 1,
      inactive: 0,
    };
  },

  updateArea: async (id: string, data: Partial<Area>): Promise<Area> => {
    // Mock data - replace with actual API call
    throw new Error('API not implemented yet');
  },
};