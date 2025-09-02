import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 text-black px-6 py-4 shadow-bottom bg-white">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">FootVis</div>
        <div className="space-x-4">
          <Link href="/" className="hover:text-gray-500">Home</Link>
          <Link href="/match" className="hover:text-gray-500">Matches</Link>
          <Link href="/contact" className="hover:text-gray-500">Contact</Link>
        </div>
      </div>
    </nav>
  );
}
