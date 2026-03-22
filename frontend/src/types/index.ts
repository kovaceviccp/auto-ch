export type VehicleType = "car" | "van" | "truck" | "bus" | "trailer" | "agricultural" | "construction";
export type FuelType = "petrol" | "diesel" | "electric" | "hybrid" | "plugin_hybrid" | "lpg" | "cng" | "hydrogen";
export type TransmissionType = "manual" | "automatic" | "semi_automatic";
export type ConditionType = "new" | "used" | "damaged";
export type ListingStatus = "active" | "sold" | "expired" | "draft";
export type UserRole = "buyer" | "seller" | "dealer" | "admin";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  company_name?: string;
  canton?: string;
  city?: string;
  created_at: string;
}

export interface Listing {
  id: number;
  seller_id: number;
  title: string;
  description?: string;
  vehicle_type: VehicleType;
  condition: ConditionType;
  status: ListingStatus;
  make: string;
  model: string;
  year: number;
  mileage_km?: number;
  fuel_type?: FuelType;
  transmission?: TransmissionType;
  engine_cc?: number;
  power_kw?: number;
  doors?: number;
  seats?: number;
  color?: string;
  price_chf: number;
  price_negotiable: boolean;
  leasing_available: boolean;
  canton: string;
  city?: string;
  images: string[];
  features: Record<string, unknown>;
  views: number;
  is_featured: boolean;
  created_at: string;
  seller?: {
    id: number;
    name: string;
    company_name?: string;
    canton?: string;
    phone?: string;
  };
}

export interface ListingsResponse {
  items: Listing[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export const SWISS_CANTONS = [
  { code: "AG", name: "Aargau" },
  { code: "AI", name: "Appenzell Innerrhoden" },
  { code: "AR", name: "Appenzell Ausserrhoden" },
  { code: "BE", name: "Bern" },
  { code: "BL", name: "Basel-Landschaft" },
  { code: "BS", name: "Basel-Stadt" },
  { code: "FR", name: "Fribourg" },
  { code: "GE", name: "Geneva" },
  { code: "GL", name: "Glarus" },
  { code: "GR", name: "Graubünden" },
  { code: "JU", name: "Jura" },
  { code: "LU", name: "Lucerne" },
  { code: "NE", name: "Neuchâtel" },
  { code: "NW", name: "Nidwalden" },
  { code: "OW", name: "Obwalden" },
  { code: "SG", name: "St. Gallen" },
  { code: "SH", name: "Schaffhausen" },
  { code: "SO", name: "Solothurn" },
  { code: "SZ", name: "Schwyz" },
  { code: "TG", name: "Thurgau" },
  { code: "TI", name: "Ticino" },
  { code: "UR", name: "Uri" },
  { code: "VD", name: "Vaud" },
  { code: "VS", name: "Valais" },
  { code: "ZG", name: "Zug" },
  { code: "ZH", name: "Zürich" },
];

export const CAR_MAKES = [
  "Audi", "BMW", "Mercedes-Benz", "Volkswagen", "Porsche", "Volvo",
  "Toyota", "Honda", "Ford", "Renault", "Peugeot", "Citroën",
  "Fiat", "Opel", "Skoda", "Seat", "Hyundai", "Kia",
  "Tesla", "Land Rover", "Jaguar", "Mazda", "Mitsubishi",
  "Nissan", "Subaru", "Suzuki", "Dacia", "Alfa Romeo", "Lancia",
];
