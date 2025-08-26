// API Response Types

export interface Language {
  lang_code: string;
  lang_label: string;
  lang_wd_id?: string;
}

export interface LexemeSearchRequest {
  ismatch: number;
  search: string;
  src_lang: string;
}

export interface LexemeSearchResult {
  id: string;
  label: string;
  language: string;
  description: string;
}

export interface LexemeDetailRequest {
  id: string;
  lang_1: string;
  lang_2: string;
  src_lang: string;
}

export interface Gloss {
  language: string;
  value: string;
  audio?: string;
  formId: string;
  categoryid?: string;
  categoryLabel?: string
}

export interface GlossWithSense {
  gloss: Gloss;
  senseId: string;
}

export interface LexemeTranslation {
  base_lexeme: string;
  lexeme_id: string | null;
  trans_sense_id: string | null;
  trans_language: string;
  value: string | null;
}

export interface LexemeDetail {
  id: string;
  lexicalCategoryId: string;
  lexicalCategoryLabel: string;
  image?: string;
}

export interface LexemeDetailResult {
  lexeme: LexemeDetail;
  glosses: GlossWithSense[];
}

// API Error Response
export interface ApiError {
  message: string;
  status?: number;
}

export interface AddLabeledTranslationRequest {
  lexeme_id: string;
  lexeme_sense_id: string;
  translation_language: string;
  translation_value: string;
  is_new: boolean;
  categoryId: string;
}

export interface AddAudioTranslationRequest {
  file_content: string;
  filename: string;
  formid: string;
  lang_label: string;
  lang_wdqid: string;
}[]

export interface LoginResponse {
  redirect_string: string;
  request_token: string;
}

export interface OauthCallbackResponse {
  token: string;
  username: string;
  pref_langs: string;
}

export interface OauthCallbackRequest {
  request_token: string;
  query_string: string;
}

export interface LexemeMissingAudioResponse {
  lexeme_id: string,
  sense_id: string,
  lemma: string,
  categoryId: string,
  categoryLabel: string,
  formId: string
}

export interface LexemeMissingAudioResquest {
  lang_code: string,
  lang_wdqid: string,
  page: number | 1,
  page_size: number | 15
}