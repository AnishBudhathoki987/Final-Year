import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaCloudUploadAlt, FaTrash, FaCheckCircle } from "react-icons/fa";

export default function EditVehicle({ user }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  // ✅ protect page
  useEffect(() => {
    if (!user) navigate("/login");
    else if (user.role !== "broker") navigate("/unauthorized");
  }, [user, navigate]);

  const [loading, setLoading] = useState(true);

  // form state
  const [listingType, setListingType] = useState("rent");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");

  const [pricePerDay, setPricePerDay] = useState("");
  const [price, setPrice] = useState("");

  const [transmission, setTransmission] = useState("Automatic");
  const [fuelType, setFuelType] = useState("Petrol");

  const [features, setFeatures] = useState("");
  const [description, setDescription] = useState("");

  // existing images (urls from DB)
  const [existingImages, setExistingImages] = useState([]); // string[]

  // new images (files)
  const [newImages, setNewImages] = useState([]); // [{file, preview}]
  const fileRef = useRef(null);

  // UI
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ load vehicle data by id
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`/api/vehicles/${id}`);
        const v = res.data?.vehicle ?? res.data;

        setListingType(v.type || "rent");
        setTitle(v.title || "");
        setLocation(v.location || "");
        setCategory(v.category || "");
        setBrand(v.brand || "");
        setModel(v.model || "");
        setYear(v.year ? String(v.year) : "");
        setMileage(v.mileage ? String(v.mileage) : "");

        setPricePerDay(v.pricePerDay ? String(v.pricePerDay) : "");
        setPrice(v.price ? String(v.price) : "");

        setTransmission(v.transmission || "Automatic");
        setFuelType(v.fuelType || "Petrol");

        setFeatures(v.features || "");
        setDescription(v.description || "");

        setExistingImages(Array.isArray(v.images) ? v.images : []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load vehicle.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  // cleanup previews
  useEffect(() => {
    return () => {
      newImages.forEach((img) => img?.preview && URL.revokeObjectURL(img.preview));
    };
  }, [newImages]);

  const handleNewFiles = (files) => {
    const fileArray = Array.from(files || []);
    if (!fileArray.length) return;

    const previews = fileArray.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...previews]);
  };

  const removeNewImage = (idx) => {
    setNewImages((prev) => {
      const removed = prev[idx];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const removeExistingImage = (idx) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    if (!title.trim()) return "Listing title is required.";
    if (!location.trim()) return "Location is required.";
    if (!category.trim()) return "Category is required.";

    if (listingType === "rent" && !String(pricePerDay).trim()) return "Price per day is required.";
    if (listingType === "sale" && !String(price).trim()) return "Total price is required.";

    // keep at least one image overall
    if (existingImages.length === 0 && newImages.length === 0) return "Keep at least 1 image.";
    return "";
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    const v = validate();
    if (v) return setError(v);

    if (!token) return navigate("/login");

    setSaving(true);
    try {
      let uploadedUrls = [];

      // ✅ if user selected new images → upload them
      if (newImages.length > 0) {
        const fd = new FormData();
        newImages.forEach((img) => fd.append("images", img.file));

        const up = await axios.post("/api/upload", fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        uploadedUrls = up.data?.urls || [];
      }

      // ✅ final images = existing kept + new uploaded
      const finalImages = [...existingImages, ...uploadedUrls];

      const payload = {
        title: title.trim(),
        type: listingType,
        location: location.trim(),
        category: category.trim(),

        brand: brand.trim(),
        model: model.trim(),
        year: year ? Number(year) : undefined,
        mileage: mileage ? Number(mileage) : 0,

        fuelType,
        transmission,

        price: listingType === "sale" ? Number(price) : null,
        pricePerDay: listingType === "rent" ? Number(pricePerDay) : null,

        features: features.trim(),
        description: description.trim(),

        images: finalImages,
      };

      await axios.put(`/api/vehicles/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Vehicle updated successfully!");
      setTimeout(() => navigate("/broker/my-vehicles"), 600);
    } catch (err) {
      setError(err?.response?.data?.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7fb]">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="rounded-3xl bg-white border border-slate-100 p-10">
            <p className="text-slate-500">Loading vehicle...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f6f7fb] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Top */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <FaArrowLeft /> Back
          </button>

          <div className="text-center flex-1">
            <h1 className="text-3xl font-extrabold text-slate-900">Edit Vehicle</h1>
            <p className="mt-1 text-sm text-slate-500">Update your listing details.</p>
          </div>

          <div className="w-[84px]" />
        </div>

        {/* Card */}
        <div className="mt-8 rounded-[28px] bg-white border border-slate-100 shadow-[0_30px_90px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Rent / Sale toggle */}
            <div className="flex justify-center">
              <div className="inline-flex rounded-2xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setListingType("rent")}
                  className={`px-6 py-2 rounded-2xl text-sm font-extrabold transition ${
                    listingType === "rent" ? "bg-white text-blue-600 shadow" : "text-slate-600"
                  }`}
                >
                  For Rent
                </button>
                <button
                  type="button"
                  onClick={() => setListingType("sale")}
                  className={`px-6 py-2 rounded-2xl text-sm font-extrabold transition ${
                    listingType === "sale" ? "bg-white text-blue-600 shadow" : "text-slate-600"
                  }`}
                >
                  For Sale
                </button>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700 font-semibold">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold flex items-center gap-2">
                <FaCheckCircle /> {success}
              </div>
            )}

            {/* Basic */}
            <SectionTitle title="Basic Information" />

            <div className="mt-4">
              <Label text="Listing Title" />
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <Label text="Location" />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <Label text="Category" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Select Category</option>
                  <option>SUV</option>
                  <option>Sedan</option>
                  <option>Hatchback</option>
                  <option>Pickup</option>
                  <option>EV</option>
                </select>
              </div>
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <Label text="Brand" />
                <input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <Label text="Model" />
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <Label text="Year" />
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <Label text="Mileage (km)" />
                <input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Pricing */}
            <SectionTitle title="Pricing" />

            <div className="mt-4">
              <Label text={listingType === "rent" ? "Price Per Day (NPR)" : "Total Price (NPR)"} />
              <input
                type="number"
                value={listingType === "rent" ? pricePerDay : price}
                onChange={(e) =>
                  listingType === "rent" ? setPricePerDay(e.target.value) : setPrice(e.target.value)
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Photos */}
            <SectionTitle title="Photos" />

            <input
              type="file"
              multiple
              accept="image/*"
              ref={fileRef}
              onChange={(e) => handleNewFiles(e.target.files)}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-4 w-full rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 p-6 text-center transition"
            >
              <div className="mx-auto h-12 w-12 rounded-2xl bg-white border border-slate-200 grid place-items-center">
                <FaCloudUploadAlt className="text-blue-600 text-xl" />
              </div>
              <p className="mt-3 font-extrabold text-slate-900">Add new images (optional)</p>
              <p className="mt-1 text-sm text-slate-500">They will be added to current images.</p>
            </button>

            {/* existing images */}
            {existingImages.length > 0 && (
              <>
                <p className="mt-6 text-xs font-extrabold text-slate-600">Current Images</p>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {existingImages.map((url, idx) => (
                    <div key={url + idx} className="relative rounded-2xl overflow-hidden border border-slate-200">
                      <img src={url} alt="existing" className="h-32 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-rose-50 transition"
                        title="Remove"
                      >
                        <FaTrash className="text-rose-500 text-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* new images */}
            {newImages.length > 0 && (
              <>
                <p className="mt-6 text-xs font-extrabold text-slate-600">New Images</p>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {newImages.map((img, idx) => (
                    <div key={img.preview} className="relative rounded-2xl overflow-hidden border border-slate-200">
                      <img src={img.preview} alt="new" className="h-32 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-rose-50 transition"
                        title="Remove"
                      >
                        <FaTrash className="text-rose-500 text-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Actions */}
            <div className="mt-10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="rounded-2xl bg-blue-600 px-7 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <div className="mt-10">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-2xl bg-slate-50 border border-slate-200" />
        <h3 className="text-sm font-extrabold text-slate-900">{title}</h3>
      </div>
      <div className="mt-4 h-px w-full bg-slate-100" />
    </div>
  );
}

function Label({ text }) {
  return <p className="mb-2 text-xs font-extrabold text-slate-600">{text}</p>;
}