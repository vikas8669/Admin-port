import * as React from "react"
import { useCategories, useCreateCategory, useDeleteCategory } from "@/context/Category"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, Loader2, Tag, Bookmark } from "lucide-react"
import { toast } from "sonner"
import PopupLoader from "@/components/PopupLoader"

const Categories = () => {
  const { data, isLoading } = useCategories()
  const createMutation = useCreateCategory()
  const deleteMutation = useDeleteCategory()

  const [newName, setNewName] = React.useState("")
  const [newType, setNewType] = React.useState<"Blog" | "Project" | "Other">("Blog")

  const categories = data?.data || []

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    try {
      await createMutation.mutateAsync({ name: newName.trim(), type: newType })
      setNewName("")
      toast.success("Category created successfully!")
    } catch (err: any) {
      toast.error(err.message || "Failed to create category")
    }
  }

  const handleDelete = async (id: string, name: string) => {
    toast(`Delete category?`, {
        description: `Are you sure you want to delete "${name}"?`,
        action: {
          label: "Delete",
          onClick: async () => {
            try {
              await deleteMutation.mutateAsync(id)
              toast.success("Category deleted")
            } catch (err: any) {
              toast.error(err.message || "Failed to delete category")
            }
          },
        },
      })
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto pb-10">
      <PopupLoader isOpen={createMutation.isPending} message="Adding category..." />

      <div className="bg-card p-6 rounded-2xl border shadow-sm mt-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
          Categories
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage categories for your projects and blog posts.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Creation Form */}
        <div className="md:col-span-1">
          <Card className="sticky top-24 border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Add New Category</CardTitle>
              <CardDescription>Create a new classification.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="cat-name">Name</Label>
                  <Input
                    id="cat-name"
                    placeholder="e.g. Engineering"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cat-type">Apply To</Label>
                  <select
                    id="cat-type"
                    className="h-10 w-full rounded-md border border-border/50 bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                  >
                    <option value="Blog">Blog</option>
                    <option value="Project">Project</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <Button type="submit" disabled={createMutation.isPending} className="w-full gap-2">
                   <Plus size={16} />
                   Add Category
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Categories List */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm">
             <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Existing Categories</CardTitle>
                <div className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-full">
                    {categories.length} Total
                </div>
             </CardHeader>
             <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-primary" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground italic border rounded-lg border-dashed">
                        No categories found. Start by adding one.
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {categories.map((cat: any) => (
                            <div key={cat._id} className="flex items-center justify-between p-4 bg-muted/20 border border-border/50 rounded-xl hover:bg-muted/30 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${cat.type === 'Blog' ? 'bg-blue-500/10 text-blue-600' : cat.type === 'Project' ? 'bg-purple-500/10 text-purple-600' : 'bg-slate-500/10 text-slate-600'}`}>
                                        {cat.type === 'Blog' ? <Bookmark size={18} /> : <Tag size={18} />}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">{cat.name}</h4>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{cat.type}</p>
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => handleDelete(cat._id, cat.name)}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Categories
