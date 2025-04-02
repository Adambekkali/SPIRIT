"use client";
import { useState } from "react";
import AuthButton from "@/components/auth-button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X } from "lucide-react"; // Si vous utilisez lucide-react

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  const navLinks = [
    { name: "Accueil", href: "/" },
    { name: "Compétitions", href: "/competitions" },
    { name: "Épreuves", href: "/epreuves" },
    { name: "Couples", href: "/couples" },
  ];

  // Liens administratifs conditionnels
  const adminLinks =
    user?.type === "administrateur"
      ? [{ name: "Administration", href: "/admin" }]
      : [];

  const juryLinks =
    user?.type === "jury" ? [{ name: "Jury", href: "/jury" }] : [];

  // Tous les liens
  const allLinks = [...navLinks, ...adminLinks, ...juryLinks];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-indigo-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-white text-3xl font-bold tracking-tight hover:text-indigo-100 transition"
          >
            SPIRIT
          </Link>

          {/* Navigation pour desktop */}
          <nav className="hidden md:flex space-x-6">
            {allLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-white hover:text-indigo-200 transition font-medium"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Auth button et mobile menu */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex justify-center w-28">
              <AuthButton />
            </div>

            {/* Bouton menu mobile */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="md:hidden bg-indigo-900/90 border-t border-indigo-700">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-3">
            {allLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-white hover:text-indigo-200 py-2 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2">
              <AuthButton />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
