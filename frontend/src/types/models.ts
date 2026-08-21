export type Role = 'USER' | 'HOST' | 'ADMIN' | 'SUPER_ADMIN';
export type PropertyStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'INACTIVE';
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role: Role;
  isActive?: boolean;
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  order?: number;
  _count?: { properties: number };
}

export interface Amenity {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  group?: string | null;
}

export interface AmenityGroup {
  group: string;
  items: Amenity[];
}

export interface Department {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  propertiesCount?: number;
}

export interface Province { id: number; name: string; slug: string; departmentId: number }
export interface District { id: number; name: string; slug: string; provinceId: number }

export interface PropertyImage {
  id: string;
  url: string;
  alt?: string | null;
  isMain: boolean;
  order: number;
}

export interface PropertyLocation {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  reference?: string | null;
  department: { id: number; name: string; slug: string };
  province: { id: number; name: string };
  district?: { id: number; name: string } | null;
}

export interface PropertyCard {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  pricePerNight: string | number;
  currency: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  ratingAvg: number;
  reviewsCount: number;
  isFeatured: boolean;
  status: PropertyStatus;
  createdAt: string;
  category: { id: number; name: string; slug: string };
  images: PropertyImage[];
  location: PropertyLocation;
  isFavorite?: boolean;
}

export interface PropertyDetail extends PropertyCard {
  description: string;
  cleaningFee: string | number;
  beds: number;
  minNights: number;
  maxNights?: number | null;
  views: number;
  whatsappPhone?: string | null;
  checkInTime: string;
  checkOutTime: string;
  ownerId: string;
  owner: { id: string; firstName: string; lastName: string; avatarUrl?: string | null; createdAt: string };
  amenities: Array<{ amenity: Amenity }>;
  reviews: Review[];

  // Reglas de la casa
  petsAllowed: boolean;
  smokingAllowed: boolean;
  partiesAllowed: boolean;
  suitableForChildren: boolean;
  quietHoursFrom?: string | null;
  quietHoursTo?: string | null;
  houseRules?: string | null;

  // Detalles del espacio
  areaM2?: number | null;
  floor?: number | null;
  hasElevator: boolean;
  bedType?: BedType | null;
  viewType?: string | null;

  // Políticas y cobros
  cancellationPolicy: CancellationPolicy;
  securityDeposit: string | number;
  extraGuestFee: string | number;
  weeklyDiscount: number;
  monthlyDiscount: number;
}

export type BedType = 'SINGLE' | 'DOUBLE' | 'QUEEN' | 'KING' | 'BUNK' | 'SOFA_BED';
export type CancellationPolicy = 'FLEXIBLE' | 'MODERATE' | 'STRICT';

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; avatarUrl?: string | null };
}

export interface ReviewSummary {
  total: number;
  average: number;
  distribution: Array<{ stars: number; count: number }>;
}

export interface Reservation {
  id: string;
  code: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  pricePerNight: string | number;
  cleaningFee: string | number;
  totalPrice: string | number;
  currency: string;
  status: ReservationStatus;
  /** Nombre del huésped cuando la reserva viene de otro canal y no de un usuario registrado. */
  guestName?: string | null;
  notes?: string | null;
  createdAt: string;
  cancelReason?: string | null;
  property: {
    id: string;
    title: string;
    slug: string;
    whatsappPhone?: string | null;
    checkInTime: string;
    checkOutTime: string;
    images: Array<{ url: string; alt?: string | null }>;
    location: { department: { name: string }; province: { name: string } };
  };
  user?: { id: string; firstName: string; lastName: string; email: string; phone?: string | null };
  review?: { id: string; rating: number } | null;
}

export interface AvailabilityResult {
  available: boolean;
  reason?: string;
  nights: number;
  pricePerNight: number;
  cleaningFee: number;
  subtotal: number;
  total: number;
  currency: string;
}

export interface OccupiedRange {
  from: string;
  to: string;
  type: 'reservation' | 'block';
}

export interface DashboardStats {
  properties: { total: number; active: number; inactive: number };
  reservations: { total: number; pending: number; confirmed: number; completed: number; cancelled: number };
  users: { total: number; newThisMonth: number };
  revenue: { total: number; thisMonth: number; currency: string };
}

export interface WhatsappLink {
  phone: string;
  message: string;
  url: string;
}
