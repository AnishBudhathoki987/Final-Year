import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AddVehicle() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    type: "rent",
    price: "",
    pricePerDay: "",
    location: "",
    brand: "",
    model: "",
    year: "",
    fuelType: "",
    transmission: "",
    seats: 5,
    description: "",
    images: "",
  });
  const [error, setError] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const payload = {
      title: form.title,
      type: form.type,
      location: form.location,
      brand: form.brand || "",
      model: form.model || "",
      year: form.year ? Number(form.year) : undefined,
      fuelType: form.fuelType || "",
      transmission: form.transmission || "",
      seats: form.seats ? Number(form.seats) : 5,
      description: form.description || "",
      price: form.type === "sale" ? Number(form.price) : null,
      pricePerDay: form.type === "rent" ? Number(form.pricePerDay) : null,
      images: form.images
        ? form.images.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    };

    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/vehicles", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/broker/manage-vehicles");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add vehicle");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[900px] mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-slate-900">Add Vehicle</h1>

        {error && <p className="mt-4 p-3 bg-red-100 text-red-700 rounded">{error}</p>}

        <form onSubmit={onSubmit} className="mt-6 bg-white border border-slate-200 rounded-xl p-6 grid gap-4">
          <Input label="Title" name="title" value={form.title} onChange={onChange} required />
          <Input label="Location" name="location" value={form.location} onChange={onChange} required />

          <div className="grid md:grid-cols-2 gap-4">
            <Select
              label="Type"
              name="type"
              value={form.type}
              onChange={onChange}
              options={[
                { value: "rent", label: "Rent" },
                { value: "sale", label: "Sale" },
              ]}
            />

            {form.type === "rent" ? (
              <Input
                label="Price Per Day (NPR)"
                name="pricePerDay"
                type="number"
                value={form.pricePerDay}
                onChange={onChange}
                required
              />
            ) : (
              <Input
                label="Price (NPR)"
                name="price"
                type="number"
                value={form.price}
                onChange={onChange}
                required
              />
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Input label="Brand" name="brand" value={form.brand} onChange={onChange} />
            <Input label="Model" name="model" value={form.model} onChange={onChange} />
            <Input label="Year" name="year" type="number" value={form.year} onChange={onChange} />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Input label="Fuel Type" name="fuelType" value={form.fuelType} onChange={onChange} />
            <Input label="Transmission" name="transmission" value={form.transmission} onChange={onChange} />
            <Input label="Seats" name="seats" type="number" value={form.seats} onChange={onChange} />
          </div>

          <label className="grid gap-1">
            <span className="text-sm font-bold text-slate-700">Images (comma separated URLs)</span>
            <input
              className="h-11 rounded-lg border border-slate-200 px-3"
              name="images"
              value={form.images}
              onChange={onChange}
              placeholder="https://...jpg, https://...png"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-bold text-slate-700">Description</span>
            <textarea
              className="min-h-28 rounded-lg border border-slate-200 px-3 py-2"
              name="description"
              value={form.description}
              onChange={onChange}
            />
          </label>

          <button className="h-12 rounded-lg bg-blue-600 text-white font-black hover:bg-blue-700">
            Save Vehicle
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <input className="h-11 rounded-lg border border-slate-200 px-3" {...props} />
    </label>
  );
}

function Select({ label, options, ...props }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <select className="h-11 rounded-lg border border-slate-200 px-3" {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
