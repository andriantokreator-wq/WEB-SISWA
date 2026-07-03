import { useEffect, useState } from "react";
import { collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Image as ImageIcon, Users, Eye, DatabaseBackup } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CATEGORIES, SUB_CATEGORIES } from "@/lib/constants";

const DUMMY_ARTICLES = [
  {
    title: "Tim Hadrah Al-Banjari MAN 1 Jember Raih Juara 1 Tingkat Provinsi",
    category: "ketaqwaan",
    subCategory: "Hadrah",
    imageUrl: "https://images.unsplash.com/photo-1542838685-6bb9a444d320?auto=format&fit=crop&q=80&w=800",
    content: "Prestasi membanggakan kembali diraih oleh siswa MAN 1 Jember. Tim Hadrah Al-Banjari berhasil menyabet juara 1 dalam festival seni Islami tingkat provinsi Jawa Timur...\n\nKegiatan ini diikuti oleh ratusan peserta dari berbagai madrasah.",
    status: "published"
  },
  {
    title: "Kegiatan Dianpinsat Ambalan Tuanku Imam Bonjol - Dewi Sartika",
    category: "kepemimpinan",
    subCategory: "Pramuka",
    imageUrl: "https://images.unsplash.com/photo-1533560904424-a0c61dc306fc?auto=format&fit=crop&q=80&w=800",
    content: "Pramuka MAN 1 Jember sukses menyelenggarakan Gladian Pimpinan Satuan (Dianpinsat). Kegiatan ini bertujuan untuk mencetak kader pemimpin yang berkarakter, tangguh, dan berwawasan kebangsaan.\n\nAcara berlangsung selama tiga hari di bumi perkemahan.",
    status: "published"
  },
  {
    title: "Aksi Bersih Pantai Sispala Bhuana Giri",
    category: "lingkungan",
    subCategory: "Pecinta Alam (Sispala)",
    imageUrl: "https://images.unsplash.com/photo-1618477461853-cf6ed80fbea5?auto=format&fit=crop&q=80&w=800",
    content: "Siswa Pecinta Alam (Sispala) MAN 1 Jember mengadakan aksi nyata pelestarian lingkungan dengan membersihkan pesisir pantai selatan.\n\nSebanyak 500 kg sampah plastik berhasil dikumpulkan dan diserahkan ke bank sampah terdekat.",
    status: "published"
  },
  {
    title: "Tim Futsal Tembus Final Liga Pelajar",
    category: "olahraga-seni",
    subCategory: "Futsal",
    imageUrl: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&q=80&w=800",
    content: "Perjuangan pantang menyerah ditunjukkan oleh tim futsal MAN 1 Jember. Mereka berhasil melaju ke babak final liga pelajar setelah menaklukkan lawan tangguh di semifinal.\n\nMari kita dukung tim kebanggaan kita di pertandingan puncak besok!",
    status: "published"
  },
  {
    title: "Terbitan Terbaru Majalah Sekolah: Merajut Asa di Era Digital",
    category: "jurnalistik-akademik",
    subCategory: "Majalah Sekolah",
    imageUrl: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&q=80&w=800",
    content: "Ekskul jurnalistik MAN 1 Jember baru saja merilis edisi terbaru majalah sekolah dengan tema 'Merajut Asa di Era Digital'. Edisi ini mengupas tuntas bagaimana siswa beradaptasi dengan teknologi AI dalam pembelajaran.\n\nDapatkan segera di perpustakaan sekolah!",
    status: "published"
  }
];

export default function Dashboard() {
  const { user, role } = useAuth();
  const [stats, setStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    totalGalleries: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchStats = async () => {
    try {
      const articlesSnap = await getDocs(collection(db, "articles"));
      const galleriesSnap = await getDocs(collection(db, "galleries"));
      let usersCount = 0;
      
      if (role === 'superadmin') {
        const usersSnap = await getDocs(collection(db, "users"));
        usersCount = usersSnap.size;
      }

      let published = 0;
      articlesSnap.forEach(doc => {
        if (doc.data().status === 'published') published++;
      });

      setStats({
        totalArticles: articlesSnap.size,
        publishedArticles: published,
        totalGalleries: galleriesSnap.size,
        totalUsers: usersCount
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [role]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      for (const article of DUMMY_ARTICLES) {
        await addDoc(collection(db, "articles"), {
          ...article,
          authorId: user?.uid,
          authorName: user?.displayName || "Admin",
          createdAt: serverTimestamp(),
          publishedAt: serverTimestamp(),
        });
      }
      toast.success("Berhasil menambahkan artikel contoh");
      fetchStats();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menambahkan artikel");
    } finally {
      setSeeding(false);
    }
  };

  if (loading) return <div>Memuat statistik...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-sm border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Artikel</CardTitle>
            <FileText className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif italic font-bold text-slate-900">{stats.totalArticles}</div>
            <p className="text-xs text-slate-500 mt-1">Artikel ditulis</p>
          </CardContent>
        </Card>
        <Card className="rounded-sm border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Artikel Terbit</CardTitle>
            <Eye className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif italic font-bold text-slate-900">{stats.publishedArticles}</div>
            <p className="text-xs text-slate-500 mt-1">Tayang di beranda</p>
          </CardContent>
        </Card>
        <Card className="rounded-sm border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Galeri Foto</CardTitle>
            <ImageIcon className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-serif italic font-bold text-slate-900">{stats.totalGalleries}</div>
            <p className="text-xs text-slate-500 mt-1">Foto diunggah</p>
          </CardContent>
        </Card>
        {role === 'superadmin' && (
          <Card className="rounded-sm border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Pengguna</CardTitle>
              <Users className="w-4 h-4 text-slate-700" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-serif italic font-bold text-slate-900">{stats.totalUsers}</div>
              <p className="text-xs text-slate-500 mt-1">Admin & Editor terdaftar</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="bg-white p-8 rounded-sm shadow-sm border border-slate-200 mt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-t-4 border-t-blue-900">
        <div>
          <h2 className="text-2xl font-serif italic font-bold text-slate-900 mb-2">Selamat Datang di Dashboard</h2>
          <p className="text-slate-600 max-w-2xl text-sm leading-relaxed">
            Gunakan menu di sebelah kiri untuk mengelola konten website PK-SMS MAN 1 Jember. 
            Setiap artikel yang dipublikasikan akan langsung tampil di halaman depan secara real-time.
          </p>
        </div>
        {stats.totalArticles === 0 && (
          <Button onClick={handleSeed} disabled={seeding} className="gap-2 bg-blue-700 hover:bg-blue-800 text-white rounded-sm font-bold uppercase tracking-wider text-[10px]">
            <DatabaseBackup className="w-4 h-4" />
            {seeding ? "Menambahkan..." : "Isi dengan Artikel Contoh"}
          </Button>
        )}
      </div>
    </div>
  );
}
