import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function ManageVehicles() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/vehicles/mine/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = async (id) => {
    if (!window.confirm("Delete this vehicle?")) return;

    const token = localStorage.getItem("token");
    await axios.delete(`/api/vehicles/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    load();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1100px] mx-auto px-4 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-slate-900">Manage Vehicles</h1>
          <Link
            to="/broker/add-vehicle"
            className="h-10 px-4 rounded-lg bg-blue-600 text-white font-bold inline-flex items-center"
          >
            + Add Vehicle
          </Link>
        </div>

        {loading ? (
          <p className="mt-6">Loading...</p>
        ) : items.length === 0 ? (
          <p className="mt-6 text-slate-600">No vehicles yet.</p>
        ) : (
          <div className="mt-6 grid gap-4">
            {items.map((v) => (
              <div
                key={v._id}
                className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-xs font-bold text-blue-600 uppercase">{v.type}</p>
                  <p className="font-black text-slate-900">{v.title}</p>
                  <p className="text-sm text-slate-500">{v.location}</p>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/broker/edit-vehicle/${v._id}`}
                    className="h-10 px-4 rounded-lg border border-slate-200 font-bold hover:bg-slate-100 inline-flex items-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => onDelete(v._id)}
                    className="h-10 px-4 rounded-lg bg-red-500 text-white font-bold hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
