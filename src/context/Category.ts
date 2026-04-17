import API from "@/api/api"
import { apiUrl } from "@/api/apiEndPoints"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export type Category = {
  _id: string
  name: string
  slug: string
  type: "Blog" | "Project" | "Other"
}

export type CategoryInput = {
  name: string
  type?: "Blog" | "Project" | "Other"
}

const fetchCategories = async (type?: string) => {
  const res = await API.get(apiUrl.categories, { params: { type } })
  if (res.data?.success === false) throw new Error("Failed to fetch categories")
  return res.data
}

const createCategory = async (input: CategoryInput) => {
  const res = await API.post(apiUrl.categories, input)
  if (res.data?.success === false) throw new Error(res.data?.message || "Failed to create category")
  return res.data
}

const updateCategory = async (id: string, input: CategoryInput) => {
  const res = await API.put(`${apiUrl.categories}/${id}`, input)
  if (res.data?.success === false) throw new Error(res.data?.message || "Failed to update category")
  return res.data
}

const deleteCategory = async (id: string) => {
  const res = await API.delete(`${apiUrl.categories}/${id}`)
  if (res.data?.success === false) throw new Error(res.data?.message || "Failed to delete category")
  return res.data
}

export const useCategories = (type?: string) =>
  useQuery({
    queryKey: ["categories", type],
    queryFn: () => fetchCategories(type),
  })

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryInput }) => updateCategory(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
  })
}
