function App() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-2xl text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Tailind CSS is Working 🎉
        </h1>
        <p className="text-gray-600 mb-6">
          If you see colors, spacing, and styling → Tailwind is properly applied.
        </p>
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-600 transition">
          Test Button
        </button>
      </div>
    </div>
  );
}

export default App;