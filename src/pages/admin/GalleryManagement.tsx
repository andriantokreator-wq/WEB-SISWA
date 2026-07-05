import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2, Image as ImageIcon, Plus } from "lucide-react";
import { formatImageUrl } from "@/lib/utils";

export default function GalleryManagement() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");

  const fetchImages = async () => {
    try {
      const q = query(collection(db, "galleries"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setImages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching gallery:", error);
      toast.error("Gagal memuat galeri");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      toast.error("URL Gambar wajib diisi!");
      return;
    }

    setAdding(true);
    try {
      const formattedUrl = formatImageUrl(imageUrl);
      const newImage = {
        imageUrl: formattedUrl,
        caption,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, "galleries"), newImage);
      
      setImages([{ id: docRef.id, ...newImage, createdAt: { toDate: () => new Date() } }, ...images]);
      setImageUrl("");
      setCaption("");
      toast.success("Gambar berhasil ditambahkan ke galeri");
    } catch (error) {
      console.error("Error adding image:", error);
      toast.error("Gagal menambahkan gambar");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus gambar ini dari galeri?")) return;
    try {
      await deleteDoc(doc(db, "galleries", id));
      toast.success("Gambar dihapus");
      setImages(images.filter(img => img.id !== id));
    } catch (error) {
      toast.error("Gagal menghapus gambar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-sm shadow-sm border border-slate-200 overflow-hidden border-t-4 border-t-blue-900">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-2xl font-serif italic font-bold text-slate-900">Tambahkan Foto</h2>
          <p className="text-sm text-slate-500 mt-1">Tambahkan gambar ke galeri publik menggunakan link gambar atau link Google Drive.</p>
        </div>
        
        <form onSubmit={handleAddImage} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="font-bold text-slate-700 uppercase tracking-wider text-xs">URL Gambar (Google Drive)</Label>
              <Input 
                id="imageUrl" 
                placeholder="https://drive.google.com/..." 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="border-slate-300 focus-visible:ring-blue-600 rounded-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="caption" className="font-bold text-slate-700 uppercase tracking-wider text-xs">Keterangan (Opsional)</Label>
              <Input 
                id="caption" 
                placeholder="Keterangan gambar..." 
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="border-slate-300 focus-visible:ring-blue-600 rounded-sm"
              />
            </div>
          </div>
          
          <Button type="submit" disabled={adding} className="rounded-sm bg-blue-600 hover:bg-blue-700 w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            {adding ? "Menambahkan..." : "Tambahkan ke Galeri"}
          </Button>

          {imageUrl && (
            <div className="mt-4 p-2 bg-slate-50 border border-slate-200 rounded-sm inline-block">
              <p className="text-xs text-slate-500 mb-2 font-bold uppercase">Pratinjau:</p>
              <img src={formatImageUrl(imageUrl)} alt="Preview" className="h-48 w-auto object-contain border border-slate-200 rounded-sm bg-white" />
            </div>
          )}
        </form>
      </div>

      <div className="bg-white rounded-sm shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-serif italic font-bold text-slate-900">Galeri Foto</h2>
            <p className="text-sm text-slate-500 mt-1">Daftar foto yang ditampilkan di website.</p>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-slate-500 font-serif italic">Memuat galeri...</div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-sm">
              <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Belum ada foto di galeri</p>
              <p className="text-sm text-slate-400 mt-1">Tambahkan foto menggunakan form di atas</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img) => (
                <div key={img.id} className="group relative rounded-sm border border-slate-200 bg-slate-50 overflow-hidden">
                  <div className="aspect-square bg-white">
                    <img src={img.imageUrl} alt={img.caption || "Gallery image"} className="w-full h-full object-cover" />
                  </div>
                  {img.caption && (
                    <div className="p-2 border-t border-slate-200 bg-white">
                      <p className="text-xs text-slate-600 truncate">{img.caption}</p>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="destructive" 
                      size="icon"
                      className="h-8 w-8 rounded-sm shadow-sm"
                      onClick={() => handleDelete(img.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
