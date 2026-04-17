import * as React from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useBlogs, useDeleteBlog } from "@/context/Blog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useDebouncedValue } from "@/hooks/use-debounce"
import { Search, Plus, Trash2, Edit, ImageIcon, Loader2, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import PopupLoader from "@/components/PopupLoader"

const AllPosts = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialPage = Number(searchParams.get("page") || 1)
  const initialLimit = Number(searchParams.get("limit") || 10)
  const initialQ = searchParams.get("q") || ""
  const initialCategory = searchParams.get("category") || "All"

  const [page, setPage] = React.useState(initialPage)
  const [limit] = React.useState(initialLimit)
  const [q, setQ] = React.useState(initialQ)
  const [category, setCategory] = React.useState(initialCategory)
  const debouncedQ = useDebouncedValue(q, 400)

  const { data, isLoading, isError, error } = useBlogs({
    page,
    limit,
    q: debouncedQ.trim() || undefined,
    category: category !== "All" ? category : undefined,
    admin: true
  });

  const deleteMutation = useDeleteBlog()
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const blogs = data?.data || []
  const total = data?.total || 0
  const totalPages = Math.max(1, Math.ceil(total / limit))

  React.useEffect(() => {
    const params: Record<string, string> = {}
    if (page > 1) params.page = String(page)
    if (limit !== 10) params.limit = String(limit)
    if (debouncedQ.trim()) params.q = debouncedQ.trim()
    if (category !== "All") params.category = category
    setSearchParams(params, { replace: true })
  }, [page, limit, debouncedQ, category, setSearchParams])

  const handleDelete = (id: string, title: string) => {
    toast(`Delete blog post?`, {
      description: `Are you sure you want to delete "${title}"? This cannot be undone.`,
      action: {
        label: "Delete",
        onClick: async () => {
          setDeletingId(id)
          try {
            await deleteMutation.mutateAsync(id)
            toast.success("Blog post deleted securely")
          } catch (err: any) {
            toast.error(err.message || "Failed to delete blog post")
          } finally {
            setDeletingId(null)
          }
        },
      },
    })
  }

  // Animation variants
  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }
  
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-10">
      <PopupLoader isOpen={deletingId !== null} message="Deleting blog post securely..." />

      {/* 🚀 Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm mt-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
            Blog Posts
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Write, organize, and manage your articles effortlessly.
          </p>
        </div>
        <Button asChild className="gap-2 shrink-0 shadow-lg hover:shadow-primary/25 transition-all">
          <Link to="/admin/posts/new">
            <Plus size={16} />
            Write Post
          </Link>
        </Button>
      </div>

      {/* 🔍 Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
        <form onSubmit={(e) => e.preventDefault()} className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 bg-card border-border/50 focus-visible:ring-primary shadow-sm"
            placeholder="Search blogs..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
          />
        </form>

        <div className="flex items-center gap-3">
            <select
              className="h-10 rounded-md border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
              value={category}
              onChange={(e) => {
                  setCategory(e.target.value)
                  setPage(1)
              }}
            >
                {["All", "Product", "Engineering", "Design"].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
        </div>
      </div>

      {/* ⏳ Status Handling */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full font-bold"></div>
        </div>
      )}
      
      {isError && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-center">
          {(error as Error)?.message || "Failed to load blogs."}
        </div>
      )}

      {!isLoading && blogs.length === 0 && !isError && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-dashed">
          <FileText className="text-muted-foreground/30 h-16 w-16 mb-4" />
          <h3 className="text-lg font-semibold">No Posts Found</h3>
          <p className="text-sm text-muted-foreground mb-4">Start by creating your first article.</p>
        </div>
      )}

      {/* 📰 Blogs Grid */}
      {!isLoading && blogs.length > 0 && (
        <motion.div 
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
        >
          {blogs.map((post: any) => (
            <motion.div variants={itemVars} key={post._id} className="h-full">
              <Card className="h-full flex flex-col overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-border/50 group bg-card">
                
                <div className="relative h-48 w-full bg-muted overflow-hidden">
                  {post.image?.url ? (
                    <img
                      src={post.image.url}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
                      <ImageIcon className="h-10 w-10 text-primary/30 mb-2" />
                    </div>
                  )}
                  
                  <div className="absolute top-3 right-3 flex gap-2">
                     <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-md border ${post.isPublished ? "bg-green-500/20 text-green-700 border-green-500/30" : "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"}`}>
                      {post.isPublished ? "Published" : "Draft"}
                     </span>
                     {post.featured && (
                         <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-700 border border-purple-500/30 shadow-sm backdrop-blur-md">
                             Featured
                         </span>
                     )}
                  </div>
                </div>

                <CardContent className="flex flex-col flex-1 p-5 gap-3">
                  <div className="text-[10px] font-bold text-primary uppercase tracking-widest">{post.category}</div>
                  <h3 className="text-xl font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                     {post.description}
                  </p>
                </CardContent>

                <CardFooter className="p-5 pt-0 mt-auto flex items-center gap-2">
                  <Button variant="secondary" size="sm" className="flex-1 gap-2" asChild>
                    <Link to={`/admin/posts/${post._id}/edit`}>
                      <Edit size={14} />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="shrink-0"
                    disabled={deletingId === post._id}
                    onClick={() => handleDelete(post._id, post.title)}
                  >
                    {deletingId === post._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* 🧭 Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/50 pt-6">
            <span className="text-sm text-muted-foreground">Showing page {page} of {totalPages}</span>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
        </div>
      )}
    </div>
  )
}

export default AllPosts
