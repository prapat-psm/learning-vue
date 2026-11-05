# เส้นทางการเรียน Vue.js: จากพื้นฐานจนถึง Production

คู่มือนี้เขียนให้ **นักพัฒนา React / Next.js** ที่อยากเข้าใจ Vue 3 อย่างลึก ไม่ใช่แค่รันโค้ดให้ผ่าน
เราสร้างแอปเดียวชื่อ **Task Board** แล้วค่อยๆ ขยายทีละ step แต่ละ step มีโค้ดที่รันได้จริงอยู่ใน [`steps/`](steps)

> สัญลักษณ์: ✅ ทำเสร็จแล้ว · ⏳ step ถัดไป
>
> เส้นทางต่อ: จบ Step 10 แล้วไปที่ **learning-playwright** (ดูท้ายเอกสาร)

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

### ✅ Step 08 · Testing เชิงลึก · `steps/08-testing`

**เรียนอะไร:** เขียนเทสต์ที่ "เชื่อได้" ว่าแอปใช้งานได้จริง ไม่ใช่แค่ทำให้ตัวเลข coverage สูง

**ทำไมต้องมี step นี้:** step 01-07 มีเทสต์อยู่แล้ว แต่ส่วนใหญ่เขียนแบบ Vue Test Utils (หา element ด้วย CSS, `data-test`, `setValue`)
step นี้เพิ่มวิธีคิดแบบเดียวกับ React Testing Library ที่คุณคุ้นอยู่ และครบทุกชั้นของ test pyramid

**1. Test pyramid ของโปรเจกต์นี้**
| ชั้น | ตัวอย่างในโค้ด | ทดสอบอะไร | จำนวน |
|---|---|---|---|
| Unit | `routes.spec.ts`, `queryClient.spec.ts`, `schemas/` | ฟังก์ชันล้วน ไม่ mount อะไร เร็วมาก | มากที่สุด |
| Component | `TaskEditor.spec.ts`, `BoardView.spec.ts` | component เดียว + network ปลอม | ปานกลาง |
| Integration | `board.user.spec.ts`, `App.spec.ts` | ทั้งแอป: router + Pinia + Query + MSW | ปานกลาง |
| E2E | `e2e/tasks.spec.ts` (Playwright) | build จริง ในเบราว์เซอร์จริง | น้อยที่สุด (flow สำคัญเท่านั้น) |

**2. Testing Library: ทดสอบแบบที่ผู้ใช้เห็น** (`@testing-library/vue` API เดียวกับ React)
```ts
const { user } = await renderApp('/')                       // ≈ custom render + providers
await user.type(screen.getByRole('textbox', { name: 'New task' }), 'Milk{Enter}')
expect(await screen.findByRole('link', { name: 'Milk' })).toBeInTheDocument()
```
- **ลำดับการเลือก query:** `getByRole` → `getByLabelText` → `getByText` → `data-test` เป็นทางเลือกสุดท้าย
- `getBy*` = ต้องมีตอนนี้, `findBy*` = รอจนมี (หลัง request), `queryBy*` = ใช้ตรวจว่า "ไม่มี"
- `user-event` จำลองการพิมพ์จริง (focus, keydown, input, change ครบ) ต่างจาก `setValue` ที่ยิงแค่ event
- ถ้าหา element ด้วย role ไม่เจอ มักแปลว่า **a11y ของหน้าเว็บมีปัญหา** เทสต์จึงช่วยตรวจ accessibility ไปด้วย
- `jest-dom` matcher: `toBeChecked`, `toHaveValue`, `toHaveAccessibleDescription` อ่านง่ายกว่าเช็ค attribute เอง

**Vue Test Utils vs Testing Library ใช้เมื่อไหร่**
- **Testing Library:** ค่าเริ่มต้นสำหรับเทสต์หน้าจอและ flow ของผู้ใช้
- **Vue Test Utils:** เมื่อต้องเข้าถึงข้างใน เช่น ตรวจ `emitted()` ของ component, `props()` ของ stub หรือเรียก `defineExpose`

**3. ข้อมูลทดสอบที่อ่านง่าย: factory + scenario helper**
```ts
mockApi.seed([buildTask({ title: 'Fragile' })])   // เทสต์บอกเฉพาะสิ่งที่สำคัญกับมัน
mockApi.fail('patch', '/tasks/:id', 500)         // server พังเฉพาะ endpoint นี้
mockApi.networkError('get', '/tasks')            // ไม่มี response เลย (เหมือน offline)
mockApi.hang('get', '/tasks')                    // ค้างตลอด → ทดสอบสถานะ loading ได้แน่นอน
const calls = mockApi.record()                   // ตรวจว่าแอป "ส่งอะไร" ไปหา server (สัญญากับ API)
```

