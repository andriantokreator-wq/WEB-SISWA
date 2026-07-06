import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { LogIn, LogOut, ShieldCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import { CATEGORIES } from "@/lib/constants";

export default function Header() {
  const { user, role, login, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      {/* Main Header */}
      <div className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-blue-900 font-black text-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
              <img src="/logo.jpg" alt="PK-SMS Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter leading-none group-hover:text-blue-200 transition-colors">PK-SMS</h1>
              <p className="text-[10px] uppercase tracking-widest opacity-80 font-semibold mt-1 text-blue-200">Pusat Kegiatan Siswa MAN 1 Jember</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center space-x-4 border-l border-blue-700 pl-6">
                <div className="text-right hidden lg:block">
                  <p className="text-xs font-bold leading-none">{user.displayName}</p>
                  <p className="text-[10px] text-blue-200 mt-1">{user.email}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center font-bold text-sm">
                  {user.displayName?.charAt(0) || 'A'}
                </div>
                {(role === 'superadmin' || role === 'editor') && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="gap-2 border-blue-700 bg-blue-800 text-white hover:bg-blue-700 hover:text-white">
                      <ShieldCheck className="w-4 h-4" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-blue-200 hover:text-white hover:bg-blue-800">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={login} size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 shadow-sm">
                <LogIn className="w-4 h-4" />
                Masuk
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-blue-200 hover:text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Navigation - Desktop */}
      <nav className="hidden md:block border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex flex-wrap items-center space-x-8 text-xs font-bold uppercase tracking-wide py-3 text-slate-600">
            <li>
              <Link to="/" className="hover:text-blue-600 transition-colors cursor-pointer">
                Beranda
              </Link>
            </li>
            {CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link to={`/category/${cat.slug}`} className="hover:text-blue-600 transition-colors cursor-pointer">
                  {cat.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Navigation - Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-slate-50 absolute w-full shadow-lg">
          <div className="px-4 py-2 space-y-1">
            <Link to="/" className="block px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wide text-slate-900 hover:bg-blue-50 hover:text-blue-700" onClick={() => setIsMobileMenuOpen(false)}>Beranda</Link>
            {CATEGORIES.map((cat) => (
              <Link key={cat.slug} to={`/category/${cat.slug}`} className="block px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wide text-slate-600 hover:bg-blue-50 hover:text-blue-700" onClick={() => setIsMobileMenuOpen(false)}>
                {cat.name}
              </Link>
            ))}
            <div className="border-t border-slate-200 pt-4 pb-2 mt-4">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-xs font-bold text-slate-600">Masuk sebagai: <span className="text-blue-600">{user.displayName}</span></div>
                  {(role === 'superadmin' || role === 'editor') && (
                    <Link to="/admin" className="block px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wide text-blue-700 bg-blue-50" onClick={() => setIsMobileMenuOpen(false)}>
                      Dashboard Admin
                    </Link>
                  )}
                  <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full text-left block px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wide text-red-600 hover:bg-red-50">
                    Keluar
                  </button>
                </div>
              ) : (
                <button onClick={() => { login(); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wide bg-blue-600 text-white hover:bg-blue-700">
                  <LogIn className="w-5 h-5" /> Masuk
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
