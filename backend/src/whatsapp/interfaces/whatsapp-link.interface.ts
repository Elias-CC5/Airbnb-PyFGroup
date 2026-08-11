export interface WhatsappLink {
  phone: string;
  message: string;
  url: string;
}

export interface WhatsappContext {
  propertyTitle: string;
  location: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  guestName?: string;
}
