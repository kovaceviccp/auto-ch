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
  likes_count: number;
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

export interface FavoriteStatus {
  liked: boolean;
  count: number;
}

export interface ChatMessage {
  id: number;
  room_id: number;
  sender_id: number;
  sender_name: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatRoom {
  id: number;
  buyer_id: number;
  seller_id: number;
  listing_id: number;
  listing_title: string;
  listing_image?: string;
  other_user_name: string;
  other_user_id: number;
  last_message?: string;
  unread_count: number;
  created_at: string;
}

export interface Inquiry {
  id: number;
  listing_id: number;
  buyer_id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  message?: string;
  test_drive: boolean;
  want_leasing: boolean;
  want_installment: boolean;
  want_insurance: boolean;
  want_trade_in: boolean;
  is_read: boolean;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  listing_title?: string;
}

export const CAR_MAKES = [
  "Audi", "BMW", "Mercedes-Benz", "Volkswagen", "Porsche", "Volvo",
  "Toyota", "Honda", "Ford", "Renault", "Peugeot", "Citroën",
  "Fiat", "Opel", "Skoda", "Seat", "Hyundai", "Kia",
  "Tesla", "Land Rover", "Jaguar", "Mazda", "Mitsubishi",
  "Nissan", "Subaru", "Suzuki", "Dacia", "Alfa Romeo", "Lancia",
];

export const CAR_MODELS: Record<string, string[]> = {
  "Audi":          ["A1","A3","A4","A5","A6","A7","A8","Q2","Q3","Q4 e-tron","Q5","Q7","Q8","TT","R8","e-tron","e-tron GT","RS3","RS4","RS6","S3","S4","S5"],
  "BMW":           ["1er","2er","3er","4er","5er","6er","7er","8er","X1","X2","X3","X4","X5","X6","X7","M2","M3","M4","M5","M8","iX","iX1","iX3","i4","i5","i7","Z4"],
  "Mercedes-Benz": ["A-Klasse","B-Klasse","C-Klasse","CLA","CLS","E-Klasse","G-Klasse","GLA","GLB","GLC","GLE","GLS","S-Klasse","SL","AMG GT","EQA","EQB","EQC","EQE","EQS","V-Klasse"],
  "Volkswagen":    ["Up","Polo","Golf","Golf Plus","Golf Variant","Passat","Passat Variant","Arteon","Tiguan","T-Roc","T-Cross","Touareg","Touran","Sharan","ID.3","ID.4","ID.5","ID.7","Caddy","Multivan"],
  "Porsche":       ["718 Boxster","718 Cayman","911","Cayenne","Cayenne Coupé","Macan","Panamera","Taycan","Taycan Cross Turismo"],
  "Volvo":         ["C40","S60","S90","V60","V60 Cross Country","V90","V90 Cross Country","XC40","XC60","XC90","EX30","EX40","EX90"],
  "Toyota":        ["Aygo","Yaris","Yaris Cross","Corolla","Corolla Touring Sports","Camry","C-HR","RAV4","Highlander","Land Cruiser","Hilux","Prius","bZ4X","GR86","GR Yaris","Supra"],
  "Honda":         ["Jazz","Civic","Accord","HR-V","CR-V","ZR-V","e","e:Ny1"],
  "Ford":          ["Fiesta","Focus","Focus Turnier","Mondeo","Mustang","Mustang Mach-E","Puma","Kuga","Explorer","Ranger","Transit","Transit Custom","Tourneo"],
  "Renault":       ["Twingo","Clio","Megane","Megane E-Tech","Arkana","Captur","Kadjar","Austral","Scenic","Espace","Zoe","Kangoo"],
  "Peugeot":       ["108","208","308","408","508","2008","3008","5008","e-208","e-2008","e-308","Partner","Expert","Traveller"],
  "Citroën":       ["C1","C3","C3 Aircross","C4","C4 X","C5 Aircross","ë-C4","ë-Berlingo","Berlingo","SpaceTourer","Jumper"],
  "Fiat":          ["500","500e","500X","500L","Panda","Tipo","Bravo","Ducato","Doblo","Scudo"],
  "Opel":          ["Adam","Agila","Astra","Astra Sports Tourer","Cascada","Corsa","Crossland","Grandland","Insignia","Mokka","Mokka-e","Vectra","Vivaro","Zafira"],
  "Skoda":         ["Citigo","Fabia","Octavia","Octavia Combi","Scala","Superb","Superb Combi","Kamiq","Karoq","Kodiaq","Enyaq","Enyaq Coupé"],
  "Seat":          ["Mii","Ibiza","Leon","Leon Sportstourer","Arona","Ateca","Tarraco","Formentor","Born"],
  "Hyundai":       ["i10","i20","i30","i30 Fastback","i40","Kona","Kona Electric","Tucson","Santa Fe","Staria","IONIQ","IONIQ 5","IONIQ 6"],
  "Kia":           ["Picanto","Rio","Ceed","ProCeed","Stinger","Soul","Stonic","XCeed","Sportage","Sorento","Carnival","Niro","EV6","EV9"],
  "Tesla":         ["Model 3","Model S","Model X","Model Y","Cybertruck"],
  "Land Rover":    ["Defender","Discovery","Discovery Sport","Range Rover","Range Rover Sport","Range Rover Evoque","Range Rover Velar"],
  "Jaguar":        ["XE","XF","XJ","E-Pace","F-Pace","I-Pace","F-Type"],
  "Mazda":         ["Mazda2","Mazda3","Mazda6","CX-3","CX-30","CX-5","CX-60","MX-5","MX-30"],
  "Mitsubishi":    ["Space Star","ASX","Eclipse Cross","Outlander","Outlander PHEV","L200","Pajero"],
  "Nissan":        ["Micra","Juke","Leaf","Ariya","Qashqai","X-Trail","Navara","GT-R","370Z"],
  "Subaru":        ["Impreza","Legacy","Outback","Forester","XV","BRZ","WRX","Crosstrek","Solterra"],
  "Suzuki":        ["Alto","Swift","Ignis","Baleno","S-Cross","Vitara","Jimny","Across"],
  "Dacia":         ["Sandero","Sandero Stepway","Logan","Logan MCV","Duster","Jogger","Spring"],
  "Alfa Romeo":    ["MiTo","Giulietta","Giulia","Stelvio","Tonale","4C"],
  "Lancia":        ["Ypsilon","Delta","Musa"],
};

export const CAR_COLORS: { value: string; label_de: string; label_en: string; hex: string }[] = [
  { value: "schwarz",    label_de: "Schwarz",       label_en: "Black",        hex: "#1a1a1a" },
  { value: "weiss",      label_de: "Weiss",         label_en: "White",        hex: "#f5f5f5" },
  { value: "silber",     label_de: "Silber",        label_en: "Silver",       hex: "#c0c0c0" },
  { value: "grau",       label_de: "Grau",          label_en: "Grey",         hex: "#808080" },
  { value: "blau",       label_de: "Blau",          label_en: "Blue",         hex: "#1e40af" },
  { value: "dunkelblau", label_de: "Dunkelblau",    label_en: "Dark Blue",    hex: "#1e3a5f" },
  { value: "hellblau",   label_de: "Hellblau",      label_en: "Light Blue",   hex: "#60a5fa" },
  { value: "rot",        label_de: "Rot",           label_en: "Red",          hex: "#dc2626" },
  { value: "weinrot",    label_de: "Weinrot",       label_en: "Bordeaux",     hex: "#7f1d1d" },
  { value: "gruen",      label_de: "Grün",          label_en: "Green",        hex: "#16a34a" },
  { value: "dunkelgruen",label_de: "Dunkelgrün",    label_en: "Dark Green",   hex: "#14532d" },
  { value: "braun",      label_de: "Braun",         label_en: "Brown",        hex: "#92400e" },
  { value: "beige",      label_de: "Beige",         label_en: "Beige",        hex: "#d4b483" },
  { value: "orange",     label_de: "Orange",        label_en: "Orange",       hex: "#ea580c" },
  { value: "gelb",       label_de: "Gelb",          label_en: "Yellow",       hex: "#ca8a04" },
  { value: "gold",       label_de: "Gold",          label_en: "Gold",         hex: "#b7950b" },
  { value: "violett",    label_de: "Violett",       label_en: "Purple",       hex: "#7c3aed" },
  { value: "andere",     label_de: "Andere",        label_en: "Other",        hex: "#9ca3af" },
];
