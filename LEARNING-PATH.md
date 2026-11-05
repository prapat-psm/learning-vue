# เส้นทางการเรียน Vue.js: จากพื้นฐานจนถึง Production

คู่มือนี้เขียนให้ **นักพัฒนา React / Next.js** ที่อยากเข้าใจ Vue 3 อย่างลึก ไม่ใช่แค่รันโค้ดให้ผ่าน
เราสร้างแอปเดียวชื่อ **Task Board** แล้วค่อยๆ ขยายทีละ step แต่ละ step มีโค้ดที่รันได้จริงอยู่ใน [`steps/`](steps)

> สัญลักษณ์: ✅ ทำเสร็จแล้ว · ⏳ step ถัดไป

---

## ก่อนเริ่ม: ความคิดที่ต้องเปลี่ยนเมื่อมาจาก React

ถ้าจำได้แค่หัวข้อเดียวจากเอกสารนี้ ให้จำหัวข้อนี้

### 1. Component ใน Vue "รันครั้งเดียว" ส่วนใน React "รันทุกครั้งที่ render"

```tsx
// React: ฟังก์ชันนี้ถูกเรียกใหม่ทุกครั้งที่ state เปลี่ยน
function Counter() {
  const [count, setCount] = useState(0)
  const double = useMemo(() => count * 2, [count]) // ต้องบอก dependency เอง
  return <button onClick={() => setCount(count + 1)}>{double}</button>
}
```

```vue
<!-- Vue: <script setup> รันแค่ครั้งเดียวตอนสร้าง component -->
<script setup lang="ts">
const count = ref(0)
const double = computed(() => count.value * 2) // Vue รู้ dependency เอง
</script>
<template>
  <button @click="count++">{{ double }}</button>
</template>
```

**ผลที่ตามมา:**
- ไม่มี dependency array ไม่มี stale closure ไม่มี rules of hooks
- ไม่ค่อยต้องใช้ `useCallback` หรือ `memo` เพราะฟังก์ชันไม่ถูกสร้างใหม่ทุก render
- `if` / `for` ใน `<script setup>` **จะไม่รันซ้ำ** เมื่อ state เปลี่ยน สิ่งที่ต้องคำนวณใหม่ตาม state ต้องอยู่ใน `computed`, `watch` หรือ template

### 2. Vue "แก้ค่าตรงๆ" ได้ (mutable) ส่วน React ต้อง "สร้างค่าใหม่" (immutable)

```ts
// React
setTasks([...tasks, newTask])
setUser({ ...user, name: 'A' })

// Vue
tasks.value.push(newTask)
user.value.name = 'A'
```

Vue ห่อข้อมูลด้วย **Proxy** ทุกครั้งที่เราอ่านค่า Vue จะจดไว้ว่า "ใครอ่านอะไร" (track) และเมื่อเราเขียนค่า Vue จะแจ้งเฉพาะคนที่อ่านค่านั้นให้อัปเดต (trigger) นี่คือระบบ **reactivity** ซึ่งเป็นหัวใจของ Vue

### 3. Template ไม่ใช่ JSX

Template ถูก compile เป็น render function ที่ optimize ไว้แล้ว Vue รู้ว่าส่วนไหนของ template คงที่และส่วนไหนเปลี่ยนได้ จึงอัปเดตเฉพาะจุดที่จำเป็น ข้อแลกเปลี่ยนคือความยืดหยุ่นน้อยกว่า JSX เล็กน้อย แต่อ่านง่ายและเร็วกว่าโดยไม่ต้องจูน

---

## Phase 1 · พื้นฐาน

### ✅ Step 01 · Reactivity · `steps/01-reactivity`

**เรียนอะไร:** `ref`, `computed`, `watch` และ template syntax พื้นฐาน

**แนวคิดสำคัญ**