**4. เขียนเทสต์ก่อน เจอบั๊กจริง (TDD เล็กๆ)**
step 07 ทำ optimistic toggle แล้ว rollback เงียบๆ เมื่อ server พัง ผู้ใช้ไม่รู้เลยว่าการแก้หายไป
เขียนเทสต์ "rolls back a failed toggle and tells the user" ก่อน (fail) แล้วค่อยเพิ่ม `role="alert"` ใน `BoardView.vue` (pass)

**5. ทดสอบ config และ router แบบ unit**
- `router.resolve('/tasks/abc').name === 'not-found'` ไม่ต้อง mount อะไร ล็อก "สัญญา URL" ไว้ (bookmark และลิงก์ที่แชร์ไปแล้วพึ่งสิ่งนี้)
- นโยบาย `retry` ของ QueryClient เป็นแค่ฟังก์ชัน เทสต์ด้วย `it.each` เป็นตาราง
- `toMatchInlineSnapshot()` เหมาะกับค่าเล็กและคงที่ (query keys) **อย่า snapshot DOM ทั้งหน้า** เพราะคนจะกด update โดยไม่อ่าน

**6. Coverage**
```bash
npm run test:coverage -w steps/08-testing   # รายงานใน terminal + coverage/index.html
```
- นับเฉพาะโค้ดของแอป ไม่นับ `test/`, `mocks/`, `playground/`
- ตั้ง `thresholds` ไว้ CI จะ fail เมื่อ coverage ลดลง ใช้ตัวเลขที่ทำได้แล้ว แล้วค่อยขยับขึ้น
- **Coverage สูงไม่ได้แปลว่าเทสต์ดี** มันบอกแค่ว่า "บรรทัดไหนไม่เคยถูกรัน" ใช้หาจุดที่ลืมเทสต์ (เช่น `queryClient.ts` เคยเป็น 0%)

**7. E2E ด้วย Playwright**
- รันกับ **production build** (`vite build` + `vite preview`) ไม่ใช่ dev server
- locator แบบเดียวกับ Testing Library (`getByRole`, `getByLabel`) และ `expect` รอให้เองอัตโนมัติ
- **เจอ race condition จริง:** ติ๊ก checkbox แล้ว reload ทันที การแก้หาย เพราะ optimistic UI ติ๊กก่อน server บันทึก
  แก้เทสต์ด้วย `page.waitForResponse(PATCH)` และนี่คือเหตุผลที่ E2E มีค่า: มันจับปัญหาที่ unit test มองไม่เห็น

**ข้อผิดพลาดที่พบบ่อย**
- ใช้ `getBy*` กับสิ่งที่มาหลัง request → ใช้ `findBy*`
- `await new Promise(r => setTimeout(r, 500))` เพื่อ "รอให้เสร็จ" → ช้าและ flaky ใช้ `findBy*` / `waitFor`
- mock `useQuery` หรือ `fetch` ด้วย `vi.mock` → เทสต์ผ่านแต่แอปพังได้ ใช้ MSW mock ที่ระดับ network
- ลืม `cleanup()` ระหว่างเทสต์ (vitest ไม่ได้เปิด `globals`) → DOM ของเทสต์ก่อนค้าง ใส่ไว้ใน `setup.ts`
- ทดสอบ implementation (`wrapper.vm.someRef`) แทนพฤติกรรม → refactor นิดเดียวเทสต์ก็พัง
- เขียน E2E ทุกกรณี → ช้าและเปราะ ให้ E2E ครอบเฉพาะ flow หลัก ที่เหลือไว้ในชั้นล่าง

### ✅ Step 09 · Pattern สำหรับ Production · `steps/09-production`

**เรียนอะไร:** ของที่แอปจริงทุกตัวต้องมี แต่ tutorial ส่วนใหญ่ข้ามไป: config, error, notification, dialog, performance และ accessibility

**ทำไมต้องมี step นี้:** แอป step 08 "ทำงานได้" แต่ถ้า env ผิด หน้าใดหน้าหนึ่ง crash หรือผู้ใช้ใช้ screen reader แอปจะพังแบบเงียบๆ หรือใช้ไม่ได้

