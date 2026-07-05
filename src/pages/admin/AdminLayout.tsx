import { useState } from "react";
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LayoutDashboard, FileText, Users, Image as ImageIcon, LogOut, ExternalLink, Menu, X } from "lucide-react";

export default function AdminLayout() {
  const { user, role, loading, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Memuat Dashboard...</div>;
  }

  if (!user || (role !== "superadmin" && role !== "editor")) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Artikel", path: "/admin/articles", icon: FileText },
    { name: "Galeri", path: "/admin/gallery", icon: ImageIcon },
    ...(role === "superadmin" ? [{ name: "Pengguna", path: "/admin/users", icon: Users }] : []),
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-slate-900 text-white flex flex-col fixed inset-y-0 left-0 z-30 border-r-4 border-blue-900 transition-transform duration-300 lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-serif italic font-bold text-white tracking-tight">PK-SMS Admin</h2>
            <p className="text-[10px] text-blue-400 mt-2 uppercase tracking-widest font-bold">{role}</p>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-sm" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800 rounded-sm transition-colors">
            <ExternalLink className="w-4 h-4" />
            Lihat Website
          </Link>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col w-full">
        <header className="bg-white border-b-2 border-slate-900 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden text-slate-600 p-1"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl lg:text-2xl font-serif italic font-bold text-slate-800 hidden sm:block">
              {navItems.find(i => location.pathname === i.path || (i.path !== '/admin' && location.pathname.startsWith(i.path)))?.name || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-900">{user.displayName}</p>
              <p className="text-[10px] text-slate-500 font-medium">{user.email}</p>
            </div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm lg:text-lg border border-blue-200">
              {user.displayName?.charAt(0) || 'A'}
            </div>
          </div>
        </header>
        <div className="p-4 lg:p-8 flex-1 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