| เครื่องมือ | ใช้เมื่อ | เทียบ React |
|---|---|---|
| `ref(x)` | เก็บค่าที่เปลี่ยนได้ อ่านและเขียนผ่าน `.value` ใน script (ใน template ไม่ต้องใส่ `.value`) | `useState` |
| `computed(() => ...)` | ค่าที่ **คำนวณจากค่าอื่น** ระบบจะ cache ไว้และคำนวณใหม่เมื่อ dependency เปลี่ยนเท่านั้น | `useMemo` |
| `watch(source, cb)` | ต้องการ **side effect** เมื่อค่าเปลี่ยน เช่น เปลี่ยน `document.title` หรือเรียก API | `useEffect` |

**Template syntax ที่ต้องรู้**
- `{{ expr }}` แสดงค่า
- `:attr="expr"` (ย่อมาจาก `v-bind`) ผูก attribute กับค่า
- `@event="fn"` (ย่อมาจาก `v-on`) ดัก event ส่วน `.prevent` คือ `e.preventDefault()`
- `v-if` / `v-else` ใช้แสดงแบบมีเงื่อนไข ส่วน `v-show` แค่ซ่อนด้วย CSS
- `v-for="t in list" :key="t.id"` ใช้วนลูป และต้องมี `key` เสมอ เหมือน React
- `v-model` คือ two-way binding รวม `value` กับ `onChange` ไว้ในคำเดียว

**ข้อผิดพลาดที่พบบ่อย**
- ลืม `.value` ใน script เช่น `count + 1` จะได้ object ไม่ใช่ตัวเลข
- ใช้ `watch` ทำสิ่งที่ควรเป็น `computed` กฎคือ ถ้า "ได้ค่าออกมา" ให้ใช้ `computed` ถ้า "ทำอะไรบางอย่าง" ให้ใช้ `watch`

---

### ✅ Step 02 · Components · `steps/02-components`

**เรียนอะไร:** แยก component, ส่งข้อมูลด้วย props, ส่งเหตุการณ์ด้วย emits และ slots

**แนวคิดสำคัญ: "Props down, events up"**
- พ่อส่งข้อมูลให้ลูกผ่าน **props** ซึ่งลูก **ห้ามแก้** (อ่านอย่างเดียว เหมือน React)
- ลูกบอกพ่อว่า "มีอะไรเกิดขึ้น" ผ่าน **emit** แล้วพ่อเป็นคนแก้ state เอง

```ts
// TaskItem.vue
const props = defineProps<{ task: Task }>()
const emit = defineEmits<{ remove: [id: number] }>()
// <button @click="emit('remove', task.id)">

// พ่อ: <TaskItem :task="t" @remove="removeTask" />
```

React ใช้ callback prop (`onRemove`) ส่วน Vue แยก "ข้อมูล" กับ "เหตุการณ์" ออกจากกันชัดเจน ทำให้อ่านง่ายว่า component นี้รับอะไรและส่งอะไรออก

**`defineModel`** ทำให้ component ของเราใช้ `v-model` ได้ (เบื้องหลังคือ prop `modelValue` กับ event `update:modelValue`) ใช้กับ input ที่ต้องแก้ค่าสองทางจริงๆ เท่านั้น

**Slots** คือช่องที่ให้พ่อ "ใส่ template" เข้าไปในลูก เทียบได้กับ `children` หรือ prop ที่รับ ReactNode ใน React ส่วน **named slot** (`#empty`) คือการมีหลายช่อง และ slot สามารถมี fallback content ได้

**ข้อผิดพลาดที่พบบ่อย**
- แก้ prop ตรงๆ เช่น `props.task.done = true` ESLint จะเตือน ให้ emit แทน
- ใช้ `defineModel` กับทุกอย่าง ถ้าเป็น "การกระทำ" (ลบ, บันทึก) ให้ใช้ emit

---

### ✅ Step 03 · Composables · `steps/03-composables`

**เรียนอะไร:** แยก logic ออกจาก component เป็นฟังก์ชันที่ใช้ซ้ำได้

