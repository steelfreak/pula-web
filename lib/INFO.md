# API Helper Documentation

This directory contains the API helper implementation for interacting with the lexeme API.

## Files

- `api.ts` - Main API client using axios
- `types/api.ts` - TypeScript type definitions
- `hooks/useApi.ts` - React hook for easy API usage
- `hooks/useApiWithStore.ts` - Enhanced React hook with Zustand store integration
- `stores/` - Zustand stores for state management
  - `languageStore.ts` - Language state management
  - `lexemeStore.ts` - Lexeme state management
  - `index.ts` - Store exports
- `components/api-example.tsx` - Example component demonstrating basic usage
- `components/zustand-example.tsx` - Example component demonstrating Zustand store usage

## Setup

1. The API base URL is configured in `.env.local`:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000/api
   ```

2. Install dependencies:
   ```bash
   npm install axios zustand
   ```

## Usage

### Direct API Client Usage

```typescript
import { apiClient } from '@/lib/api';

// Get languages
const languages = await apiClient.getLanguages();

// Search lexemes
const results = await apiClient.searchLexemes({
  ismatch: 0,
  search: "ma",
  src_lang: "en"
});

// Get lexeme details
const details = await apiClient.getLexemeDetails({
  id: "L3625",
  lang_1: "de",
  lang_2: "fr",
  src_lang: "en"
});
```

### Using the Convenience API

```typescript
import { api } from '@/lib/api';

// Same methods as above, but shorter syntax
const languages = await api.getLanguages();
const results = await api.searchLexemes({ ismatch: 0, search: "ma", src_lang: "en" });
const details = await api.getLexemeDetails({ id: "L3625", lang_1: "de", lang_2: "fr", src_lang: "en" });
```

### Using the React Hook

```typescript
import { useApi } from '@/hooks/useApi';

function MyComponent() {
  const {
    languages,
    languagesLoading,
    languagesError,
    getLanguages,
    searchResults,
    searchLoading,
    searchError,
    searchLexemes,
    lexemeDetails,
    detailsLoading,
    detailsError,
    getLexemeDetails,
  } = useApi();

  useEffect(() => {
    getLanguages();
  }, [getLanguages]);

  const handleSearch = () => {
    searchLexemes({
      ismatch: 0,
      search: "ma",
      src_lang: "en"
    });
  };

  return (
    <div>
      {languagesLoading && <p>Loading...</p>}
      {languagesError && <p>Error: {languagesError.message}</p>}
      {languages && (
        <div>
          {languages.map(lang => (
            <div key={lang.lang_code}>{lang.lang_label}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Using Zustand Stores (Recommended)

```typescript
import { useApiWithStore } from '@/hooks/useApiWithStore';

function MyComponent() {
  const {
    // Language store
    languages,
    selectedSourceLanguage,
    selectedTargetLanguage1,
    selectedTargetLanguage2,
    languageLoading,
    languageError,
    getLanguages,
    setSelectedSourceLanguage,
    
    // Lexeme store
    lexemes,
    query,
    selectedLexeme,
    lexemeLoading,
    lexemeError,
    searchLexemes,
    getLexemeDetails,
    setQuery,
  } = useApiWithStore();

  useEffect(() => {
    getLanguages();
  }, [getLanguages]);

  const handleSearch = () => {
    if (!selectedSourceLanguage) return;
    
    searchLexemes({
      ismatch: 0,
      search: query,
      src_lang: selectedSourceLanguage.lang_code,
    });
  };

  return (
    <div>
      {/* Your UI components using the store state */}
    </div>
  );
}
```

### Direct Store Usage

```typescript
import { useLanguageStore, useLexemeStore } from '@/lib/stores';

function MyComponent() {
  const languageStore = useLanguageStore();
  const lexemeStore = useLexemeStore();

  // Access state
  const { languages, selectedSourceLanguage } = languageStore;
  const { lexemes, query } = lexemeStore;

  // Update state
  languageStore.setSelectedSourceLanguage(someLanguage);
  lexemeStore.setQuery("new query");

  return (
    <div>
      {/* Your UI components */}
    </div>
  );
}
```

## Zustand Stores

### Language Store (`useLanguageStore`)

Manages language-related state:

```typescript
interface LanguageState {
  languages: Language[];
  selectedSourceLanguage: Language | null;
  selectedTargetLanguage1: Language | null;
  selectedTargetLanguage2: Language | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setLanguages: (languages: Language[]) => void;
  setSelectedSourceLanguage: (language: Language | null) => void;
  setSelectedTargetLanguage1: (language: Language | null) => void;
  setSelectedTargetLanguage2: (language: Language | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
```

### Lexeme Store (`useLexemeStore`)

Manages lexeme-related state:

```typescript
interface LexemeState {
  lexemes: LexemeSearchResult[];
  query: string;
  selectedLexeme: LexemeDetailResult | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setLexemes: (lexemes: LexemeSearchResult[]) => void;
  setQuery: (query: string) => void;
  setSelectedLexeme: (lexeme: LexemeDetailResult | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
```

## API Endpoints

### 1. GET /languages
Returns a list of available languages.

**Response:**
```typescript
interface Language {
  lang_code: string;
  lang_label: string;
  lang_wd_id?: string;
}
```

### 2. POST /lexemes
Search for lexemes in a base language.

**Request:**
```typescript
interface LexemeSearchRequest {
  ismatch: number;
  search: string;
  src_lang: string;
}
```

**Response:**
```typescript
interface LexemeSearchResult {
  id: string;
  label: string;
  language: string;
  description: string;
}
```

### 3. POST /lexemes/{id}
Get detailed lexeme information with glosses in multiple languages.

**Request:**
```typescript
interface LexemeDetailRequest {
  id: string;
  lang_1: string;
  lang_2: string;
  src_lang: string;
}
```

**Response:**
```typescript
interface LexemeDetailResult {
  lexeme: {
    id: string;
    lexicalCategoryId: string;
    lexicalCategoryLabel: string;
    image?: string;
  };
  glosses: Array<{
    gloss: {
      language: string;
      value: string;
      audio?: string;
      formId: string;
    };
    senseId: string;
  }>;
}
```

## Error Handling

All API methods throw `ApiError` objects with the following structure:

```typescript
interface ApiError {
  message: string;
  status?: number;
}
```

The API client includes automatic error handling and response interceptors to provide consistent error messages.

## Example Components

- `components/api-example.tsx` - Basic API usage example
- `components/zustand-example.tsx` - Complete Zustand store integration example with full UI

## Benefits of Using Zustand Stores

1. **Global State Management**: State persists across component unmounts
2. **Automatic Updates**: Components automatically re-render when store state changes
3. **Type Safety**: Full TypeScript support for all state and actions
4. **Performance**: Only components that use specific store slices re-render
5. **Developer Experience**: Easy debugging with store state inspection
6. **Separation of Concerns**: API logic separated from UI state management 