// src/Pages/AddVehicle.jsx
import React, { useMemo, useState } from "react";
import {
  MdFeed,
  MdImage,
  MdCloudUpload,
  MdDelete,
  MdLocationOn,
  MdArrowForward,
  MdExpandMore,
} from "react-icons/md";

/**
 * IMPORTANT:
 * ✅ Do NOT import BrokerNavbar here.
 * Your App/Layout already shows BrokerNavbar for /broker/* routes.
 */

export default function AddVehicle() {
  const [listingType, setListingType] = useState("rent"); // "rent" | "purchase"
  const [transmission, setTransmission] = useState("automatic"); // "automatic" | "manual"

  const [form, setForm] = useState({
    carName: "",
    year: "",
    modelVariant: "",
    price: "",
    mileage: "",
    fuelType: "",
    category: "",
    location: "",
    description: "",
  });

  const [images, setImages] = useState([]);

  const previews = useMemo(
    () =>
      images.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [images]
  );

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const onPickImages = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setImages((prev) => [...prev, ...files].slice(0, 6)); // max 6
    e.target.value = "";
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = (e) => {
    e.preventDefault();

    // TODO: replace with your API call
    const payload = {
      listingType,
      transmission,
      ...form,
      imagesCount: images.length,
    };

    console.log("PUBLISH LISTING:", payload);
    alert("Publish Listing (demo) — check console.");
  };

  const cancel = () => {
    // reset
    setListingType("rent");
    setTransmission("automatic");
    setForm({
      carName: "",
      year: "",
      modelVariant: "",
      price: "",
      mileage: "",
      fuelType: "",
      category: "",
      location: "",
      description: "",
    });
    setImages([]);
  };

  const charCount = form.description?.length || 0;

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-slate-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
        {/* Page Header */}
        <div className="text-center mb-10 max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Add Vehicle Listing
          </h1>
          <p className="mt-3 text-slate-600 text-base md:text-lg">
            Enter the details below to showcase your premium vehicle to potential
            buyers or renters.
          </p>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Vehicle Details */}
          <div className="lg:col-span-7 space-y-8">
            <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
              {/* Section header + toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7 pb-6 border-b border-slate-200">
                <h2 className="text-lg sm:text-xl font-extrabold flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600/10 text-blue-700">
                    <MdFeed className="text-xl" />
                  </span>
                  Vehicle Details
                </h2>

                <div className="inline-flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setListingType("rent")}
                    className={`px-4 py-2 rounded-lg text-sm font-extrabold transition ${
                      listingType === "rent"
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Rent
                  </button>
                  <button
                    type="button"
                    onClick={() => setListingType("purchase")}
                    className={`px-4 py-2 rounded-lg text-sm font-extrabold transition ${
                      listingType === "purchase"
                        ? "bg-white text-blue-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Purchase
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Car Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Car Name
                  </label>
                  <input
                    name="carName"
                    value={form.carName}
                    onChange={onChange}
                    placeholder="e.g. BMW X5 M Competition"
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Year
                  </label>
                  <input
                    name="year"
                    value={form.year}
                    onChange={onChange}
                    type="number"
                    placeholder="2024"
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Model Variant */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Model Variant
                  </label>
                  <input
                    name="modelVariant"
                    value={form.modelVariant}
                    onChange={onChange}
                    placeholder="xDrive40i"
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Price{" "}
                    <span className="text-xs font-semibold text-slate-500">
                      ({listingType === "rent" ? "per day" : "total"})
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-extrabold">
                      $
                    </span>
                    <input
                      name="price"
                      value={form.price}
                      onChange={onChange}
                      type="number"
                      placeholder="0.00"
                      className="w-full h-12 pl-8 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Mileage */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Mileage{" "}
                    <span className="text-xs font-semibold text-slate-500">
                      (km)
                    </span>
                  </label>
                  <input
                    name="mileage"
                    value={form.mileage}
                    onChange={onChange}
                    type="number"
                    placeholder="e.g. 12,500"
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Fuel Type
                  </label>
                  <div className="relative">
                    <select
                      name="fuelType"
                      value={form.fuelType}
                      onChange={onChange}
                      className="w-full h-12 px-4 pr-10 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      <option value="" disabled>
                        Select Fuel Type
                      </option>
                      <option value="petrol">Petrol</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                    <MdExpandMore className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-2xl pointer-events-none" />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={form.category}
                      onChange={onChange}
                      className="w-full h-12 px-4 pr-10 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      <option value="" disabled>
                        Select Body Type
                      </option>
                      <option value="suv">SUV</option>
                      <option value="sedan">Sedan</option>
                      <option value="hatchback">Hatchback</option>
                      <option value="coupe">Coupe</option>
                      <option value="convertible">Convertible</option>
                    </select>
                    <MdExpandMore className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-2xl pointer-events-none" />
                  </div>
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MdLocationOn className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xl" />
                    <input
                      name="location"
                      value={form.location}
                      onChange={onChange}
                      placeholder="Enter city or address"
                      className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Transmission */}
                <div className="md:col-span-2 pt-2">
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Transmission
                  </label>

                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="relative inline-flex items-center justify-center w-5 h-5 rounded-full border border-slate-300 bg-white">
                        <input
                          type="radio"
                          name="transmission"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          checked={transmission === "automatic"}
                          onChange={() => setTransmission("automatic")}
                        />
                        {transmission === "automatic" && (
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                        )}
                      </span>
                      <span className="font-semibold text-slate-700">
                        Automatic
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <span className="relative inline-flex items-center justify-center w-5 h-5 rounded-full border border-slate-300 bg-white">
                        <input
                          type="radio"
                          name="transmission"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          checked={transmission === "manual"}
                          onChange={() => setTransmission("manual")}
                        />
                        {transmission === "manual" && (
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                        )}
                      </span>
                      <span className="font-semibold text-slate-700">
                        Manual
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: Media & Description */}
          <div className="lg:col-span-5 space-y-8">
            <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <h2 className="text-lg sm:text-xl font-extrabold flex items-center gap-2 mb-6">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600/10 text-blue-700">
                  <MdImage className="text-xl" />
                </span>
                Media &amp; Description
              </h2>

              {/* Upload */}
              <div className="mb-8">
                <p className="text-sm font-bold text-slate-700 mb-3">
                  Vehicle Images
                </p>

                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onPickImages}
                    className="hidden"
                  />

                  <div className="w-full border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer min-h-[220px]">
                    <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mb-4">
                      <MdCloudUpload className="text-blue-700 text-3xl" />
                    </div>
                    <p className="font-extrabold text-slate-900 mb-1">
                      Click to upload or drag &amp; drop
                    </p>
                    <p className="text-slate-500 text-sm">
                      SVG, PNG, JPG or GIF (max. 5MB)
                    </p>
                  </div>
                </label>

                {/* Previews */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {previews.slice(0, 4).map((p, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group"
                    >
                      <img
                        src={p.url}
                        alt={`upload-${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                        title="Remove"
                      >
                        <MdDelete className="text-white text-2xl hover:text-red-300" />
                      </button>
                    </div>
                  ))}

                  {/* Placeholders to match UI */}
                  {Array.from({ length: Math.max(0, 4 - previews.slice(0, 4).length) }).map(
                    (_, i) => (
                      <div
                        key={`ph-${i}`}
                        className="aspect-square rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400"
                      >
                        <MdImage className="text-2xl" />
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  placeholder="Provide a detailed description of the vehicle, including any special features, history, or condition..."
                  className="w-full min-h-[180px] p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  maxLength={2000}
                />
                <div className="flex justify-end mt-2">
                  <span className="text-xs text-slate-500">
                    {charCount}/2000 characters
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Bottom Actions */}
          <div className="lg:col-span-12 mt-2 flex justify-center">
            <div className="w-full max-w-md flex gap-4">
              <button
                type="button"
                onClick={cancel}
                className="flex-1 h-12 rounded-2xl border border-slate-300 bg-white font-extrabold text-slate-800 hover:bg-slate-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 h-12 rounded-2xl bg-blue-600 text-white font-extrabold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 inline-flex items-center justify-center gap-2"
              >
                Publish Listing <MdArrowForward className="text-xl" />
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* Simple footer like screenshot */}
      <footer className="bg-white border-t border-slate-200 py-7 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© {new Date().getFullYear()} CarFusion Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="hover:text-blue-600 transition" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-blue-600 transition" href="#">
              Terms of Service
            </a>
            <a className="hover:text-blue-600 transition" href="#">
              Help Center
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
