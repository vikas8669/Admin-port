import API from "@/api/api"
import { apiUrl } from "@/api/apiEndPoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export type BlogInput = {
  title: string
  description: string
  content: string
  category?: string
  tags?: string[]
  image?: File | null
  isPublished?: boolean
  featured?: boolean
}

const buildBlogFormData = (input: BlogInput) => {
  const formData = new FormData()
  formData.append("title", input.title)
  formData.append("description", input.description)
  formData.append("content", input.content)
  if (input.category) formData.append("category", input.category)
  if (input.tags) formData.append("tags", JSON.stringify(input.tags))
  if (typeof input.isPublished === "boolean") {
    formData.append("isPublished", String(input.isPublished))
  }
  if (typeof input.featured === "boolean") {
    formData.append("featured", String(input.featured))
  }
  if (input.image) formData.append("image", input.image)
  return formData
}

const blogKeys = {
  all: ["blogs"] as const,
  list: (params?: { page?: number; limit?: number; q?: string; category?: string; admin?: boolean }) =>
    ["blogs", "list", params ?? {}] as const,
  detail: (idOrSlug: string) => ["blogs", "detail", idOrSlug] as const,
}

const fetchBlogs = async (params?: {
  page?: number
  limit?: number
  q?: string
  category?: string
  admin?: boolean
}) => {
  const res = await API.get(apiUrl.blogs, { params })
  if (res.data?.success === false) {
    throw new Error(res.data?.message || "Failed to fetch blogs")
  }
  return res.data
}

const fetchBlogBySlug = async (slug: string) => {
  const res = await API.get(apiUrl.blogBySlug(slug))
  if (res.data?.success === false) {
    throw new Error(res.data?.message || "Failed to fetch blog post")
  }
  return res.data
}

const createBlog = async (input: BlogInput) => {
  const formData = buildBlogFormData(input)
  const res = await API.post(apiUrl.blogs, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  if (res.data?.success === false) {
    throw new Error(res.data?.message || "Failed to create blog post")
  }
  return res.data
}

const updateBlog = async (id: string, input: BlogInput) => {
  const formData = buildBlogFormData(input)
  const res = await API.put(apiUrl.blogById(id), formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  if (res.data?.success === false) {
    throw new Error(res.data?.message || "Failed to update blog post")
  }
  return res.data
}

const deleteBlog = async (id: string) => {
  const res = await API.delete(apiUrl.blogById(id))
  if (res.data?.success === false) {
    throw new Error(res.data?.message || "Failed to delete blog post")
  }
  return res.data
}

export const useBlogs = (params?: {
  page?: number
  limit?: number
  q?: string
  category?: string
  admin?: boolean
}) =>
  useQuery({
    queryKey: blogKeys.list(params),
    queryFn: () => fetchBlogs(params),
  })

export const useBlog = (slug?: string) =>
  useQuery({
    queryKey: slug ? blogKeys.detail(slug) : blogKeys.detail("missing"),
    queryFn: () => fetchBlogBySlug(slug as string),
    enabled: Boolean(slug),
  })

export const useCreateBlog = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all })
    },
  })
}

export const useUpdateBlog = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: BlogInput }) =>
      updateBlog(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all })
      queryClient.invalidateQueries({ queryKey: blogKeys.detail(variables.id) })
    },
  })
}

export const useDeleteBlog = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all })
    },
  })
}
