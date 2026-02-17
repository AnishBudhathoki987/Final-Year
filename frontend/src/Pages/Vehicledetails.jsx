import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

export default function Vehicledetails() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOne = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/vehicles/${id}`);
        setVehicle(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!vehicle) return <div className="p-6">Not found</div>;

  const price =
    vehicle.type === "rent" ? `NPR ${vehicle.pricePerDay}/day` : `NPR ${vehicle.price}`;

  const img = vehicle.images?.[0] || "https://via.placeholder.com/1200x800?text=CarFusion";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1100px] mx-auto px-4 py-10">
        <Link to="/vehicles" className="text-blue-600 font-semibold">← Back</Link>

        <div className="mt-4 grid lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <img src={img} alt={vehicle.title} className="w-full h-80 object-cover" />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <p className="text-xs font-bold text-blue-600 uppercase">{vehicle.type}</p>
            <h1 className="text-3xl font-black text-slate-900">{vehicle.title}</h1>
            <p className="text-slate-600 mt-1">{vehicle.location}</p>

            <p className="mt-4 text-2xl font-black text-slate-900">{price}</p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700">
              <Spec label="Brand" value={vehicle.brand || "-"} />
              <Spec label="Model" value={vehicle.model || "-"} />
              <Spec label="Year" value={vehicle.year || "-"} />
              <Spec label="Seats" value={vehicle.seats || "-"} />
              <Spec label="Fuel" value={vehicle.fuelType || "-"} />
              <Spec label="Transmission" value={vehicle.transmission || "-"} />
            </div>

            <p className="mt-4 text-slate-600">
              {vehicle.description || "No description provided."}
            </p>

            <div className="mt-6 flex gap-2">
              <button
                className="flex-1 h-11 rounded-lg bg-blue-600 text-white font-bold"
                onClick={() => alert("Booking/Purchase will be in Sprint 3/4")}
              >
                {vehicle.type === "rent" ? "Book Now" : "Purchase Now"}
              </button>

              <button
                className="h-11 px-4 rounded-lg border border-slate-200 font-bold hover:bg-slate-100"
                onClick={() => {
                  const current = JSON.parse(localStorage.getItem("compare") || "[]");
                  if (!current.includes(vehicle._id)) {
                    localStorage.setItem(
                      "compare",
                      JSON.stringify([...current, vehicle._id].slice(-3))
                    );
                    alert("Added to compare");
                  }
                }}
              >
                Add Compare
              </button>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Broker: {vehicle.createdBy?.username || "Unknown"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}