**1. Env config ที่ตรวจตั้งแต่เริ่มแอป** (`src/config.ts`, `.env.example`)
```ts
const envSchema = z.object({ VITE_API_URL: z.union([z.literal(''), z.string().url()]).optional(), ... })
export const config = parseEnv(import.meta.env)   // ผิด → throw ตอนเปิดแอปเลย พร้อมบอกทุกตัวที่ผิด
```
- `import.meta.env.VITE_*` ≈ `process.env.NEXT_PUBLIC_*` ของ Next.js: **เป็นข้อมูลสาธารณะ** ถูกฝังใน JS ที่เบราว์เซอร์โหลด ห้ามใส่ secret
- โค้ดส่วนอื่นใช้ `config.apiUrl` แทนการอ่าน `import.meta.env` กระจายทั่วแอป
- แยก `parseEnv()` เป็นฟังก์ชันล้วน จึงเทสต์ได้ทุกกรณี

**2. `provide` / `inject` ≈ React Context** (toast + confirm dialog)
```ts
export const ToastKey: InjectionKey<ToastApi> = Symbol('toast')   // ≈ createContext<ToastApi>()
app.provide(ToastKey, api)                                         // ≈ <Provider value={api}>
const toast = inject(ToastKey)                                     // ≈ useContext(ToastContext)
```
- ห่อเป็น **plugin** (`app.use(createToast())`) แบบเดียวกับที่ vue-router และ vue-query ทำ
- `useToast()` throw error ชัดเจนเมื่อลืมติดตั้ง plugin ดีกว่าได้ `undefined` แล้วพังทีหลัง
- **ทำไมไม่ใช้ Pinia:** toast เป็น "บริการของแอป" ไม่ใช่ข้อมูลของแอป ส่วน `InjectionKey` ทำให้ type ถูกต้องตลอด

**3. `<Teleport>` ≈ `createPortal`**
- toast และ dialog render ไปที่ท้าย `<body>` จึงไม่โดน `overflow: hidden` หรือ `z-index` ของ parent ทับ
- **ในเทสต์:** element ที่ teleport ไม่อยู่ใน `wrapper` ของ VTU แต่ `screen` ของ Testing Library ค้นทั้ง `body` จึงเจอปกติ

**4. Confirm dialog แทน `window.confirm()`**
- `confirm.ask('Discard?')` คืน **Promise** ปุ่มใน dialog เป็นตัว resolve
- Route guard รอ Promise ได้: `onBeforeRouteLeave(async () => { if (!(await confirm.ask(...))) return false })`
- a11y: `role="alertdialog"`, `aria-modal`, ย้าย focus เข้า dialog (ไปที่ปุ่มที่ไม่อันตรายก่อน), กด Esc เพื่อยกเลิก, ปิดแล้วคืน focus ที่เดิม

**5. จัดการ error สองชั้น**
| ชั้น | Vue | React |
|---|---|---|
| ต่อหน้า | `<ErrorBoundary>` ใช้ `onErrorCaptured` (return `false` = หยุดไม่ให้ลามต่อ) | Error Boundary (class component) |
| ทั้งแอป | `app.config.errorHandler` | ไม่มีตัวตรง ต้องใช้ boundary ที่ root |
| นอก Vue | `window` `unhandledrejection` | เหมือนกัน |
- ทุก error ไปที่เดียวคือ `logger.reportError()` (ของจริงส่งเข้า Sentry ที่จุดนี้)
- ErrorBoundary ครอบแค่ `<RouterView>` เมื่อหน้าใด crash, header ยังใช้ได้ และเปลี่ยนหน้าแล้วจะ reset ตัวเอง
- ลองเปิด `/debug/error` ดูได้

**6. `<KeepAlive>`** (ไม่มีตัวเทียบตรงใน React)
```vue
<RouterView v-slot="{ Component }">
  <KeepAlive include="BoardView"><component :is="Component" /></KeepAlive>
</RouterView>
```
- เปิดหน้า task แล้วกลับมา: ข้อความที่พิมพ์ค้าง และ filter ยังอยู่ เพราะ component ไม่ถูกทำลาย แค่ซ่อน
- ใช้ `onActivated` / `onDeactivated` แทน `onMounted` เมื่อต้องทำงานทุกครั้งที่กลับมาเห็น
- **cache เฉพาะหน้าที่คุ้ม** ถ้า cache ทุกหน้าจะกินหน่วยความจำ และฟอร์มอาจแสดงค่าเก่า

**7. Performance: วัดก่อนแล้วค่อยแก้**
- `v-memo="[task.title, task.done]"` ข้ามการ render แถวที่ไม่เปลี่ยน ≈ `React.memo` คุ้มเฉพาะ list ยาว
- `shallowRef` สำหรับข้อมูลก้อนใหญ่ที่แทนทั้งก้อน (ใช้แล้วใน `useFetch`, `ErrorBoundary`, `confirm`)
- lazy route / dynamic `import()` มีตั้งแต่ step 04 แล้ว (MSW ก็โหลดแบบ lazy)
- Vue ไม่ต้องใช้ `useMemo` / `useCallback` เพราะ `setup` รันครั้งเดียว

