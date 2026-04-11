import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { Upload, X, Loader2 } from "lucide-react"
import { useProject, useUpdateProject } from "@/context/Projects"
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

const EditProject = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useProject(id)
  const updateMutation = useUpdateProject()

  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isActive, setIsActive] = React.useState(true)
  const [imageFiles, setImageFiles] = React.useState<File[]>([])
  const [customFields, setCustomFields] = React.useState<CustomFieldRow[]>([])
  const [previewUrls, setPreviewUrls] = React.useState<string[]>([])

  const project = data?.project || data?.data || data

  React.useEffect(() => {
    if (!project) return
    setTitle(project.title || "")
    setDescription(project.description || "")
    setIsActive(project.isActive ?? true)
    const rawFields =
      typeof project.customFields === "string"
        ? (() => {
            try {
              return JSON.parse(project.customFields)
            } catch {
              return {}
            }
          })()
        : project.customFields || {}
    setCustomFields(
      Object.entries(rawFields).map(([key, value]) => ({
        key,
        value: String(value),
      }))
    )
  }, [project])

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

  let existingImages: string[] = []
  if (Array.isArray(project?.images)) {
    existingImages = project.images.map((img: any) => img?.url || img).filter(Boolean)
  } else if (Array.isArray(project?.image)) {
    existingImages = project.image.map((img: any) => img?.url || img).filter(Boolean)
  } else if (project?.image?.url || project?.imageUrl || project?.image) {
    existingImages = [project?.image?.url || project?.imageUrl || project?.image]
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!id) return

    const customFieldsObject: Record<string, string> = {}
    customFields.forEach((field) => {
      const trimmedKey = field.key.trim()
      if (!trimmedKey) return
      customFieldsObject[trimmedKey] = field.value
    })

    try {
      await updateMutation.mutateAsync({
        id,
        input: {
          title: title.trim(),
          description: description.trim() || undefined,
          isActive,
          customFields:
            Object.keys(customFieldsObject).length > 0
              ? customFieldsObject
              : undefined,
          images: imageFiles.length > 0 ? imageFiles : undefined,
        },
      })
      toast.success("Project updated successfully!")
      navigate("/admin/projects")
    } catch (err: any) {
      toast.error(err.message || "Failed to update project.")
    }
  }

  if (isLoading) return <p className="text-sm">Loading project...</p>
  if (isError) {
    return (
      <p className="text-sm text-red-500">
        {(error as Error)?.message || "Failed to load project."}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PopupLoader isOpen={updateMutation.isPending} message="Updating project..." />

      <div>
        <h1 className="text-2xl font-semibold">Edit Project</h1>
        <p className="text-sm text-muted-foreground">
          Update project details and custom fields.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Adjust the fields below and save your changes.
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
                    className="flex shrink-0 cursor-pointer flex-col items-center justify-center h-28 w-28 border-2 border-dashed rounded-lg hover:bg-muted transition"
                  >
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <Upload size={20} />
                      <span className="text-xs">Upload New</span>
                    </div>
                  </label>

                  {/* Previews of newly selected files side-by-side */}
                  {previewUrls.map((url, idx) => (
                    <div key={url} className="relative shrink-0">
                      <img
                        src={url}
                        alt={`new-preview-${idx}`}
                        className="h-28 w-28 rounded-lg object-cover border-2 border-primary"
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
                      <span className="absolute bottom-1 left-1 bg-primary/80 text-[10px] text-white px-1.5 py-0.5 rounded backdrop-blur">New</span>
                    </div>
                  ))}

                  {/* Display preexisting images if any, separated visually */}
                  {existingImages.length > 0 && previewUrls.length === 0 && (
                    <div className="flex items-center gap-4 border-l pl-6 border-border/50 ml-2">
                       {existingImages.map((url, idx) => (
                         <div key={idx} className="relative shrink-0 opacity-80 hover:opacity-100 transition-opacity">
                            <img
                              src={url}
                              alt={`existing-media-${idx}`}
                              className="h-28 w-28 rounded-lg object-cover border"
                            />
                            <span className="absolute bottom-1 right-1 bg-background/80 text-[10px] px-1.5 py-0.5 rounded backdrop-blur">Current</span>
                         </div>
                       ))}
                    </div>
                  )}
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
                  key={`${field.key}-${index}`}
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
              <Button type="submit" disabled={updateMutation.isPending} className="min-w-32 gap-2">
                {updateMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Update Project"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default EditProject
