import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "articles", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setArticle({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
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
    <div className="max-w-4xl mx-auto bg-white border border-slate-200 overflow-hidden mt-6 mb-12 shadow-sm relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-900"></div>
      
      {/* Breadcrumb */}
      <div className="px-8 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
        <Link to="/" className="hover:text-blue-600">Beranda</Link>
        <ChevronRight className="w-3 h-3" />
        {categoryInfo && (
          <>
            <Link to={`/category/${categoryInfo.slug}`} className="hover:text-blue-600">{categoryInfo.shortName}</Link>
            <ChevronRight className="w-3 h-3" />
          </>
        )}
        <span className="text-slate-900 truncate max-w-[200px] md:max-w-md">{article.title}</span>
      </div>

      <div className="p-8 md:p-12">
        <h1 className="text-4xl md:text-5xl font-serif italic font-bold text-slate-900 leading-tight mb-6 underline decoration-blue-500 decoration-4 underline-offset-8">
          {article.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-wide text-slate-500 mb-8 border-b-2 border-slate-900 pb-4">
          <div className="flex items-center gap-2">
            <span>Oleh <span className="text-blue-700">{article.authorName}</span></span>
          </div>
          <span className="text-slate-300">|</span>
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
            <img src={formatImageUrl(article.imageUrl)} alt={article.title} className="w-full h-auto object-cover max-h-[500px]" />
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
  );
}
