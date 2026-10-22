import React, { useState } from 'react';
import { apiCall } from '../api';

// ============================================================
// IMAGE UPLOAD
// ============================================================
const MAX_IMAGES = 8;

async function compressAndUpload(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1800;
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
        else { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(objectUrl);
      canvas.toBlob(async (blob) => {
        try {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const base64 = e.target.result.split(',')[1];
            const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            const { url } = await apiCall('/api/upload', {
              method: 'POST',
              body: { filename: `listing-${uid}.jpg`, contentType: 'image/jpeg', data: base64 },
            });
            resolve(url);
          };
          reader.readAsDataURL(blob);
        } catch (err) { reject(err); }
      }, 'image/jpeg', 0.82);
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}

export function ImageUpload({ urls = [], onChange }) {
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState(null);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    const slots = MAX_IMAGES - urls.length;
    const toUpload = files.slice(0, slots);
    setUploading(true);
    setPending(toUpload.length);
    setError(null);
    try {
      const newUrls = await Promise.all(toUpload.map(f => compressAndUpload(f)));
      onChange([...urls, ...newUrls].slice(0, MAX_IMAGES));
    } catch {
      setError('One or more uploads failed — check connection and try again.');
    } finally {
      setUploading(false);
      setPending(0);
    }
  };

  const remove = (i) => {
    const next = [...urls];
    next.splice(i, 1);
    onChange(next);
  };

  const canAdd = urls.length < MAX_IMAGES && !uploading;

  return (
    <div>
      <div className="admin-image-upload">
        {urls.map((url, i) => (
          <div key={i} className="admin-image-preview">
            <img src={url} alt={`Photo ${i + 1}`} />
            <button type="button" className="admin-image-remove" onClick={() => remove(i)}>✕</button>
          </div>
        ))}
        {uploading && (
          <div className="admin-image-drop uploading">
            Uploading {pending} photo{pending !== 1 ? 's' : ''}…
          </div>
        )}
        {canAdd && (
          <label className="admin-image-drop">
            <span className="admin-image-plus">+</span>
            <span>Add photos</span>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              style={{ display: 'none' }}
              onChange={handleFiles}
            />
          </label>
        )}
      </div>
      {error && <div className="admin-image-error" style={{ marginTop: 6 }}>{error}</div>}
      {urls.length > 0 && (
        <div className="admin-image-meta">{urls.length} / {MAX_IMAGES} photos · First photo is the cover</div>
      )}
    </div>
  );
}
