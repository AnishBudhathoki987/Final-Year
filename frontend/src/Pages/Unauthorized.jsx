export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-400">Unauthorized</h1>
        <p className="text-gray-400 mt-2">You don’t have access to this page.</p>
      </div>
    </div>
  );
}
