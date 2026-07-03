import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { CATEGORIES } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { formatImageUrl } from "@/lib/utils";

interface Article {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  publishedAt: any;
  authorName: string;
}

export default function Home() {
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const q = query(
          collection(db, "articles"),
          orderBy("publishedAt", "desc"),
          limit(6)
        );
        const querySnapshot = await getDocs(q);
        const articles = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Article[];
        
        // Filter out drafts if any
        const published = articles.filter((a: any) => a.status === 'published');
        setLatestArticles(published);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <section className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-sm group">
        <div className="absolute inset-0 bg-slate-200">
          <img 
            src="/src/assets/images/pk_sms_banner_1782806241124.jpg" 
            alt="Kegiatan Siswa" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end">
          <div className="p-8 md:p-12">
            <span className="inline-block px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded mb-3 uppercase tracking-wide">
              EKSKLUSIF
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight max-w-4xl mb-4">
              Eksplorasi Kreativitas & Prestasi Siswa MAN 1 Jember
            </h2>
            <p className="text-slate-200 text-lg max-w-2xl leading-relaxed opacity-90">
              Temukan berbagai informasi terkini mengenai kegiatan ekstrakurikuler, pencapaian akademik, dan aksi nyata siswa di lingkungan sekolah dan masyarakat.
            </p>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-3xl font-serif italic font-bold text-slate-800 underline decoration-blue-500 decoration-4 underline-offset-8">Laporan Utama</h2>
          <span className="text-xs text-blue-600 font-bold uppercase tracking-tighter hidden sm:inline-block">Terhangat Hari Ini &rarr;</span>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex space-x-3">
                <Skeleton className="w-24 h-24 shrink-0 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : latestArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {latestArticles.map((article) => {
              const categoryInfo = CATEGORIES.find(c => c.slug === article.category);
              return (
                <Link to={`/article/${article.id}`} key={article.id} className="flex space-x-4 group cursor-pointer bg-white p-3 rounded-lg border border-transparent hover:border-slate-100 hover:shadow-sm transition-all">
                  <div className="w-24 h-24 bg-slate-100 shrink-0 rounded border border-slate-200 overflow-hidden relative flex items-center justify-center font-serif italic text-2xl text-slate-300">
                    {article.imageUrl ? (
                      <img src={formatImageUrl(article.imageUrl)} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      categoryInfo?.shortName.substring(0,3).toUpperCase() || 'PKS'
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="text-[9px] text-blue-500 font-bold uppercase tracking-widest mb-1">
                      {categoryInfo ? categoryInfo.shortName : 'Umum'}
                    </span>
                    <h4 className="text-sm font-bold leading-tight group-hover:text-blue-700 mb-1 line-clamp-2">
                      {article.title}
                    </h4>
                    <div className="mt-auto flex items-center justify-between text-[10px] text-slate-400">
                      <span>{article.authorName}</span>
                      <span>{article.publishedAt ? format(article.publishedAt.toDate(), "dd MMM yyyy", { locale: id }) : ''}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded border border-dashed border-slate-200">
            <p className="text-slate-500 font-medium">Belum ada artikel yang dipublikasikan.</p>
          </div>
        )}
      </section>
    </div>
  );
}
