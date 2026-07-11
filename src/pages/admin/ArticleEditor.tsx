import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, addDoc, updateDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { CATEGORIES, SUB_CATEGORIES } from "@/lib/constants";
import { formatImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, Send } from "lucide-react";

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, dbUser, role } = useAuth();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    subCategory: "",
    content: "",
    imageUrl: "",
    status: "draft",
    isHeadline: false
  });

  useEffect(() => {
    if (isEdit) {
      const fetchArticle = async () => {
        try {
          const docRef = doc(db, "articles", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData({
              title: data.title || "",
              category: data.category || "",
              subCategory: data.subCategory || "",
              content: data.content || "",
              imageUrl: data.imageUrl || "",
              status: data.status || "draft",
              isHeadline: data.isHeadline || false
            });
          } else {
            toast.error("Artikel tidak ditemukan");
            navigate("/admin/articles");
          }
        } catch (error) {
          console.error("Error fetching article:", error);
          toast.error("Gagal memuat artikel");
        } finally {
          setLoading(false);
        }
      };
      fetchArticle();
    }
  }, [id, isEdit, navigate]);

  const handleSave = async (status: "draft" | "published") => {
    if (!formData.title || !formData.category || !formData.content) {
      toast.error("Judul, kategori, dan isi artikel wajib diisi!");
      return;
    }

    setSaving(true);
    try {
      const articleData = {
        ...formData,
        imageUrl: formatImageUrl(formData.imageUrl),
        status,
        updatedAt: serverTimestamp(),
      };

      if (status === "published" && formData.status !== "published") {
        (articleData as any).publishedAt = serverTimestamp();
      }

      if (isEdit) {
        await updateDoc(doc(db, "articles", id), articleData);
        toast.success(`Artikel berhasil ${status === 'published' ? 'diterbitkan' : 'disimpan sebagai draft'}`);
      } else {
        (articleData as any).createdAt = serverTimestamp();
        (articleData as any).authorId = user?.uid;
        (articleData as any).authorName = dbUser?.name || user?.displayName;
        if (status === 'published') {
           (articleData as any).publishedAt = serverTimestamp();
        }
        await addDoc(collection(db, "articles"), articleData);
        toast.success(`Artikel baru berhasil ${status === 'published' ? 'diterbitkan' : 'disimpan sebagai draft'}`);
      }
      navigate("/admin/articles");
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("Gagal menyimpan artikel");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Memuat editor...</div>;

  const availableSubCategories = formData.category ? SUB_CATEGORIES[formData.category] || [] : [];

  return (
    <div className="max-w-4xl bg-white rounded-sm shadow-sm border-t-4 border-t-blue-900 border border-slate-200 p-8">
      <h2 className="text-3xl font-serif italic font-bold text-slate-900 mb-8 border-b-2 border-slate-900 pb-4">{isEdit ? "Edit Artikel" : "Tulis Artikel Baru"}</h2>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="font-bold text-slate-700 uppercase tracking-wider text-xs">Judul Artikel</Label>
          <Input 
            id="title" 
            placeholder="Masukkan judul artikel..." 
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="text-lg font-medium border-slate-300 focus-visible:ring-blue-600 rounded-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="font-bold text-slate-700 uppercase tracking-wider text-xs">Kategori Bidang</Label>
            <Select 
              value={formData.category} 
              onValueChange={(val) => setFormData({ ...formData, category: val, subCategory: "" })}
            >
              <SelectTrigger className="border-slate-300 focus:ring-blue-600 rounded-sm">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-bold text-slate-700 uppercase tracking-wider text-xs">Sub Kategori (Ekstrakurikuler)</Label>
            <Select 
              value={formData.subCategory} 
              onValueChange={(val) => setFormData({ ...formData, subCategory: val })}
              disabled={!formData.category || availableSubCategories.length === 0}
            >
              <SelectTrigger className="border-slate-300 focus:ring-blue-600 rounded-sm">
                <SelectValue placeholder={!formData.category ? "Pilih kategori dulu" : "Pilih ekstrakurikuler"} />
              </SelectTrigger>
              <SelectContent>
                {availableSubCategories.map(sub => (
                  <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl" className="font-bold text-slate-700 uppercase tracking-wider text-xs">URL Gambar Utama</Label>
          <Input 
            id="imageUrl" 
            placeholder="https://example.com/image.jpg atau link Google Drive" 
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="border-slate-300 focus-visible:ring-blue-600 rounded-sm"
          />
          {formData.imageUrl && (
            <div className="mt-2 h-40 rounded-sm overflow-hidden border border-slate-200 bg-slate-50 p-1 relative">
              <img src={formatImageUrl(formData.imageUrl)} alt="Preview" className="h-full w-full object-contain" />
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-2 right-2 h-6 w-6 rounded-sm opacity-80 hover:opacity-100"
                onClick={() => setFormData({...formData, imageUrl: ""})}
              >
                <span className="sr-only">Hapus gambar</span>
                &times;
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 bg-slate-50 p-4 border border-slate-200 rounded-sm">
          <input
            type="checkbox"
            id="isHeadline"
            checked={formData.isHeadline}
            onChange={(e) => setFormData({ ...formData, isHeadline: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <Label htmlFor="isHeadline" className="font-bold text-slate-900 cursor-pointer">
            Jadikan Headline (Tampilkan Besar di Beranda)
          </Label>
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex justify-between items-baseline">
            <Label htmlFor="content" className="font-bold text-slate-700 uppercase tracking-wider text-xs">Isi Artikel</Label>
            <span className="text-[10px] text-slate-500 font-medium">Mendukung format Markdown. Tambahkan gambar dengan: ![alt](url)</span>
          </div>
          <Textarea 
            id="content" 
            placeholder="Tulis isi artikel di sini..." 
            className="min-h-[400px] resize-y border-slate-300 focus-visible:ring-blue-600 rounded-sm font-mono text-sm"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200">
          <Button 
            variant="outline" 
            onClick={() => handleSave("draft")} 
            disabled={saving}
            className="gap-2 font-bold uppercase tracking-wider text-xs rounded-sm"
          >
            <Save className="w-4 h-4" /> Simpan Draft
          </Button>
          {role === 'superadmin' && (
            <Button 
              onClick={() => handleSave("published")} 
              disabled={saving}
              className="gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold uppercase tracking-wider text-xs rounded-sm"
            >
              <Send className="w-4 h-4" /> {isEdit && formData.status === 'published' ? 'Perbarui Artikel' : 'Publikasikan Sekarang'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
