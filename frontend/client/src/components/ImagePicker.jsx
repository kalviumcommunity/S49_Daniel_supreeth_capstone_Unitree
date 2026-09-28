import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { compressImage } from "../lib/image";

// Lets the user upload photos (compressed in the browser) or paste an image URL.
// value: string (single) or string[] (multiple)
export default function ImagePicker({ value, onChange, multiple = false, max = 5, label = "Photo" }) {
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const images = multiple ? value || [] : value ? [value] : [];

  const update = (list) => onChange(multiple ? list : list[0] || "");

  const handleFiles = async (e) => {
    setError("");
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    const room = multiple ? max - images.length : 1;
    if (files.length > room) setError(`You can add ${room} more photo${room === 1 ? "" : "s"}.`);

    try {
      const compressed = await Promise.all(files.slice(0, room).map((f) => compressImage(f)));
      update(multiple ? [...images, ...compressed] : compressed);
    } catch (err) {
      setError(err.message);
    }
  };

  const addUrl = () => {
    const trimmed = url.trim();
    if (!/^https?:\/\//.test(trimmed)) {
      setError("Please enter a valid image URL starting with http(s)://");
      return;
    }
    setError("");
    update(multiple ? [...images, trimmed].slice(0, max) : [trimmed]);
    setUrl("");
  };

  const remove = (i) => update(images.filter((_, idx) => idx !== i));
  const canAdd = multiple ? images.length < max : true;

  return (
    <div>
      <span className="label">{label}</span>

      {images.length > 0 && (
        <div className={`grid gap-3 mb-3 ${multiple ? "grid-cols-3" : "grid-cols-1"}`}>
          {images.map((src, i) => (
            <div key={i} className="relative group">
              <img
                src={src}
                alt={`Upload ${i + 1}`}
                className={`w-full object-cover rounded-lg border ${multiple ? "h-24" : "h-48"}`}
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 cursor-pointer"
                aria-label="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {canAdd && (
        <div className="space-y-2">
          <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg py-4 text-sm text-gray-500 cursor-pointer hover:border-blue-400 hover:text-blue-600 transition">
            <ImagePlus size={18} />
            {images.length && !multiple ? "Replace photo" : "Upload from device"}
            <input type="file" accept="image/*" multiple={multiple} onChange={handleFiles} className="hidden" />
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="...or paste an image URL"
              className="input text-sm"
            />
            <button type="button" onClick={addUrl} className="btn-outline text-sm">
              Add
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
