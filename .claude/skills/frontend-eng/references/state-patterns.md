# State Management Patterns

Detailed patterns for managing state in frontend applications: local, shared, server, and URL state.

## Table of Contents

1. [State Categories Overview](#state-categories-overview)
2. [Local State Patterns](#local-state-patterns)
3. [Shared State Patterns](#shared-state-patterns)
4. [Server State Patterns](#server-state-patterns)
5. [URL State Patterns](#url-state-patterns)
6. [Choosing State Location](#choosing-state-location)
7. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## State Categories Overview

| Category | Scope | Examples | Typical Solutions |
|----------|-------|----------|-------------------|
| **Local** | Single component | Form input, toggle, modal open | useState, useReducer |
| **Shared** | Multiple components | Theme, user preferences, cart | Context, Zustand, Redux |
| **Server** | External source | API data, database records | React Query, SWR |
| **URL** | Navigation | Current page, filters, search | Router, search params |

### Key Principle

State should live as close as possible to where it's used. Don't lift state unless necessary. Don't use global stores for local concerns.

---

## Local State Patterns

### Simple Values

Use `useState` for simple, independent values:

```javascript
const [isOpen, setIsOpen] = useState(false);
const [count, setCount] = useState(0);
const [text, setText] = useState('');
```

### Related Values

Group related values in an object:

```javascript
// Instead of multiple useState calls
const [form, setForm] = useState({
  name: '',
  email: '',
  message: ''
});

// Update a single field
const updateField = (field, value) => {
  setForm(prev => ({ ...prev, [field]: value }));
};
```

### Complex State Logic

Use `useReducer` when state updates follow complex rules:

```javascript
const initialState = {
  items: [],
  status: 'idle',
  error: null
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, status: 'loading', error: null };
    case 'FETCH_SUCCESS':
      return { ...state, status: 'success', items: action.payload };
    case 'FETCH_ERROR':
      return { ...state, status: 'error', error: action.payload };
    default:
      return state;
  }
}

const [state, dispatch] = useReducer(reducer, initialState);
```

### Derived State

Calculate derived values instead of storing them:

```javascript
// DON'T store derived state
const [items, setItems] = useState([]);
const [total, setTotal] = useState(0); // ❌ Derived from items

// DO calculate it
const [items, setItems] = useState([]);
const total = items.reduce((sum, item) => sum + item.price, 0); // ✅
```

---

## Shared State Patterns

### Props Passing (1-2 levels)

For shallow component trees, pass props directly:

```javascript
function Parent() {
  const [user, setUser] = useState(null);

  return (
    <Header user={user} />
    <Main user={user} onLogout={() => setUser(null)} />
  );
}
```

### Context (Cross-cutting concerns)

For data needed throughout the app (theme, auth, locale):

```javascript
// Create context
const ThemeContext = createContext();

// Provider component
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Consumer hook
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### Context Splitting

Split contexts by update frequency to avoid unnecessary re-renders:

```javascript
// Separate contexts for different data
const UserContext = createContext();      // Rarely changes
const CartContext = createContext();      // Changes often
const SettingsContext = createContext();  // Rarely changes

// Consumers only re-render when their context changes
```

### External Stores

For complex state with many subscribers, use external stores:

```javascript
// Zustand example
import { create } from 'zustand';

const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
  clearCart: () => set({ items: [] })
}));

// Usage in component
function Cart() {
  const { items, removeItem } = useCartStore();
  // ...
}
```

---

## Server State Patterns

### Basic Data Fetching

Use dedicated libraries for server state (React Query, SWR):

```javascript
// React Query example
function UserProfile({ userId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId)
  });

  if (isLoading) return <Skeleton />;
  if (error) return <Error message={error.message} />;
  return <Profile user={data} />;
}
```

### Caching and Invalidation

```javascript
// Automatic caching with stale time
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Invalidate after mutation
const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  }
});
```

### Optimistic Updates

Update UI before server confirms:

```javascript
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(['todos']);

    // Optimistically update
    queryClient.setQueryData(['todos'], (old) =>
      old.map(todo => todo.id === newTodo.id ? newTodo : todo)
    );

    return { previous };
  },
  onError: (err, newTodo, context) => {
    // Rollback on error
    queryClient.setQueryData(['todos'], context.previous);
  }
});
```

### Pagination and Infinite Scroll

```javascript
// Infinite query
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam = 0 }) => fetchPosts(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor
});

// Flatten pages for rendering
const allPosts = data?.pages.flatMap(page => page.posts) ?? [];
```

---

## URL State Patterns

### Reading URL State

```javascript
// Using router hooks (Next.js example)
import { useSearchParams } from 'next/navigation';

