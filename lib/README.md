# API Helper Documentation

This directory contains the API helper implementation for interacting with the lexeme API.

## Files

- `api.ts` - Main API client using axios
- `types/api.ts` - TypeScript type definitions
- `hooks/useApi.ts` - React hook for easy API usage
- `components/api-example.tsx` - Example component demonstrating usage

## Setup

1. The API base URL is configured in `.env.local`:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000/api
   ```

2. Install dependencies:
   ```bash
   npm install axios
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

## Example Component

See `components/api-example.tsx` for a complete example of how to use the API helper in a React component with loading states, error handling, and user interactions. 