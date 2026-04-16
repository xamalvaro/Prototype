const CLOUD_NAME = 'dc2jvwwug';
const UPLOAD_PRESET = 'newspace_uploads';

// Upload a file (image or video) to Cloudinary
// Returns { url, publicId, mediaType: 'image'|'video' }
export async function uploadMedia(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  const res = await fetch(endpoint, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
    mediaType: resourceType,
  };
}
