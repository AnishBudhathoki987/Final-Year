// src/Pages/AddVehicle.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCloudUploadAlt,
  FaTrash,
  FaCheckCircle,
} from "react-icons/fa";

export default function AddVehicle({ user }) {
  const navigate = useNavigate();

  // ✅ Protect page: only broker
  useEffect(() => {
    if (!user) navigate("/login");
    else if (user.role !== "broker") navigate("/unauthorized");
  }, [user, navigate]);

  const [listingType, setListingType] = useState("rent"); // rent | sale

  // Basic
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");

  // Pricing
  const [pricePerDay, setPricePerDay] = useState("");
  const [price, setPrice] = useState("");

  // Specs
  const [transmission, setTransmission] = useState("Automatic");
  const [fuelType, setFuelType] = useState("Petrol");

  // Other
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState("");
  const [instantBooking, setInstantBooking] = useState(true); // UI only for now

  // Photos (file previews)
  const [images, setImages] = useState([]); // [{file, preview}]
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef(null);

  // UI State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFiles = (files) => {
    const fileArray = Array.from(files || []);
    if (fileArray.length === 0) return;

    const previews = fileArray.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...previews]);
  };

  // ✅ cleanup previews (avoid memory leak)
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img?.preview) URL.revokeObjectURL(img.preview);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const removeImage = (idx) => {
    setImages((prev) => {
      const removed = prev[idx];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const validate = () => {
    if (!title.trim()) return "Listing title is required.";
    if (!location.trim()) return "Location is required.";
    if (!category.trim()) return "Category is required.";
    if (listingType === "rent" && !String(pricePerDay).trim())
      return "Price per day is required for rent listings.";
    if (listingType === "sale" && !String(price).trim())
      return "Total price is required for sale listings.";
    if (images.length === 0) return "Please upload at least 1 image.";
    return "";
  };

  const publishListing = async () => {
    setError("");
    setSuccess("");

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setSubmitting(true);
    try {
      // ✅ STEP 1: upload images
      const fd = new FormData();
      images.forEach((img) => fd.append("images", img.file));

      const up = await axios.post("/api/upload", fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const imageUrls = up.data?.urls || [];
      if (imageUrls.length === 0) {
        setError("Upload returned no image URLs.");
        setSubmitting(false);
        return;
      }

      // ✅ STEP 2: create vehicle with image urls
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

        images: imageUrls,
      };

      await axios.post("/api/vehicles", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Listing published successfully!");
      setTimeout(() => navigate("/broker/dashboard"), 600);
    } catch (err) {
      console.log(err);
      setError(
        err?.response?.data?.message ||
          "Failed to publish listing. Check upload route and vehicle route."
      );
    } finally {
      setSubmitting(false);
    }
  };

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
            <h1 className="text-3xl font-extrabold text-slate-900">
              Add Vehicle Listing
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Create a new listing for the broker network. Ensure all details are
              accurate.
            </p>
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
                    listingType === "rent"
                      ? "bg-white text-blue-600 shadow"
                      : "text-slate-600"
                  }`}
                >
                  For Rent
                </button>
                <button
                  type="button"
                  onClick={() => setListingType("sale")}
                  className={`px-6 py-2 rounded-2xl text-sm font-extrabold transition ${
                    listingType === "sale"
                      ? "bg-white text-blue-600 shadow"
                      : "text-slate-600"
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

            {/* BASIC INFORMATION */}
            <SectionTitle title="Basic Information" />

            <div className="mt-4">
              <Label text="Listing Title" />
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 2024 Toyota Land Cruiser ZX"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <Label text="Location" />
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <FaMapMarkerAlt className="text-slate-400" />
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Kathmandu, Nepal"
                    className="w-full text-sm outline-none"
                  />
                </div>
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
                  placeholder="e.g. Toyota"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <Label text="Model" />
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Land Cruiser"
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
                  placeholder="2024"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <Label text="Mileage (km)" />
                <input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* PRICING */}
            <SectionTitle title="Pricing & Availability" />

            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <Label
                  text={
                    listingType === "rent"
                      ? "Price Per Day (NPR)"
                      : "Total Price (NPR)"
                  }
                />
                <input
                  type="number"
                  value={listingType === "rent" ? pricePerDay : price}
                  onChange={(e) =>
                    listingType === "rent"
                      ? setPricePerDay(e.target.value)
                      : setPrice(e.target.value)
                  }
                  placeholder={listingType === "rent" ? "15000" : "4500000"}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-extrabold text-slate-900">
                    Instant Booking
                  </p>
                  <p className="text-xs text-slate-500">
                    Allow booking without manual approval
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setInstantBooking((p) => !p)}
                  className={`w-12 h-7 rounded-full relative transition ${
                    instantBooking ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                      instantBooking ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* TECH SPECS */}
            <SectionTitle title="Technical Specifications" />

            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <Label text="Transmission" />
                <div className="inline-flex w-full rounded-2xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setTransmission("Automatic")}
                    className={`flex-1 px-5 py-2 rounded-2xl text-sm font-extrabold transition ${
                      transmission === "Automatic"
                        ? "bg-white text-blue-600 shadow"
                        : "text-slate-600"
                    }`}
                  >
                    Automatic
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransmission("Manual")}
                    className={`flex-1 px-5 py-2 rounded-2xl text-sm font-extrabold transition ${
                      transmission === "Manual"
                        ? "bg-white text-blue-600 shadow"
                        : "text-slate-600"
                    }`}
                  >
                    Manual
                  </button>
                </div>
              </div>

              <div>
                <Label text="Fuel Type" />
                <select
                  value={fuelType}
                  onChange={(e) => setFuelType(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-100"
                >
                  <option>Petrol</option>
                  <option>Diesel</option>
                  <option>Electric</option>
                  <option>Hybrid</option>
                </select>
              </div>
            </div>

            {/* PHOTOS */}
            <SectionTitle title="Vehicle Photos" />

            <input
              type="file"
              multiple
              accept="image/*"
              ref={fileRef}
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />

            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              className={`mt-4 cursor-pointer rounded-3xl border-2 border-dashed p-10 text-center transition ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <div className="mx-auto h-12 w-12 rounded-2xl bg-white border border-slate-200 grid place-items-center">
                <FaCloudUploadAlt className="text-blue-600 text-xl" />
              </div>
              <p className="mt-3 font-extrabold text-slate-900">
                Click to upload or drag and drop
              </p>
              <p className="mt-1 text-sm text-slate-500">
                PNG, JPG, JPEG (Max 5MB each)
              </p>
            </div>

            {images.length > 0 && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className="relative rounded-2xl overflow-hidden border border-slate-200"
                  >
                    <img
                      src={img.preview}
                      alt="preview"
                      className="h-32 w-full object-cover"
                    />

                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-black/75 text-white text-[10px] font-extrabold px-2 py-1 rounded-full">
                        COVER
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-rose-50 transition"
                      title="Remove"
                    >
                      <FaTrash className="text-rose-500 text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* DESCRIPTION */}
            <SectionTitle title="Detailed Description" />

            <div className="mt-4">
              <Label text="Features (short)" />
              <input
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="e.g. 4WD, Sunroof, Apple CarPlay"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="mt-4">
              <Label text="Description" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Highlight key features, condition, maintenance history..."
                rows={5}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-blue-100 resize-none"
              />
              <div className="mt-1 text-right text-xs text-slate-400">
                {description.length}/1000
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={publishListing}
                className="rounded-2xl bg-blue-600 px-7 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition disabled:opacity-60"
              >
                {submitting ? "Publishing..." : "Publish Listing"}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Need assistance?{" "}
          <span className="text-blue-600 font-semibold">Contact Support</span>
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
