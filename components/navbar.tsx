'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FacultyNavbar() {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    // For now, simple check. You can replace this with an API call later.
    if (email === 'admin' && password === 'admin') {
      localStorage.setItem('faculty-auth', 'yes');
      router.push('/dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Student Biodata Portal</h1>

        <div className="relative">
          <button
            className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 transition"
            onClick={() => setShowForm(!showForm)}
          >
            Faculty Login
          </button>

          {showForm && (
            <div className="absolute right-0 mt-2 w-72 bg-white text-black p-4 rounded shadow-lg z-50">
              <h2 className="font-bold mb-2 text-center">Login</h2>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-2 mb-2"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-2 mb-3"
              />
              <button
                onClick={handleLogin}
                className="bg-blue-600 text-white px-4 py-2 w-full rounded hover:bg-blue-700"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