function ProductList() {
  const searchParams = useSearchParams();

  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');

  // Fetch based on URL state
  const { data } = useQuery({
    queryKey: ['products', { category, sort, page }],
    queryFn: () => fetchProducts({ category, sort, page })
  });
}
```

### Updating URL State

```javascript
import { useRouter, useSearchParams } from 'next/navigation';

function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <select onChange={(e) => updateFilter('category', e.target.value)}>
      <option value="">All</option>
      <option value="electronics">Electronics</option>
      <option value="clothing">Clothing</option>
    </select>
  );
}
```

### Syncing URL with State

```javascript
// Initialize state from URL
const [filters, setFilters] = useState(() => ({
  search: searchParams.get('q') || '',
  category: searchParams.get('category') || 'all'
}));

// Sync state changes to URL
useEffect(() => {
  const params = new URLSearchParams();
  if (filters.search) params.set('q', filters.search);
  if (filters.category !== 'all') params.set('category', filters.category);

  router.replace(`?${params.toString()}`, { scroll: false });
}, [filters]);
```

---

## Choosing State Location

### Decision Tree

```
Where should this state live?

1. Is it only used in this component?
   └── YES → Local state (useState)

2. Is it used by siblings or cousins?
   └── YES → Lift to common parent, pass as props

3. Is it used in many distant places?
   ├── Does it change frequently?
   │   ├── YES → External store (Zustand, Redux)
   │   └── NO → Context
   └── Is it cross-cutting (theme, auth)?
       └── YES → Context

4. Does it come from an API?
   └── YES → Server state library (React Query, SWR)

5. Should it be shareable via URL?
   └── YES → URL state (router, search params)
```

### Common Patterns by Use Case

| Use Case | Recommended Approach |
|----------|---------------------|
| Form input values | Local state |
| Modal open/closed | Local state |
| Current user | Context |
| Theme/dark mode | Context |
| Shopping cart | External store |
| List of products | Server state |
| Search filters | URL state |
| Current page/tab | URL state |

---

## Anti-Patterns to Avoid

### Putting Everything in Global State

**Problem**: Global store becomes a dumping ground.

```javascript
// ❌ DON'T
const globalStore = {
  user: null,
  theme: 'light',
  isModalOpen: false,      // Should be local
  formInput: '',           // Should be local
  dropdownSelection: null, // Should be local
};
```

**Solution**: Only put truly global data in global stores.

### Duplicating Server State

**Problem**: Copying server data into local state causes sync issues.

```javascript
// ❌ DON'T
const [users, setUsers] = useState([]);
useEffect(() => {
  fetch('/api/users').then(data => setUsers(data));
}, []);

// ✅ DO
const { data: users } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers
});
```

### Prop Drilling Through Many Layers

**Problem**: Passing props through components that don't use them.

```javascript
// ❌ Props passed through 5 components
<App user={user}>
  <Layout user={user}>
    <Main user={user}>
      <Content user={user}>
        <Header user={user} />  // Only Header uses it
```

**Solution**: Use context or composition.

```javascript
// ✅ Composition
<App>
  <Layout header={<Header user={user} />}>
    <Main>
      <Content />
```

### State That's Not State

**Problem**: Storing values that can be calculated.

```javascript
// ❌ DON'T
const [items, setItems] = useState([]);
const [filteredItems, setFilteredItems] = useState([]);
const [totalPrice, setTotalPrice] = useState(0);

// Every update needs to sync all three

// ✅ DO
const [items, setItems] = useState([]);
const [filter, setFilter] = useState('all');

const filteredItems = items.filter(item =>
  filter === 'all' || item.category === filter
);
const totalPrice = filteredItems.reduce((sum, item) => sum + item.price, 0);
```

### Missing Loading/Error States

**Problem**: Not handling async state transitions.

```javascript
// ❌ DON'T
const [data, setData] = useState(null);
// What shows while loading? What if it fails?

// ✅ DO
const [state, setState] = useState({
  data: null,
  status: 'idle', // 'idle' | 'loading' | 'success' | 'error'
  error: null
});
```

---

## Quick Reference

### When to Use What

| Pattern | Use For | Avoid When |
|---------|---------|------------|
| `useState` | Simple local values | Complex logic, many updates |
| `useReducer` | Complex state logic | Simple toggles |
| Context | Cross-cutting concerns | Frequently changing data |
| External store | Complex shared state | Single-component state |
| Server state lib | API/remote data | Static/local data |
| URL state | Shareable, bookmarkable | Ephemeral UI state |
