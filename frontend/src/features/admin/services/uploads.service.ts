import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/services/api';
import type { PropertyImage } from '@/types';

export const uploadsService = {
  uploadPropertyImages: (propertyId: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.post<PropertyImage[]>(ENDPOINTS.uploads.propertyImages(propertyId), formData);
  },

  setMain: (imageId: string) => api.patch<{ message: string }>(ENDPOINTS.uploads.main(imageId)),
  remove: (imageId: string) => api.delete<{ message: string }>(ENDPOINTS.uploads.image(imageId)),
  reorder: (propertyId: string, imageIds: string[]) =>
    api.patch<PropertyImage[]>(ENDPOINTS.uploads.reorder(propertyId), { imageIds }),
};
