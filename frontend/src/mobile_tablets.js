import React from "react";

export default function Ap() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">My App</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-xl">
          Login
        </button>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between p-6 gap-6">
        <div className="flex-1">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">
            Beautiful Responsive UI
          </h2>
          <p className="text-gray-600 mb-4">
            This page is optimized for mobile and tablets using Tailwind CSS.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-lg">
            Get Started
          </button>
        </div>

        <div className="flex-1">
          <img
            src="https://via.placeholder.com/400"
            alt="UI"
            className="rounded-2xl shadow-lg w-full"
          />
        </div>
      </section>

      {/* Cards Section */}
      <section className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-white p-4 rounded-2xl shadow-md hover:shadow-xl transition"
          >
            <h3 className="text-lg font-semibold mb-2">Card {item}</h3>
            <p className="text-gray-500">
              This is a responsive card component.
            </p>
          </div>
        ))}
      </section>
      {/* Footer */}
      <footer className="bg-white mt-auto p-4 text-center text-gray-500">
        © 2026 My App
      </footer>
    </div>
  );
}
