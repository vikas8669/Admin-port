import * as React from "react"
import { toast } from "sonner"
import { Upload, X, Loader2 } from "lucide-react"
import { useCreateProject } from "@/context/Projects"
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

type CustomFieldRow = { key: string; value: string }

const AddProjects = () => {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isActive, setIsActive] = React.useState(true)
  const [imageFiles, setImageFiles] = React.useState<File[]>([])
  const [customFields, setCustomFields] = React.useState<CustomFieldRow[]>([])
  const [previewUrls, setPreviewUrls] = React.useState<string[]>([])
  const createProjectMutation = useCreateProject()

  React.useEffect(() => {
    if (imageFiles.length === 0) {
      setPreviewUrls([])
      return
    }
    const urls = imageFiles.map((file) => URL.createObjectURL(file))
    setPreviewUrls(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [imageFiles])

  const addCustomField = () => {
    setCustomFields((prev) => [...prev, { key: "", value: "" }])
  }

  const updateCustomField = (index: number, key: string, value: string) => {
    setCustomFields((prev) => {
      const next = [...prev]
      next[index] = { key, value }
      return next
    })
  }

  const removeCustomField = (index: number) => {
    setCustomFields((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return

    const customFieldsObject: Record<string, string> = {}
    customFields.forEach((field) => {
      const trimmedKey = field.key.trim()
      if (!trimmedKey) return
      customFieldsObject[trimmedKey] = field.value
    })

    try {
      await createProjectMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        isActive,
        customFields:
          Object.keys(customFieldsObject).length > 0
            ? customFieldsObject
            : undefined,
        images: imageFiles.length > 0 ? imageFiles : undefined,
      })
      toast.success("Project created successfully!")
      setTitle("")
      setDescription("")
      setIsActive(true)
      setImageFiles([])
      setCustomFields([])
    } catch (err: any) {
      toast.error(err.message || "Failed to create project.")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PopupLoader isOpen={createProjectMutation.isPending} message="Creating project..." />

      <div>
        <h1 className="text-2xl font-semibold">Add Project</h1>
        <p className="text-sm text-muted-foreground">
          Create a new project with media, status, and custom fields.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Provide core details, media, and optional metadata.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="project-title">Title *</Label>
              <Input
                id="project-title"
                placeholder="Project title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                placeholder="Short description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="project-active"
                checked={isActive}
                onCheckedChange={(value) => setIsActive(Boolean(value))}
              />
              <Label htmlFor="project-active">Active</Label>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="project-images">Project Images</Label>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-6 overflow-x-auto pb-4">
                  
                  {/* Upload Box */}
                  <label
                    htmlFor="project-images"
                    className="flex shrink-0 cursor-pointer flex-col items-center justify-center h-32 w-32 border-2 border-dashed rounded-lg hover:bg-muted transition"
                  >
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <Upload size={20} />
                      <span className="text-xs">Upload Images</span>
                    </div>
                  </label>

                  {/* Previews on Right side-by-side */}
                  {previewUrls.map((url, idx) => (
                    <div key={url} className="relative shrink-0">
                      <img
                        src={url}
                        alt={`preview-${idx}`}
                        className="h-32 w-32 rounded-lg object-cover border"
                      />

                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => {
                          setImageFiles((prev) => prev.filter((_, i) => i !== idx))
                        }}
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  ))}
                </div>

                <Input
                  id="project-images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    if (files.length > 0) {
                      setImageFiles((prev) => {
                        const combined = [...prev, ...files]
                        if (combined.length > 5) {
                          toast.error("You can only upload up to 5 images at a time.")
                          return combined.slice(0, 5)
                        }
                        return combined
                      })
                    }
                  }}
                />
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label>Custom Fields</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomField}
                >
                  Add Field
                </Button>
              </div>

              {customFields.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Add key/value pairs to store extra metadata.
                </p>
              )}

              {customFields.map((field, index) => (
                <div
                  key={`custom-field-${index}`}
                  className="grid gap-2 md:grid-cols-3"
                >
                  <Input
                    placeholder="Key"
                    value={field.key}
                    onChange={(e) =>
                      updateCustomField(index, e.target.value, field.value)
                    }
                  />
                  <Input
                    placeholder="Value"
                    value={field.value}
                    onChange={(e) =>
                      updateCustomField(index, field.key, e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeCustomField(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 mt-4">
              <Button type="submit" disabled={createProjectMutation.isPending} className="min-w-32 gap-2">
                {createProjectMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default AddProjects
