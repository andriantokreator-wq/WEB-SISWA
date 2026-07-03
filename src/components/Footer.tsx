export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-400 px-6 py-8 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs space-y-4 md:space-y-0">
        <div>&copy; {new Date().getFullYear()} PK-SMS MAN 1 Jember | Developed for Student Excellence</div>
        <div className="flex space-x-6 uppercase tracking-widest font-bold">
          <a href="#" className="hover:text-white transition-colors">Kebijakan</a>
          <a href="#" className="hover:text-white transition-colors">Panduan Editor</a>
          <a href="#" className="hover:text-white transition-colors">Bantuan</a>
        </div>
      </div>
    </footer>
  );
}
