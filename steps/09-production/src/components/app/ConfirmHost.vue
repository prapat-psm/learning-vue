<script setup lang="ts">
import { nextTick, useTemplateRef, watch } from 'vue'
import { useConfirm } from '@/plugins/confirm'

const { current } = useConfirm()
const cancelButton = useTemplateRef('cancel')
let returnFocusTo: HTMLElement | null = null

// a11y: move focus INTO the dialog when it opens, and back to where it was when it closes
watch(
  () => current.value,
  async (request, previous) => {
    if (request && !previous) {
      returnFocusTo = document.activeElement as HTMLElement | null
      await nextTick()
      cancelButton.value?.focus() // safe default: the non-destructive button
    } else if (!request && previous) {
      returnFocusTo?.focus?.()
    }
  },
)
</script>

<template>
  <Teleport to="body">
    <div v-if="current" class="backdrop" @click.self="current.resolve(false)">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-message"
        class="dialog"
        @keydown.esc="current.resolve(false)"
      >
        <p id="confirm-message">{{ current.message }}</p>
        <div class="actions">
          <button ref="cancel" type="button" @click="current.resolve(false)">
            {{ current.cancelLabel }}
          </button>
          <button type="button" class="danger" @click="current.resolve(true)">
            {{ current.confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgb(0 0 0 / 40%);
  z-index: 20;
}
.dialog {
  min-width: 18rem;
  padding: 1rem;
  border-radius: 8px;
  background: white;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.danger {
  color: white;
  background: #c0392b;
  border: 0;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
}
</style>
