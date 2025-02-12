export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
}

export interface Location {
  latitude: number;
  longitude: number;
}
