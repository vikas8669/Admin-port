import API from "@/api/api"
import { apiUrl } from "@/api/apiEndPoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export type ProjectInput = {
  title: string
  description?: string
  isActive?: boolean
  customFields?: Record<string, string>
  image?: File | null
  images?: File[]
  packageDetails?: string
}

const buildProjectFormData = (input: ProjectInput) => {
  const formData = new FormData()
  formData.append("title", input.title)
  if (input.description) formData.append("description", input.description)
  if (typeof input.isActive === "boolean") {
    formData.append("isActive", String(input.isActive))
  }
  if (input.customFields && Object.keys(input.customFields).length > 0) {
    formData.append("customFields", JSON.stringify(input.customFields))
  }
  if (input.image) formData.append("image", input.image)
  if (input.images && input.images.length > 0) {
    input.images.forEach((file) => formData.append("images", file))
  }
  if (input.packageDetails) formData.append("packageDetails", input.packageDetails)
  return formData
}

const projectsKeys = {
  all: ["projects"] as const,
  list: (params?: { page?: number; limit?: number; q?: string }) =>
    ["projects", "list", params ?? {}] as const,
  detail: (id: string) => ["projects", "detail", id] as const,
}

const fetchProjects = async (params?: {
  page?: number
  limit?: number
  q?: string
}) => {
  const res = await API.get(apiUrl.projects, { params })
  if (res.data?.success === false) {
    throw new Error(res.data?.message || "Failed to fetch projects")
  }
  return res.data
}

const fetchProjectById = async (id: string) => {
  const res = await API.get(apiUrl.projectById(id))
  if (res.data?.success === false) {
    throw new Error(res.data?.message || "Failed to fetch project")
  }
  return res.data
}

const createProject = async (input: ProjectInput) => {
  const formData = buildProjectFormData(input)
  const res = await API.post(apiUrl.projects, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  if (res.data?.success === false) {
    throw new Error(res.data?.message || "Failed to create project")
  }
  return res.data
}

const updateProject = async (id: string, input: ProjectInput) => {
  const formData = buildProjectFormData(input)
  const res = await API.put(apiUrl.projectById(id), formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  if (res.data?.success === false) {
    throw new Error(res.data?.message || "Failed to update project")
  }
  return res.data
}

const deleteProject = async (id: string) => {
  const res = await API.delete(apiUrl.projectById(id))
  if (res.data?.success === false) {
    throw new Error(res.data?.message || "Failed to delete project")
  }
  return res.data
}

export const useProjects = (params?: {
  page?: number
  limit?: number
  q?: string
}) =>
  useQuery({
    queryKey: projectsKeys.list(params),
    queryFn: () => fetchProjects(params),
    placeholderData: (prev) => prev,
  })

export const useProject = (id?: string) =>
  useQuery({
    queryKey: id ? projectsKeys.detail(id) : projectsKeys.detail("missing"),
    queryFn: () => fetchProjectById(id as string),
    enabled: Boolean(id),
  })

export const useCreateProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.all })
    },
  })
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProjectInput }) =>
      updateProject(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.all })
      queryClient.invalidateQueries({ queryKey: projectsKeys.detail(variables.id) })
    },
  })
}

export const useDeleteProject = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.all })
    },
  })
}
