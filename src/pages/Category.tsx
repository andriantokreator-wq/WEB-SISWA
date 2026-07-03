import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { CATEGORIES } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { formatImageUrl } from "@/lib/utils";

export default function Category() {
  const { slug } = useParams();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryInfo = CATEGORIES.find(c => c.slug === slug);

  useEffect(() => {
    const fetchArticles = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "articles"),
          where("category", "==", slug),
          where("status", "==", "published"),
          orderBy("publishedAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedArticles = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setArticles(fetchedArticles);
      } catch (error) {
        console.error("Error fetching category articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [slug]);

  if (!categoryInfo) {
    return <div className="text-center py-20 text-xl font-bold">Kategori tidak ditemukan</div>;
  }

  return (
    <div className="space-y-8">
      <div className="border-b-4 border-blue-900 pb-6 mb-8 text-center pt-8">
        <h1 className="text-4xl md:text-5xl font-serif italic font-bold text-blue-900 mb-3">{categoryInfo.name}</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Arsip Berita & Informasi Terkini</p>
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
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link to={`/article/${article.id}`} key={article.id} className="flex space-x-4 group cursor-pointer bg-white p-3 rounded-lg border border-transparent hover:border-slate-100 hover:shadow-sm transition-all">
              <div className="w-24 h-24 bg-slate-100 shrink-0 rounded border border-slate-200 overflow-hidden relative flex items-center justify-center font-serif italic text-2xl text-slate-300">
                {article.imageUrl ? (
                  <img src={formatImageUrl(article.imageUrl)} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  categoryInfo.shortName.substring(0,3).toUpperCase()
                )}
              </div>
              <div className="flex-1 flex flex-col">
                <span className="text-[9px] text-blue-500 font-bold uppercase tracking-widest mb-1">
                  {article.subCategory || categoryInfo.shortName}
                </span>
                <h4 className="text-sm font-bold leading-tight group-hover:text-blue-700 mb-1 line-clamp-2">
                  {article.title}
                </h4>
                <div className="mt-auto flex items-center justify-between text-[10px] text-slate-400">
                  <span>{article.authorName}</span>
                  <span>{article.publishedAt ? format(article.publishedAt.toDate(), "dd MMM yyyy", { locale: idLocale }) : ''}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded border border-dashed border-slate-200">
          <p className="text-slate-500 text-sm font-medium">Belum ada artikel di kategori ini.</p>
        </div>
      )}
    </div>
  );
}
