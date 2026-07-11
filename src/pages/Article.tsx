import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { CATEGORIES } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { formatImageUrl } from "@/lib/utils";

export default function Article() {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticleAndRecommendations = async () => {
      if (!id) return;
      setLoading(true);
      window.scrollTo(0, 0); // Scroll to top when changing articles
      try {
        const docRef = doc(db, "articles", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setArticle({ id: docSnap.id, ...docSnap.data() });
        }

        // Fetch recommendations (latest articles excluding current)
        const q = query(
          collection(db, "articles"),
          where("status", "==", "published"),
          orderBy("publishedAt", "desc"),
          limit(4)
        );
        const querySnapshot = await getDocs(q);
        const recs = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(a => a.id !== id)
          .slice(0, 3); // take up to 3
        setRecommendations(recs);

      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleAndRecommendations();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/4 mb-8" />
        <Skeleton className="h-[400px] w-full rounded-xl mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (!article) {
    return <div className="text-center py-20 text-xl font-bold">Artikel tidak ditemukan</div>;
  }

  const categoryInfo = CATEGORIES.find(c => c.slug === article.category);

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-6 mb-12">
      <div className="bg-white border border-slate-200 overflow-hidden shadow-sm relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-900"></div>
        
        {/* Breadcrumb */}
        <div className="px-4 md:px-8 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-blue-600 shrink-0">Beranda</Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          {categoryInfo && (
            <>
              <Link to={`/category/${categoryInfo.slug}`} className="hover:text-blue-600 shrink-0">{categoryInfo.shortName}</Link>
              <ChevronRight className="w-3 h-3 shrink-0" />
            </>
          )}
          <span className="text-slate-900 truncate max-w-[150px] md:max-w-md shrink-0">{article.title}</span>
        </div>

        <div className="p-6 md:p-12">
          <h1 className="text-3xl md:text-5xl font-sans font-black text-slate-900 leading-tight mb-6 tracking-tight">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-[10px] md:text-xs font-bold uppercase tracking-wide text-slate-500 mb-8 border-b-2 border-slate-900 pb-4">
            <div className="flex items-center gap-2">
              <span>Oleh <span className="text-blue-700">{article.authorName}</span></span>
            </div>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span>{article.publishedAt ? format(article.publishedAt.toDate(), "EEEE, dd MMMM yyyy HH:mm", { locale: idLocale }) : 'Draft'} WIB</span>
            {article.subCategory && (
              <>
                <span className="text-slate-300">|</span>
                <span className="text-blue-600">{article.subCategory}</span>
              </>
            )}
          </div>

          {article.imageUrl && (
            <div className="mb-10 rounded border border-slate-200 overflow-hidden shadow-sm p-1 bg-slate-50">
              <img src={formatImageUrl(article.imageUrl)} alt={article.title} className="w-full h-auto object-cover max-h-[300px] md:max-h-[500px]" />
            </div>
          )}

          <div className="prose prose-slate prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-headings:italic prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-p:leading-relaxed prose-img:rounded-md prose-img:border prose-img:border-slate-200 prose-img:shadow-sm">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                img: ({node, ...props}) => (
                  <img {...props} src={formatImageUrl(props.src)} alt={props.alt || ''} />
                )
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="mt-12 border-t-4 border-slate-900 pt-8">
          <h3 className="text-2xl font-serif italic font-bold text-slate-900 mb-6">Trending & Rekomendasi</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec) => {
              const recCat = CATEGORIES.find(c => c.slug === rec.category);
              return (
                <Link to={`/article/${rec.id}`} key={rec.id} className="group cursor-pointer bg-white p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:shadow-sm transition-all flex flex-col h-full">
                  <div className="w-full h-32 bg-slate-100 rounded border border-slate-200 overflow-hidden relative mb-3">
                    {rec.imageUrl ? (
                      <img src={formatImageUrl(rec.imageUrl)} alt={rec.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-serif italic text-2xl text-slate-300">
                        {recCat?.shortName.substring(0,3).toUpperCase() || 'PKS'}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-blue-500 font-bold uppercase tracking-widest mb-1">
                    {recCat ? recCat.shortName : 'Umum'}
                  </span>
                  <h4 className="text-sm font-bold leading-tight group-hover:text-blue-700 mb-2 line-clamp-3 flex-1">
                    {rec.title}
                  </h4>
                  <div className="text-[10px] text-slate-400 mt-auto">
                    {rec.publishedAt ? format(rec.publishedAt.toDate(), "dd MMM yyyy", { locale: idLocale }) : ''}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
