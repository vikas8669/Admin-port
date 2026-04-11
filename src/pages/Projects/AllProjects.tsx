import * as React from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useDeleteProject, useProjects } from "@/context/Projects"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useDebouncedValue } from "@/hooks/use-debounce"
import { Search, Plus, Trash2, Edit, ImageIcon, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import PopupLoader from "@/components/PopupLoader"

const AllProjects = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialPage = Number(searchParams.get("page") || 1)
  const initialLimit = Number(searchParams.get("limit") || 10)
  const initialQ = searchParams.get("q") || ""

  const [page, setPage] = React.useState(initialPage)
  const [limit, setLimit] = React.useState(initialLimit)
  const [q, setQ] = React.useState(initialQ)
  const debouncedQ = useDebouncedValue(q, 400)

  const { data, isLoading, isError, error } = useProjects({
    page,
    limit,
    q: debouncedQ.trim() || undefined,
  })
  const deleteMutation = useDeleteProject()
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const projects = data?.projects || data?.items || data?.data || []
  const total = Number(
    data?.total ?? data?.pagination?.total ?? data?.meta?.total ?? projects.length
  )
  const totalPages = Math.max(1, Math.ceil(total / limit))

  React.useEffect(() => {
    const params: Record<string, string> = {}
    if (page > 1) params.page = String(page)
    if (limit !== 10) params.limit = String(limit)
    if (debouncedQ.trim()) params.q = debouncedQ.trim()
    setSearchParams(params, { replace: true })
  }, [page, limit, debouncedQ, setSearchParams])

  const handleDelete = (id: string, title: string) => {
    toast(`Delete project?`, {
      description: `Are you sure you want to delete "${title}"? This cannot be undone.`,
      action: {
        label: "Delete",
        onClick: async () => {
          setDeletingId(id)
          try {
            await deleteMutation.mutateAsync(id)
            toast.success("Project deleted securely")
          } catch (err: any) {
            toast.error(err.message || "Failed to delete project")
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
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }
  
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-10">
      <PopupLoader isOpen={deletingId !== null} message="Deleting project securely..." />

      {/* 🚀 Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm mt-4">
        <div className="mt-">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Projects Portfolio
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage, showcase, and edit your project entries seamlessly.
          </p>
        </div>
        <Button asChild className="gap-2 shrink-0 shadow-lg hover:shadow-primary/25 transition-all">
          <Link to="/admin/projects/new">
            <Plus size={16} />
            Add Project
          </Link>
        </Button>
      </div>

      {/* 🔍 Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
        <form
          onSubmit={(event) => event.preventDefault()}
          className="relative w-full sm:max-w-md"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 bg-card border-border/50 focus-visible:ring-primary shadow-sm"
            placeholder="Search projects..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
          />
        </form>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Show:</span>
          <select
            className="h-10 rounded-md border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm transition-colors text-foreground cursor-pointer hover:bg-accent/50"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value))
              setPage(1)
            }}
          >
            {[5, 10, 20, 50].map((value) => (
              <option key={value} value={value} className="bg-background text-foreground">
                {value} per page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ⏳ Status Handling */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {isError && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-xl text-center">
          {(error as Error)?.message || "Failed to load projects."}
        </div>
      )}

      {!isLoading && projects.length === 0 && !isError && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-2xl border border-dashed">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="text-muted-foreground/50 h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold">No Projects Found</h3>
          <p className="text-sm text-muted-foreground mb-4">Try adjusting your search criteria or add a new one.</p>
        </div>
      )}

      {/* 🖼️ Projects Grid */}
      {!isLoading && projects.length > 0 && (
        <motion.div 
          variants={containerVars}
          initial="hidden"
          animate="show"
          className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {projects.map((project: any) => {
            const id = project._id || project.id
            let imageUrl = ""
            if (Array.isArray(project?.images) && project.images.length > 0) {
              const first = project.images[0]
              imageUrl = first?.url || first
            } else if (Array.isArray(project?.image) && project.image.length > 0) {
              const first = project.image[0]
              imageUrl = first?.url || first
            } else {
              imageUrl = project?.image?.url || project?.imageUrl || project?.image || ""
            }
            const customFields =
              typeof project?.customFields === "string"
                ? (() => {
                    try {
                      return JSON.parse(project.customFields)
                    } catch {
                      return null
                    }
                  })()
                : project?.customFields || null

            return (
              <motion.div variants={itemVars} key={id || project.title} className="h-full">
                <Card className="h-full flex flex-col overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-border/50 group">
                  
                  {/* Thumbnail Cover */}
                  <div className="relative h-48 w-full bg-muted overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={project.title || "Project image"}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
                        <ImageIcon className="h-10 w-10 text-primary/30 mb-2" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">No Cover Media</span>
                      </div>
                    )}
                    
                    {/* Status Badge Over Thumbnail */}
                    <div className="absolute top-3 right-3">
                       <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md ${project.isActive ? "bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30" : "bg-muted text-muted-foreground border border-border/50"}`}>
                        {project.isActive ? "Active" : "Inactive"}
                       </span>
                    </div>
                  </div>

                  <CardContent className="flex flex-col flex-1 p-5 gap-3">
                    <h3 className="text-xl font-bold leading-tight line-clamp-1">{project.title || "Untitled Project"}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                       {project.description || "No specific description has been provided for this project yet."}
                    </p>

                    {/* Custom Fields Badges */}
                    {customFields && Object.keys(customFields).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-auto pt-4">
                        {Object.entries(customFields).map(([key, value]) => (
                          <span
                            key={key}
                            className="rounded-lg bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium border border-primary/20"
                          >
                            <span className="opacity-70 mr-1">{key}:</span>{String(value)}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  {/* Actions Footer */}
                  <CardFooter className="p-5 pt-0 mt-auto flex items-center gap-2">
                    <Button variant="secondary" className="flex-1 gap-2 bg-secondary/60 hover:bg-secondary" asChild>
                      <Link to={`/admin/projects/${id}/edit`}>
                        <Edit size={14} />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      disabled={deletingId === id}
                      className="shrink-0 hover:bg-destructive/90 hover:shadow-lg hover:shadow-destructive/20 transition-all"
                      onClick={() => handleDelete(id, project.title || "Untitled Project")}
                    >
                      {deletingId === id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* 🧭 Pagination Bottom */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border mt-auto shadow-sm">
          <span className="text-sm font-medium text-muted-foreground">
            Showing {projects.length} files <span className="mx-1">•</span> Page {page} of {totalPages}
          </span>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="px-4"
            >
              Prev
            </Button>
            
            {/* Page Numbers */}
            <div className="hidden sm:flex gap-1">
              {(() => {
                const windowSize = 5
                const half = Math.floor(windowSize / 2)
                let start = Math.max(1, page - half)
                let end = Math.min(totalPages, start + windowSize - 1)
                if (end - start + 1 < windowSize) {
                  start = Math.max(1, end - windowSize + 1)
                }
                return Array.from({ length: end - start + 1 }).map((_, idx) => {
                  const pageNumber = start + idx
                  return (
                    <Button
                      key={pageNumber}
                      variant={pageNumber === page ? "default" : "ghost"}
                      size="icon"
                      className={`h-9 w-9 ${pageNumber === page ? 'shadow-md shadow-primary/20' : ''}`}
                      onClick={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  )
                })
              })()}
            </div>

            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-4"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AllProjects