**Composable คืออะไร** คือฟังก์ชันชื่อขึ้นต้นด้วย `use` ที่ใช้ `ref`, `computed`, `watch` และ lifecycle ภายใน แล้ว return ค่าออกมา เทียบได้กับ **custom hook** แต่ข้อดีคือ:
- ถูกเรียกครั้งเดียว จึงเรียกใน `if` หรือ loop ได้ และไม่มี rules of hooks
- เรียกนอก component ได้ (เช่นใน test) ถ้าไม่ได้ใช้ lifecycle

**Lifecycle**
- `onMounted(fn)` ทำงานหลัง component แสดงบนหน้าจอ เช่น ผูก event listener
- `onUnmounted(fn)` ทำงานตอน component ถูกเอาออก ใช้ cleanup
- คู่นี้แทน `useEffect(() => { ...; return cleanup }, [])` ใน React

**`ref` กับ `reactive`**
```ts
const count = ref(0)                   // ใช้ได้ทุกชนิด ต้องใช้ .value
const form = reactive({ a: 1 })        // ใช้กับ object เท่านั้น ไม่ต้องใช้ .value
const { a } = form                     // ❌ reactivity หลุด a กลายเป็นตัวเลขธรรมดา
const { a } = toRefs(form)             // ✅ a เป็น Ref
```
**คำแนะนำ:** ใช้ `ref` เป็นหลัก และ return เป็น object ของ ref จาก composable ผู้เรียกจะ destructure ได้อย่างปลอดภัย

**บทเรียนจาก bug จริงใน step นี้:** `ref(initial)` ห่อ object **ตัวเดียวกัน** กับค่า default เมื่อ `push` เข้าไป ค่า default ก็เปลี่ยนตามด้วย วิธีแก้คือ `structuredClone(initial)` (ใน React ก็เกิดได้ถ้า mutate initial state)

---

## Phase 2 · สร้างแอปจริง

### ✅ Step 04 · Vue Router + Playground · `steps/04-router`

**เรียนอะไร:** ทำแอปหลายหน้า (SPA) ด้วย Vue Router

**ต่างจาก Next.js อย่างไร**
- Next.js ใช้ **file-based routing** (`app/tasks/[id]/page.tsx`)
- Vue Router ใช้ **config-based routing** คือเขียนรายการ route เองใน `routes.ts` ซึ่งยืดหยุ่นกว่าแต่ต้องเขียนเอง (ถ้าอยากได้แบบ file-based ให้ใช้ Nuxt)
- Vue Router ทำงานฝั่ง client อย่างเดียว ไม่มี Server Components

**แนวคิดสำคัญ**
- `<RouterView />` คือจุดที่หน้าที่ match จะถูก render ≈ `{children}` ใน `layout.tsx`
- **Nested routes** คือ route ที่มี `children` และมี `<RouterView />` ซ้อนข้างใน ≈ layout ซ้อนกัน
- **Lazy route** `component: () => import('...')` แยกโค้ดหน้านั้นเป็นไฟล์ JS ต่างหาก โหลดเมื่อเข้าหน้าครั้งแรก
- **`props` function** แปลง param (string) เป็น prop ที่มี type ทำให้ component ไม่ผูกกับ router และ test ง่าย
- **Navigation guard** (`beforeEnter`, `beforeEach`) ตรวจก่อนเข้าหน้า เช่น ถ้าไม่มี task นี้ให้ไป 404 ≈ `notFound()` / `middleware.ts`

**กับดักสำคัญ:** จาก `/tasks/1` ไป `/tasks/2` Vue **ใช้ component เดิม** (ไม่ remount) ทุกอย่างที่ขึ้นกับ id จึงต้องเป็น `computed` จาก props หรือ `watch(() => props.id)`

**Playground:** หน้า `/playground/NN` โหลด `App.vue` ของ step ก่อนหน้ามาแสดงในเว็บเดียว เป็นตัวอย่างการใช้ nested route กับ lazy route ในงานจริง

---

### ✅ Step 05 · Pinia · `steps/05-pinia`

**เรียนอะไร:** state กลางที่ทั้งแอปใช้ร่วมกัน

