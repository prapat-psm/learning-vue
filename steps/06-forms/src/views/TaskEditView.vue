<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import TaskEditor from '@/components/TaskEditor.vue'
import { useTasksStore } from '@/stores/tasks'
import type { TaskInput } from '@/schemas/task'

const props = defineProps<{ id: number }>()
const router = useRouter()
const store = useTasksStore()

const task = computed(() => store.byId(props.id))
// Copy the values once: the form edits a draft, the store only changes on Save
const initialValues = computed(() => {
  const t = task.value
  return t
    ? {
        title: t.title,
        description: t.description ?? '',
        priority: t.priority ?? 'medium',
        dueDate: t.dueDate,
      }
    : {}
})

const dirty = ref(false)
const editor = useTemplateRef('editor') // ≈ useRef + ref={editor}

async function save(
  values: TaskInput,
  { setFieldError }: { setFieldError: (f: keyof TaskInput, m: string) => void },
) {
  if (store.isTitleTaken(values.title, props.id)) {
    setFieldError('title', 'A task with this title already exists')
    return
  }
  store.updateTask(props.id, values)
  editor.value?.markSaved(values) // clears dirty so the leave-guard won't ask
  await router.push({ name: 'task', params: { id: props.id } })
}

// In-component guard (step 04 exercise): warn before losing unsaved changes
onBeforeRouteLeave(() => {
  if (dirty.value && !window.confirm('Discard unsaved changes?')) return false
})
</script>

<template>
  <template v-if="task">
    <h1>Edit task</h1>
    <!-- :key → a different task id remounts the form with fresh initial values -->
    <TaskEditor
      ref="editor"
      :key="id"
      v-model:dirty="dirty"
      :initial-values="initialValues"
      @submit="save"
      @cancel="router.push({ name: 'task', params: { id } })"
    />
  </template>
</template>
