import * as React from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Upload, X, Loader2, Send } from "lucide-react"
import { useCreateBlog } from "@/context/Blog"
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

const AddPost = () => {
  const navigate = useNavigate()
  const createMutation = useCreateBlog()
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

  React.useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(imageFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!title.trim() || !content.trim() || !description.trim()) {
      toast.error("Title, description, and content are required.")
      return
    }

    try {
      await createMutation.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        content,
        category,
        isPublished,
        featured,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        image: imageFile,
      })
      toast.success("Blog post created successfully!")
      navigate("/admin/posts")
    } catch (err: any) {
      toast.error(err.message || "Failed to create blog post.")
    }
  }



  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-10">
      <PopupLoader isOpen={createMutation.isPending} message="Creating your article..." />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Write New Post</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Share your insights and updates with the world.
          </p>
        </div>
        <div className="flex items-center gap-3">
             <Button variant="outline" onClick={() => navigate("/admin/posts")}>Cancel</Button>
             <Button onClick={handleSubmit} disabled={createMutation.isPending} className="gap-2 shadow-lg hover:shadow-primary/20 transition-all">
                {createMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Send size={16} />}
                Publish Post
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
                  <Label htmlFor="blog-published">Publish Immediately</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="blog-featured"
                    checked={featured}
                    onCheckedChange={(v) => setFeatured(!!v)}
                  />
                  <Label htmlFor="blog-featured">Feature this post</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle>Cover Image</CardTitle>
              <CardDescription>Upload a high-quality image.</CardDescription>
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
                      onClick={() => setImageFile(null)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
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

export default AddPost
