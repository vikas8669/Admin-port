import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { Upload, X, Loader2, Save } from "lucide-react"
import { useBlog, useUpdateBlog } from "@/context/Blog"
import { useCategories } from "@/context/Category"
import PopupLoader from "@/components/PopupLoader"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const EditPost = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  // Note: Backend currently returns blog by SLUG or ID in getBlogBySlug depending on implementation.
  // In our controller, getBlogBySlug uses req.params.slug. 
  // We'll need a way to fetch by ID or Slug. I'll use Slug for now if provided, or add a fetchById.
  // Actually, I'll update the controller to handle ID as well or use slug. 
  // For now, I'll assume useBlog(id) works if I change the hook/endpoint.
  
  const { data, isLoading: loadingBlog } = useBlog(id)
  const updateMutation = useUpdateBlog()
  const { data: catData } = useCategories("Blog")
  const categoriesList = catData?.data || []

  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [content, setContent] = React.useState("")
  const [category, setCategory] = React.useState("General")
  const [isPublished, setIsPublished] = React.useState(true)
  const [featured, setFeatured] = React.useState(false)
  const [tags, setTags] = React.useState("")
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)

  const blog = data?.data

  React.useEffect(() => {
    if (blog) {
      setTitle(blog.title || "")
      setDescription(blog.description || "")
      setContent(blog.content || "")
      setCategory(blog.category || "General")
      setIsPublished(blog.isPublished ?? true)
      setFeatured(blog.featured ?? false)
      setTags(Array.isArray(blog.tags) ? blog.tags.join(", ") : "")
      if (blog.image?.url) {
        setPreviewUrl(blog.image.url)
      }
    }
  }, [blog])

  React.useEffect(() => {
    if (!imageFile) return
    const url = URL.createObjectURL(imageFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!id) return
    if (!title.trim() || !content.trim() || !description.trim()) {
      toast.error("Title, description, and content are required.")
      return
    }

    try {
      await updateMutation.mutateAsync({
        id,
        input: {
          title: title.trim(),
          description: description.trim(),
          content,
          category,
          isPublished,
          featured,
          tags: tags.split(",").map(t => t.trim()).filter(Boolean),
          image: imageFile,
        },
      })
      toast.success("Blog post updated successfully!")
      navigate("/admin/posts")
    } catch (err: any) {
      toast.error(err.message || "Failed to update blog post.")
    }
  }



  if (loadingBlog) return <div className="p-10 text-center">Loading post data...</div>

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-10">
      <PopupLoader isOpen={updateMutation.isPending} message="Updating your article..." />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update your content and settings.
          </p>
        </div>
        <div className="flex items-center gap-3">
             <Button variant="outline" onClick={() => navigate("/admin/posts")}>Cancel</Button>
             <Button onClick={handleSubmit} disabled={updateMutation.isPending} className="gap-2 shadow-lg hover:shadow-primary/20 transition-all">
                {updateMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={16} />}
                Update Post
             </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="blog-title">Title *</Label>
                <Input
                  id="blog-title"
                  placeholder="Enter a catchy title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-semibold h-12"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="blog-description">Short Excerpt *</Label>
                <Textarea
                  id="blog-description"
                  placeholder="A brief summary for the listing page..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[80px]"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="blog-content">Main Content *</Label>
                <Textarea 
                  id="blog-content"
                  placeholder="Write your article content here (HTML supported)..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[400px] font-mono p-4 bg-muted/5 focus-visible:ring-primary/30 leading-relaxed text-base"
                />
                <p className="text-[10px] text-muted-foreground italic">Tip: You can use HTML tags for basic formatting.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar / Settings Area */}
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Post Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3">
                <Label htmlFor="blog-category">Category</Label>
                <select
                  id="blog-category"
                  className="h-10 w-full rounded-md border border-border/50 bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                    {categoriesList.map((cat: any) => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                    {categoriesList.length === 0 && (
                        <option value="General">General</option>
                    )}
                </select>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="blog-tags">Tags (comma separated)</Label>
                <Input
                  id="blog-tags"
                  placeholder="react, scaling, performance"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="blog-published"
                    checked={isPublished}
                    onCheckedChange={(v) => setIsPublished(!!v)}
                  />
                  <Label htmlFor="blog-published">Is Published</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="blog-featured"
                    checked={featured}
                    onCheckedChange={(v) => setFeatured(!!v)}
                  />
                  <Label htmlFor="blog-featured">Featured Post</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
              <CardDescription>Upload to replace current image.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {previewUrl ? (
                  <div className="relative group">
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="w-full aspect-video object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                          setImageFile(null)
                          setPreviewUrl(null)
                      }}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                         <span className="text-white text-xs font-bold">Change Image</span>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="blog-image"
                    className="flex flex-col items-center justify-center aspect-video w-full border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition border-border/50"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload size={24} />
                      <span className="text-xs font-medium">Click to upload image</span>
                    </div>
                    <input
                      id="blog-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setImageFile(file)
                      }}
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default EditPost
