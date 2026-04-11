import { Link, useSearchParams } from "react-router-dom";

export default function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const message = searchParams.get("message");
  const bookingId = searchParams.get("bookingId");

  return (
    <div className="min-h-screen bg-[#f6f7fb] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-[28px] bg-white border border-slate-100 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.06)] text-center">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Payment Failed
        </h1>
        <p className="mt-2 text-slate-500">
          Your booking payment could not be completed.
        </p>

        {message && (
          <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {message}
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/my-bookings"
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
          >
            Go to My Bookings
          </Link>

          <Link
            to="/vehicles"
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Back to Vehicles
          </Link>

          {bookingId && (
            <Link
              to="/my-bookings"
              className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-100"
            >
              Retry from My Bookings
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}