**ปัญหาที่ Pinia แก้:** ใน step 04 การเรียก `useTasks()` ทุกครั้งสร้าง state **ก้อนใหม่** board กับหน้าอื่นจึงไม่ sync กัน ส่วน `useTasksStore()` คืน **instance เดียวกันทั้งแอป** (singleton)

```ts
export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])                         // state
  const remaining = computed(() => ...)                 // getter
  function addTask(title: string) { ... }               // action
  return { tasks, remaining, addTask }                  // ต้อง return state ทั้งหมด
})
```
เขียนเหมือน composable ทุกอย่าง แค่ห่อด้วย `defineStore` เทียบได้กับ **Zustand** แต่แก้ค่าตรงๆ ได้โดยไม่ต้อง `set`

**กฎสำคัญเรื่อง destructure**
```ts
const { remaining } = store               // ❌ ได้ค่าธรรมดา ไม่อัปเดต
const { remaining } = storeToRefs(store)  // ✅ ยัง reactive
const { addTask } = store                 // ✅ action เป็นฟังก์ชันธรรมดา destructure ได้
```

**เลือกใช้อะไรเมื่อไหร่**
| ใช้ | เมื่อ |
|---|---|
| `ref` ใน component | state ของ component นั้นเท่านั้น |
| Composable | logic ที่ใช้ซ้ำได้ แต่ **แต่ละ component มีของตัวเอง** (`useOnline`, form) |
| Pinia store | ข้อมูลที่ **ทั้งแอปต้องเห็นตรงกัน** (user, ตะกร้า, รายการ task) |
| TanStack Query (step 07) | ข้อมูลจาก **server/API** (cache, refetch) |

**การ test:** test ตัว store จริงด้วย `setActivePinia(createPinia())` ส่วน test component ใช้ `createTestingPinia` ที่เปลี่ยน action เป็น `vi.fn()` เพื่อตรวจว่า "component เรียก action ถูกต้อง" โดยไม่ต้องสนใจ logic ข้างใน

---

### ✅ Step 06 · Forms + Validation · `steps/06-forms`

**เรียนอะไร:** ฟอร์มที่ใช้งานได้จริง พร้อม validation, error และ UX ที่ดี

**ทำสองแบบให้เห็นความต่าง**
1. **เขียนเอง** (ช่องเพิ่มงานด่วน): `ref` + `computed` error + แสดง error หลังกด submit เหมาะกับฟอร์มเล็ก 1-2 ช่อง
2. **VeeValidate + Zod** (หน้า new/edit): เหมาะกับฟอร์มจริงที่มีหลายช่อง, touched/dirty และ error จาก server

**Schema เดียวใช้ได้สองอย่าง**
```ts
const taskSchema = z.object({ title: z.string().trim().min(3), priority: z.enum([...]) })
type TaskInput = z.infer<typeof taskSchema>  // type มาจาก schema จึงไม่มีทางไม่ตรงกัน
```

**เทียบ react-hook-form**
| VeeValidate | react-hook-form |
|---|---|
| `useForm({ validationSchema: toTypedSchema(schema) })` | `useForm({ resolver: zodResolver(schema) })` |
| `defineField('title')` | `register('title')` |
| `errors.title` | `formState.errors.title?.message` |
| `meta.dirty` | `formState.isDirty` |
| `setFieldError('title', msg)` | `setError('title', { message })` |

**หลัก UX ที่ใช้ได้กับทุกโปรเจกต์**
- **ไม่เตือนขณะพิมพ์:** validate ตอน blur/change และตรวจทั้งหมดตอน submit
- **Error ต้องเข้าถึงได้ (a11y):** ใส่ `aria-invalid`, `aria-describedby` และ `role="alert"`
- **กฎฝั่ง client อยู่ใน schema ส่วนกฎฝั่ง server ส่งกลับเข้าช่อง:** เช่น "ชื่อซ้ำ" schema ไม่รู้ จึงตรวจตอน submit แล้วใช้ `setFieldError` เหมือนการ map error 422 จาก API
- **แก้บน draft แล้วบันทึกตอน submit:** ฟอร์มได้สำเนาข้อมูล store จะเปลี่ยนเมื่อกด Save เท่านั้น
- **เตือนเมื่อมีการแก้ที่ยังไม่บันทึก:** ใช้ `onBeforeRouteLeave`

