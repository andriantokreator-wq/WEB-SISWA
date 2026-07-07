import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, orderBy, query, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Edit, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ArticleList() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setArticles(data);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Gagal memuat artikel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "articles", id));
      toast.success("Artikel berhasil dihapus");
      setArticles(articles.filter(a => a.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Gagal menghapus artikel");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Daftar Artikel</h2>
        <Link to="/admin/articles/new">
          <Button className="gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold uppercase tracking-wider text-xs">
            <Plus className="w-4 h-4" /> Tambah Artikel Baru
          </Button>
        </Link>
      </div>
      
      <div className="p-0 overflow-x-auto w-full">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-slate-50 border-b-2 border-slate-900">
            <TableRow>
              <TableHead className="font-bold text-slate-800 uppercase tracking-widest text-[10px]">Judul</TableHead>
              <TableHead className="font-bold text-slate-800 uppercase tracking-widest text-[10px]">Kategori</TableHead>
              <TableHead className="font-bold text-slate-800 uppercase tracking-widest text-[10px]">Status</TableHead>
              <TableHead className="font-bold text-slate-800 uppercase tracking-widest text-[10px]">Penulis</TableHead>
              <TableHead className="font-bold text-slate-800 uppercase tracking-widest text-[10px]">Tanggal</TableHead>
              <TableHead className="text-right font-bold text-slate-800 uppercase tracking-widest text-[10px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500 font-serif italic">Memuat data...</TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500 font-serif italic">Belum ada artikel.</TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium max-w-[250px] truncate" title={article.title}>
                    <span className="font-bold text-slate-900">{article.title}</span>
                  </TableCell>
                  <TableCell>
                    <div className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{article.category}</div>
                    {article.subCategory && <div className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest mt-1">{article.subCategory}</div>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={article.status === 'published' ? 'default' : 'secondary'} 
                           className={article.status === 'published' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}>
                      {article.status === 'published' ? 'Terbit' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{article.authorName}</TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {article.createdAt ? format(article.createdAt.toDate(), "dd MMM yyyy", { locale: idLocale }) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/articles/edit/${article.id}`}>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      {deleteConfirm === article.id ? (
                        <div className="flex items-center gap-1">
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(article.id)} className="h-8 text-[10px] font-bold">
                            Hapus
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => setDeleteConfirm(null)} className="h-8 w-8">
                            X
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="icon" onClick={() => setDeleteConfirm(article.id)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
