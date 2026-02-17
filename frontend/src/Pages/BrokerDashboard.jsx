import { Link } from "react-router-dom";

export default function BrokerDashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1100px] mx-auto px-4 py-10">
        <h1 className="text-3xl font-black text-slate-900">Broker Dashboard</h1>
        <p className="mt-2 text-slate-600">Manage your vehicle listings here.</p>

        <div className="mt-6">
          <Link
            to="/broker/manage-vehicles"
            className="inline-flex items-center h-11 px-5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
          >
            Manage Vehicles →
          </Link>
        </div>
      </div>
    </div>
  );
}