---

### ✅ Step 07 · เรียก API + TanStack Query · `steps/07-api`

**เรียนอะไร:** คุยกับ server จริงผ่าน `fetch` จัดการ loading / error / ยกเลิก request และใช้ TanStack Query ทำ cache

**ทำไมต้องมี step นี้:** step 01-06 เก็บข้อมูลใน localStorage ซึ่งไม่มีทาง "ช้า" หรือ "ล้มเหลว" แต่ API จริงมีทั้งสองอย่าง
UI ทุกหน้าที่โหลดข้อมูลจึงต้องมี **3 สถานะ** เสมอ: กำลังโหลด, error (พร้อมปุ่ม Retry), และมีข้อมูล

**1. Mock API ด้วย MSW (Mock Service Worker)**
- MSW ดัก `fetch()` **ตัวจริง**: ในเบราว์เซอร์ผ่าน Service Worker (`public/mockServiceWorker.js`) และใน Vitest ผ่าน Node
- โค้ดแอปจึงเป็นโค้ด production 100% ถ้ามี backend จริง ตั้ง `VITE_API_URL` แล้ว MSW จะไม่ถูกโหลดเลย
- handler (`src/mocks/handlers.ts`) เทียบได้กับ Route Handler ของ Next.js (`app/api/tasks/route.ts`) และใช้ **Zod schema ตัวเดียวกับฟอร์ม** ตรวจข้อมูล ส่ง 422 กลับเมื่อผิด

**2. `http()` wrapper: สิ่งที่ `fetch` ไม่ทำให้**
```ts
// fetch reject เฉพาะ network error เท่านั้น! 404/500 ถือว่า "สำเร็จ" ต้อง throw เอง
if (!res.ok) throw new ApiError(res.status, body)
```
ทุกโปรเจกต์จริงมีไฟล์แบบนี้ (หรือใช้ ky / ofetch / axios) หน้าจอไม่เรียก `fetch` ตรงๆ แต่เรียกผ่าน `tasksApi.list()`

**3. `useFetch` เขียนเอง (หน้า detail)** เพื่อให้เห็นว่า library ทำอะไรให้เรา
```ts
const { data, error, isLoading, refetch } = useFetch<Task>(() => `/tasks/${props.id}`)
```
- ใช้ `watch` บน getter ของ URL แทน dependency array ของ `useEffect`
- URL เปลี่ยน → `abort()` request เก่าก่อน จึงไม่มี **race condition** (คำตอบเก่ามาทับคำตอบใหม่)
- component ถูกทำลาย → `onScopeDispose` ยกเลิก request (≈ cleanup ของ `useEffect`)
- **ที่ไม่มี:** cache, dedupe, retry, refetch เมื่อกลับมาที่แท็บ และ invalidation ต้องเรียก `refetch()` เองหลังแก้ข้อมูล

**4. TanStack Query (หน้า board, new, edit)** API เกือบเหมือน React ทุกตัว
```ts
const { data, isPending, isError, error, refetch } = useQuery({
  queryKey: ['tasks', 'list'],
  queryFn: ({ signal }) => tasksApi.list(signal),
})
```
| แนวคิด | ความหมาย |
|---|---|
| `queryKey` | ชื่อของข้อมูลใน cache สอง component ใช้ key เดียวกัน = request เดียว (header badge กับ board) |
| `staleTime` | ช่วงที่ข้อมูลยัง "สด" กลับมาหน้าเดิมภายในเวลานี้จะไม่ยิงใหม่ |
| `isPending` vs `isFetching` | `isPending` = ยังไม่เคยมีข้อมูล (แสดง skeleton), `isFetching` = กำลัง refetch เบื้องหลังโดยโชว์ข้อมูลเก่าไปก่อน |
| `invalidateQueries` | "ข้อมูลนี้เก่าแล้ว ไปโหลดใหม่" ≈ `revalidatePath()` ของ Next.js |
| `useMutation` | สำหรับการเขียน (POST/PATCH/DELETE) มี `mutate` (ไม่รอ) และ `mutateAsync` (ได้ Promise) |

