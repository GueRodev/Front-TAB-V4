/**
 * Costa Rica Locations Types
 * Type definitions for Costa Rica geographical locations
 */

export interface CrDistrict {
  id: number;
  nombre: string;
}

export interface CrCanton {
  id: number;
  nombre: string;
  distritos: CrDistrict[];
}

export interface CrProvince {
  id: number;
  nombre: string;
  cantones: CrCanton[];
}

export interface CrLocationsResponse {
  provincias: CrProvince[];
  total_provincias: number;
}

export interface LocationSelection {
  province: string;
  canton: string;
  district: string;
}
