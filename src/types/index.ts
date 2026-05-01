export interface Trip {
  id: string;
  title: string;
  description: string;
  price: number;
  date: string;
  departure_time: string;
  places_total: number;
  places_reserved: number;
  image_url: string;
  status: 'active' | 'completed' | 'cancelled';
  destinations?: Destination[];
}

export interface Destination {
  id: string;
  trip_id: string;
  name: string;
  order_index: number;
  description?: string;
}

export interface Reservation {
  id: string;
  trip_id: string;
  full_name: string;
  phone: string;
  persons: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}
