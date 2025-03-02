import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">Parking App</h1>
        <div className="space-x-4">
          <Link href="/" className="text-white hover:underline">Home</Link>
          <Link href="/reservations" className="text-white hover:underline">My Reservations</Link>
        </div>
      </div>
    </nav>
  );
}
