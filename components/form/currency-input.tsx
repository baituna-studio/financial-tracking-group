"use client"

import { useEffect, useId, useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type CurrencyInputProps = {
  name: string
  id?: string
  defaultValue?: number | string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  inputClassName?: string
}

function countOccurrences(s: string, ch: string) {
  return (s.match(new RegExp(`\\${ch}`, "g")) || []).length
}

// Putuskan apakah ada desimal dan pemisah mana yang dipakai.
// Aturan:
// - Jika ada '.' dan ',', yang terakhir muncul adalah kandidat desimal.
// - Jika hanya ada salah satu:
//   - Jika digit setelah pemisah <= 2 DAN hanya 1 kemunculan -> desimal.
//   - Selain itu -> pemisah ribuan (abaikan sebagai grouping).
function detectDecimalSeparator(s: string): "." | "," | null {
  const lastDot = s.lastIndexOf(".")
  const lastComma = s.lastIndexOf(",")
  const hasDot = lastDot !== -1
  const hasComma = lastComma !== -1

  if (hasDot && hasComma) {
    // Kandidat desimal adalah yang terakhir
    return lastDot > lastComma ? "." : ","
  }

  if (hasDot || hasComma) {
    const sep = hasDot ? "." : ","
    const lastIdx = s.lastIndexOf(sep)
    const digitsAfter = s.slice(lastIdx + 1).replace(/[^\d]/g, "").length
    const occ = countOccurrences(s, sep)
    if (digitsAfter <= 2 && occ === 1) return sep
  }

  return null
}

// Normalisasi string input ke bentuk numerik: "1234.56" (titik sebagai desimal), tanpa pemisah ribuan.
function normalizeToNumberString(input: string): string {
  const cleaned = input.replace(/[^\d.,]/g, "")
  if (!cleaned) return ""

  const decimalSep = detectDecimalSeparator(cleaned)

  if (decimalSep) {
    const lastIdx = cleaned.lastIndexOf(decimalSep)
    const intRaw = cleaned.slice(0, lastIdx).replace(/[^\d]/g, "")
    let fracRaw = cleaned.slice(lastIdx + 1).replace(/[^\d]/g, "")
    if (fracRaw.length > 2) fracRaw = fracRaw.slice(0, 2) // batasi 2 desimal
    const intPart = intRaw.replace(/^0+(?=\d)/, "") || "0"
    return fracRaw.length > 0 ? `${intPart}.${fracRaw}` : intPart
  }

  // Tidak ada desimal -> semua pemisah dianggap grouping, hapus
  const allDigits = cleaned.replace(/[^\d]/g, "")
  // Biarkan "0" jika memang nol, tapi kosong jika user menghapus semua
  if (allDigits === "") return ""
  return allDigits.replace(/^0+(?=\d)/, "") || "0"
}

// Format tampilan Indonesia: ribuan pakai titik, desimal pakai koma
function formatDisplayIDR(numericString: string): string {
  if (!numericString) return ""
  const [intPartRaw, fracRaw] = numericString.split(".")
  const intNumber = Number(intPartRaw || "0")
  const formattedInt = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Number.isFinite(intNumber) ? intNumber : 0)
  return fracRaw && fracRaw.length > 0 ? `${formattedInt},${fracRaw}` : formattedInt
}

export function CurrencyInput({
  name,
  id,
  defaultValue,
  placeholder = "1.000.000",
  required,
  disabled,
  className,
  inputClassName,
}: CurrencyInputProps) {
  const autoId = useId()
  const inputId = id || `${autoId}-${name}`
  const [hiddenValue, setHiddenValue] = useState<string>("")
  const [display, setDisplay] = useState<string>("")

  // Inisialisasi dari defaultValue
  useEffect(() => {
    if (defaultValue === undefined || defaultValue === null || defaultValue === "") {
      setHiddenValue("")
      setDisplay("")
      return
    }
    const raw =
      typeof defaultValue === "number" ? String(defaultValue) : String(defaultValue)
    const normalized = normalizeToNumberString(raw)
    setHiddenValue(normalized)
    setDisplay(formatDisplayIDR(normalized))
  }, [defaultValue])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    const normalized = normalizeToNumberString(next)
    setHiddenValue(normalized)
    setDisplay(formatDisplayIDR(normalized))
  }

  return (
    <div className={cn("relative", className)}>
      {/* Visible formatted input */}
      <Input
        id={inputId}
        type="text"
        inputMode="decimal"
        name={`${name}__display`}
        placeholder={placeholder}
        value={display}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={inputClassName}
        aria-describedby={`${inputId}-hint`}
      />
      {/* Hidden numeric input for FormData (titik sebagai desimal) */}
      <input type="hidden" name={name} value={hiddenValue} />
    </div>
  )
}
