"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { X } from "lucide-react"

interface WikimediaCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: WikimediaCategoryData) => void
}

export interface WikimediaCategoryData {
  source: string
  project: string
  categoryName: string
  numberOfWords: number
  excludeRecorded: boolean
}

const sourceOptions = [
  { value: "en", label: "en" },
  { value: "es", label: "es" },
  { value: "fr", label: "fr" },
  { value: "de", label: "de" },
  { value: "it", label: "it" },
]

const projectOptions = [
  { value: "wikipedia", label: "Wikipedia" },
  { value: "wiktionary", label: "Wiktionary" },
  { value: "wikisource", label: "Wikisource" },
  { value: "wikibooks", label: "Wikibooks" },
]

export function WikimediaCategoryModal({ isOpen, onClose, onSave }: WikimediaCategoryModalProps) {
  const [formData, setFormData] = useState<WikimediaCategoryData>({
    source: "",
    project: "",
    categoryName: "",
    numberOfWords: 25,
    excludeRecorded: false,
  })

  const handleSave = () => {
    if (formData.source && formData.project && formData.categoryName) {
      onSave(formData)
      onClose()
      // Reset form
      setFormData({
        source: "",
        project: "",
        categoryName: "",
        numberOfWords: 25,
        excludeRecorded: false,
      })
    }
  }

  const handleCancel = () => {
    onClose()
    // Reset form
    setFormData({
      source: "",
      project: "",
      categoryName: "",
      numberOfWords: 25,
      excludeRecorded: false,
    })
  }

  const isFormValid = formData.source && formData.project && formData.categoryName

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        {/* Custom header with close button */}
        <div className="flex items-center justify-between p-6 pb-4">
          <DialogTitle className="text-2xl font-semibold">Wikimedia Category</DialogTitle>
          {/* <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button> */}
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* Source Section */}
          <div className="space-y-4">
            <Label className="text-lg font-medium">Source</Label>
            <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Choose an option" />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={formData.project} onValueChange={(value) => setFormData({ ...formData, project: value })}>
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Choose an option" />
              </SelectTrigger>
              <SelectContent>
                {projectOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Name */}
          <div className="space-y-3">
            <Label htmlFor="categoryName" className="text-lg font-medium">
              Category name
            </Label>
            <Input
              id="categoryName"
              value={formData.categoryName}
              onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
              placeholder="Category:Engineering"
              className="h-12 text-base border-2 border-blue-500 focus:border-blue-600"
            />
          </div>

          {/* Number of Words */}
          <div className="space-y-3">
            <Label htmlFor="numberOfWords" className="text-lg font-medium">
              Number of words to get?
            </Label>
            <Input
              id="numberOfWords"
              type="number"
              value={formData.numberOfWords}
              onChange={(e) => setFormData({ ...formData, numberOfWords: Number.parseInt(e.target.value) || 0 })}
              className="h-12 text-base"
              min="1"
              max="1000"
            />
          </div>

          {/* Exclude Toggle */}
          <div className="flex items-center justify-between py-2">
            <Label htmlFor="excludeRecorded" className="text-lg font-medium">
              Exclude words you have already recorded
            </Label>
            <Switch
              id="excludeRecorded"
              checked={formData.excludeRecorded}
              onCheckedChange={(checked) => setFormData({ ...formData, excludeRecorded: checked })}
              className="scale-125"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleCancel} className="px-8 py-2 h-11 text-base">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!isFormValid} className="px-8 py-2 h-11 text-base">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
