import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { tasksApi, type TaskPatch } from '@/api/tasks'
import type { Task } from '@/types'
import type { TaskInput } from '@/schemas/task'

/**
 * Query keys in one place ("query key factory"). Hierarchical arrays:
 * invalidating ['tasks'] also hits ['tasks','list'] and ['tasks','detail',1].
 */
export const taskKeys = {
  all: ['tasks'] as const,
  list: () => [...taskKeys.all, 'list'] as const,
  detail: (id: number) => [...taskKeys.all, 'detail', id] as const,
}

// ── Queries (read) ───────────────────────────────────────────────

export function useTasksQuery() {
  return useQuery({
    queryKey: taskKeys.list(),
    // TanStack Query passes an AbortSignal: leaving the page cancels the request
    queryFn: ({ signal }) => tasksApi.list(signal),
  })
}

/** Vue difference: the key can be a computed. When id changes, the query re-runs by itself. */
export function useTaskQuery(id: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: computed(() => taskKeys.detail(toValue(id))),
    queryFn: ({ signal }) => tasksApi.get(toValue(id), signal),
  })
}

// ── Mutations (write) ────────────────────────────────────────────

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: TaskInput) => tasksApi.create(input),
    // Simplest strategy: "something changed, refetch the lists" ≈ revalidatePath('/') in Next.js
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.list() }),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: TaskPatch }) => tasksApi.update(id, patch),
    onSuccess: (task) => {
      qc.setQueryData(taskKeys.detail(task.id), task) // we already have the new data: no refetch
      return qc.invalidateQueries({ queryKey: taskKeys.list() })
    },
  })
}

/**
 * Optimistic update: change the cache FIRST, call the server, roll back on error.
 * The checkbox flips instantly even with a slow API.
 * ≈ React 19 useOptimistic, or the same onMutate pattern in react-query.
 */
export function useToggleTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (task: Task) => tasksApi.update(task.id, { done: !task.done }),
    onMutate: async (task) => {
      await qc.cancelQueries({ queryKey: taskKeys.list() }) // don't let an old refetch overwrite us
      const previous = qc.getQueryData<Task[]>(taskKeys.list())
      qc.setQueryData<Task[]>(taskKeys.list(), (old) =>
        old?.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)),
      )
      return { previous } // → `context` in onError
    },
    onError: (_err, _task, context) => {
      if (context?.previous) qc.setQueryData(taskKeys.list(), context.previous)
    },
    // Success or error: re-sync with the server's truth
    onSettled: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  })
}

export function useRemoveTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => tasksApi.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: taskKeys.list() })
      const previous = qc.getQueryData<Task[]>(taskKeys.list())
      qc.setQueryData<Task[]>(taskKeys.list(), (old) => old?.filter((t) => t.id !== id))
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) qc.setQueryData(taskKeys.list(), context.previous)
    },
    onSettled: (_data, _err, id) => {
      qc.removeQueries({ queryKey: taskKeys.detail(id) })
      return qc.invalidateQueries({ queryKey: taskKeys.list() })
    },
  })
}

export function useClearCompleted() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: number[]) => Promise.all(ids.map((id) => tasksApi.remove(id))),
    onSettled: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  })
}