**ความต่างเฉพาะของ Vue:** `queryKey` เป็น `computed` ได้ เมื่อ `props.id` เปลี่ยน query จะโหลดใหม่เอง
และค่าที่คืนมาเป็น **ref ทุกตัว** ต้อง destructure ก่อนใช้ใน template (template unwrap เฉพาะ ref ชั้นบนสุด)

**5. Optimistic update** (ติ๊ก checkbox แล้วเปลี่ยนทันที ไม่ต้องรอ server)
```ts
onMutate: async (task) => {
  await qc.cancelQueries({ queryKey })           // กัน refetch เก่ามาทับ
  const previous = qc.getQueryData(queryKey)     // จำค่าเดิมไว้
  qc.setQueryData(queryKey, (old) => /* แก้ทันที */)
  return { previous }
},
onError: (_e, _v, ctx) => qc.setQueryData(queryKey, ctx.previous),  // พัง → ย้อนกลับ
onSettled: () => qc.invalidateQueries({ queryKey }),                 // จบแล้ว sync กับ server
```

**6. แยก server state ออกจาก client state** (แนวคิดที่สำคัญที่สุดของ step นี้)
- **Server state** (รายการ task) → TanStack Query เป็นเจ้าของ cache **ไม่ต้องคัดลอกไปใส่ Pinia**
- **Client state** (filter all/active/done) → Pinia store เล็กๆ `useBoardStore`
- store `tasks` ของ step 05-06 จึงหายไป เพราะ cache ของ Query ทำหน้าที่นั้นแทนแล้ว

**7. Error จาก server กลับเข้าฟอร์ม:** step 06 ตรวจชื่อซ้ำเองใน store ตอนนี้ server ตอบ 422 พร้อม `fieldErrors` แล้ว `applyServerErrors()` ส่งเข้า `setFieldError` ของ VeeValidate

**8. Route guard หายไป:** router ไม่รู้ว่า task 999 มีอยู่จริงไหมจนกว่าจะถาม server แต่ละหน้าจึงแสดง 404 จาก response เอง (≈ เรียก `notFound()` ใน page ของ Next.js หลัง fetch)

**ข้อผิดพลาดที่พบบ่อย**
- ลืมว่า `fetch` ไม่ throw เมื่อได้ 404/500 → UI แสดงข้อมูลว่างแทน error
- เอาข้อมูล API ไปเก็บใน Pinia แล้วต้อง sync เอง → ใช้ Query cache แทน
- ใช้ `createError.message` ในรูปแบบ object ซ้อนใน template แล้วไม่ทำงาน → destructure ref ออกมาก่อน
- `retry` 404 ซ้ำๆ → ตั้ง `retry` ให้ลองใหม่เฉพาะ network/5xx (ดู `api/queryClient.ts`)
- เขียนเทสต์ด้วย `vi.mock` ทับ `fetch` → ใช้ MSW แทน เทสต์จะใกล้ของจริงและเปลี่ยน implementation ได้โดยเทสต์ไม่พัง
- ใน test ต้องสร้าง `QueryClient` ใหม่ทุกเทสต์ และปิด `retry` ไม่อย่างนั้น cache รั่วข้ามเทสต์และเทสต์ error ช้า

**เทสต์:** `src/test/setup.ts` เปิด MSW ให้ทุกไฟล์, `server.use(...)` เปลี่ยนคำตอบเฉพาะเทสต์ (เช่น 500 หรือ delay), `db.reset()` ล้างข้อมูลหลังทุกเทสต์

## Phase 3 · คุณภาพระดับ Production

