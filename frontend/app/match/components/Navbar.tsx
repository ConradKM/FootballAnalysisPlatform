import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white text-black px-6 py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">MyApp</div>
        <div className="space-x-4">
          <Link href="/" className="hover:text-gray-500">Home</Link>
          <Link href="/about" className="hover:text-gray-500">About</Link>
          <Link href="/dashboard" className="hover:text-gray-500">Dashboard</Link>
          <Link href="/contact" className="hover:text-gray-500">Contact</Link>
        </div>
      </div>
    </nav>
  );
}
