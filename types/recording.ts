import type { Language } from '@/lib/types/api'

export interface RecordingData {
  lexeme_id: string
  formId: string
  lemma: string
  audioBlob?: Blob
  file_content?: string
  filename?: string
  isRecorded: boolean
  duration?: number
  lang_label: string
  lang_wdqid: string
  lang_code: string
  categoryId: string
  categoryLabel: string
  sense_id: string
  hasAudio: boolean
}

export interface WordListItem {
  lexeme_id: string
  formId: string
  lemma: string
  audioBlob?: Blob
  hasAudio: boolean
  categoryId: string
  categoryLabel: string
  sense_id: string
  lang_code: string
  lang_label: string
  lang_wdqid: string
}

export interface LanguageData extends Language {
  lang_code: string
  lang_label: string
  lang_wd_id?: string
}