**8. Accessibility เมื่อเปลี่ยนหน้า** (`RouteAnnouncer.vue`)
- SPA เปลี่ยนหน้าโดยไม่โหลดใหม่ screen reader จึงไม่รู้ว่าเปลี่ยนหน้าแล้ว
- หลังเปลี่ยน route: อ่าน `document.title` ผ่าน `aria-live` แล้วย้าย focus ไปที่ `<main tabindex="-1">` (Next.js App Router มี route announcer ในตัวที่ทำแบบนี้)
- ไม่แย่ง focus ตอนโหลดหน้าครั้งแรก (`from === START_LOCATION`)

**`<Suspense>` ล่ะ?** ยังเป็น experimental ใน Vue 3.5 และแอปนี้ใช้ `isPending` ของ TanStack Query อยู่แล้ว จึงไม่ใช้ (React ใช้ Suspense กับ data fetching มากกว่า)

**ข้อผิดพลาดที่พบบ่อย**
- ใส่ API key ลับใน `VITE_*` → ทุกคนเห็นใน bundle ต้องเก็บไว้ฝั่ง server
- `inject()` โดยไม่มี default และไม่ throw → ได้ `undefined` แล้วพังห่างจากต้นเหตุ
- ErrorBoundary ครอบทั้งแอป → crash จุดเดียว ทั้งหน้าจอหาย ให้ครอบเป็นส่วนๆ
- ลืมคืน focus หลังปิด dialog → ผู้ใช้ keyboard หลงที่
- ใส่ `v-memo` ทุกที่ → ถ้าลืมใส่ค่าที่ใช้ใน template ลงใน array หน้าจอจะไม่อัปเดต (บั๊กหายาก)

### ⏳ Step 10 · Build และ Deploy (step ถัดไป)
- `vite build`, base URL และ SPA fallback (ทุก path ต้องตอบ `index.html`)
- CI ด้วย GitHub Actions: lint → type-check → test → build
- Deploy ขึ้น Vercel หรือ Netlify พร้อม preview ทุก PR
- แนะนำ **Nuxt** (SSR, SSG, file-based routing) ซึ่งเทียบได้กับ Next.js ของโลก Vue

---

## ➡️ จบ learning-vue แล้วไปต่อที่ `learning-playwright`

เมื่อจบ Step 10 แล้ว คอร์สถัดไปคือ **learning-playwright**: tutorial Playwright สำหรับมือใหม่ แยกเป็น repo ของตัวเอง
- **ทำไมแยก repo:** Playwright ไม่ผูกกับ framework ใด เทสต์ชุดเดียวรันได้ทั้งแอป Vue, React และ Next.js เพราะมันคุยกับ DOM ในเบราว์เซอร์จริง ไม่ใช่กับ component
- **ต่อยอดจากที่นี่:** step 08 มี E2E 3 flow แล้ว (`steps/08-testing/e2e`) ส่วน learning-playwright จะลงลึกเรื่อง locator, auto-wait, fixture, Page Object, network mocking, trace viewer, visual test และ CI
- **ใช้แอปเดิมเป็นตัวทดสอบ:** Task Board จาก step 07-09

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
| Context | `provide` / `inject` (บริการของแอป) หรือ Pinia (ข้อมูล) |
| `createPortal` | `<Teleport to="body">` |
| Error Boundary | `onErrorCaptured` + `app.config.errorHandler` |
| `React.memo` | `v-memo` (ส่วนใหญ่ไม่ต้องใช้) |
| (ไม่มี) | `<KeepAlive>` |
| `process.env.NEXT_PUBLIC_*` | `import.meta.env.VITE_*` |
| Zustand | Pinia |
| `{cond && <A/>}` | `v-if` |
| `list.map(...)` | `v-for` + `:key` |
| `className={clsx(...)}` | `:class="{ ... }"` |
| CSS Modules | `<style scoped>` |
| `<Link>`, `useRouter` | `<RouterLink>`, `useRouter` |
| `layout.tsx` + `{children}` | nested route + `<RouterView>` |
| react-hook-form + zod | VeeValidate + zod |
| RTL `render`, `renderHook` | `@testing-library/vue` `render` หรือ VTU `mount`, `withSetup` |
| react-query | `@tanstack/vue-query` (API เดียวกัน คืนค่าเป็น ref) |
| Playwright / Cypress | เหมือนกันทุกอย่าง |
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
