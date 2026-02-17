import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Compare() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const load = async () => {
      const ids = JSON.parse(localStorage.getItem("compare") || "[]");
      if (ids.length === 0) return setVehicles([]);

      const results = await Promise.all(
        ids.map((id) => axios.get(`/api/vehicles/${id}`).then((r) => r.data))
      );
      setVehicles(results);
    };
    load();
  }, []);

  const clear = () => {
    localStorage.removeItem("compare");
    setVehicles([]);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Compare</h1>
            <p className="text-slate-600">Compare up to 3 vehicles.</p>
          </div>
          <div className="flex gap-2">
            <Link
              className="h-10 px-4 rounded-lg bg-white border border-slate-200 font-bold inline-flex items-center"
              to="/vehicles"
            >
              ← Vehicles
            </Link>
            <button onClick={clear} className="h-10 px-4 rounded-lg bg-red-500 text-white font-bold">
              Clear
            </button>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <p className="mt-6 text-slate-600">No vehicles selected for compare.</p>
        ) : (
          <div className="mt-6 overflow-auto bg-white border border-slate-200 rounded-xl">
            <table className="min-w-[900px] w-full text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="p-4">Field</th>
                  {vehicles.map((v) => (
                    <th key={v._id} className="p-4">{v.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <Row label="Type" values={vehicles.map((v) => v.type)} />
                <Row label="Location" values={vehicles.map((v) => v.location)} />
                <Row
                  label="Price"
                  values={vehicles.map((v) =>
                    v.type === "rent" ? `NPR ${v.pricePerDay}/day` : `NPR ${v.price}`
                  )}
                />
                <Row label="Brand" values={vehicles.map((v) => v.brand || "-")} />
                <Row label="Model" values={vehicles.map((v) => v.model || "-")} />
                <Row label="Year" values={vehicles.map((v) => v.year || "-")} />
                <Row label="Seats" values={vehicles.map((v) => v.seats || "-")} />
                <Row label="Fuel" values={vehicles.map((v) => v.fuelType || "-")} />
                <Row label="Transmission" values={vehicles.map((v) => v.transmission || "-")} />
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, values }) {
  return (
    <tr className="border-b border-slate-100">
      <td className="p-4 font-bold text-slate-700">{label}</td>
      {values.map((val, idx) => (
        <td key={idx} className="p-4 text-slate-700">{val}</td>
      ))}
    </tr>
  );
}