### ⏳ Step 08 · Testing เชิงลึก (step ถัดไป)
- **Test pyramid:** unit (composable/store) มากที่สุด → component → integration (router + pinia) → E2E น้อยที่สุด
- ต่อยอด MSW จาก step 07: จัดชุด handler สำหรับ edge case และวัด coverage
- E2E ด้วย Playwright เฉพาะ flow สำคัญ (สร้าง แก้ ลบ task)
- `@testing-library/vue` (query แบบที่ผู้ใช้มองเห็น) เทียบกับ Vue Test Utils (เข้าถึงข้างใน component)

### ⏳ Step 09 · Pattern สำหรับ Production
- Environment variables (`import.meta.env`) พร้อม type
- จัดการ error ทั้งแอป: `app.config.errorHandler` และ `onErrorCaptured` (≈ Error Boundary)
- `provide` / `inject` (≈ Context), `<Teleport>` (≈ Portal), `<Suspense>`, `<KeepAlive>`
- Performance: `shallowRef`, `v-memo`, async component และวิเคราะห์ขนาด bundle
- Accessibility: ย้าย focus เมื่อเปลี่ยนหน้า และ live region

### ⏳ Step 10 · Build และ Deploy
- `vite build`, base URL และ SPA fallback (ทุก path ต้องตอบ `index.html`)
- CI ด้วย GitHub Actions: lint → type-check → test → build
- Deploy ขึ้น Vercel หรือ Netlify พร้อม preview ทุก PR
- แนะนำ **Nuxt** (SSR, SSG, file-based routing) ซึ่งเทียบได้กับ Next.js ของโลก Vue

---

## ตารางเทียบ React → Vue

| React / Next.js | Vue 3 |
|---|---|
| `useState` | `ref` |
| `useMemo` | `computed` |
| `useEffect(fn, [x])` | `watch(x, fn)` / `watchEffect` |
| `useEffect(fn, [])` + cleanup | `onMounted` + `onUnmounted` |
| `useRef` (DOM) | `useTemplateRef('el')` |
| Custom hook | Composable |
| Props + callback props | `defineProps` + `defineEmits` |
| `value` + `onChange` | `v-model` / `defineModel` |
| `children`, render props | slot, scoped slot |
| Context | `provide` / `inject` หรือ Pinia |
| Zustand | Pinia |
| `{cond && <A/>}` | `v-if` |
| `list.map(...)` | `v-for` + `:key` |
| `className={clsx(...)}` | `:class="{ ... }"` |
| CSS Modules | `<style scoped>` |
| `<Link>`, `useRouter` | `<RouterLink>`, `useRouter` |
| `layout.tsx` + `{children}` | nested route + `<RouterView>` |
| react-hook-form + zod | VeeValidate + zod |
| RTL `render`, `renderHook` | VTU `mount`, `withSetup` |
| Next.js | Nuxt |

## วิธีเรียนแต่ละ step (ย่อ)
1. อ่านหัวข้อของ step นั้นในเอกสารนี้ เพื่อเข้าใจ **ทำไม** ก่อน
2. อ่าน `README.md` ใน folder ของ step แล้วเปิดโค้ด ทุกไฟล์มี comment เทียบกับ React
3. รัน `npm run dev` ลองแก้โค้ดดูผล และอ่าน test เพื่อดูว่าโค้ดควรทำงานอย่างไร
4. ทำแบบฝึกหัดท้าย README โดยเขียน test ก่อน
5. เทียบกับ step ก่อนหน้า: `git diff --no-index steps/05-pinia/src steps/06-forms/src`

## แหล่งอ้างอิง
- Vue: https://vuejs.org/guide/introduction.html (เลือก Composition API)
- Vue Router: https://router.vuejs.org · Pinia: https://pinia.vuejs.org
- VeeValidate: https://vee-validate.logaretm.com/v4/ · TanStack Query Vue: https://tanstack.com/query/latest/docs/framework/vue/overview
- Vue Test Utils: https://test-utils.vuejs.org · Nuxt: https://nuxt.com
