import { CleanText } from "./cleanText"
import { lcs_myers } from "@algorithm.ts/lcs"

class DedupService {
  private cleanText: CleanText

  constructor() {
    this.cleanText = new CleanText()
  }

  dedup(pastTranscription: string, combinedTranscription: string): string {
    const pastCleaned = this.cleanText.clean(pastTranscription).split(' ')
    const combinedCleaned = this.cleanText.clean(combinedTranscription).split(' ')

    const pairs = lcs_myers(pastCleaned.length, combinedCleaned.length, (i, j) => {
      return pastCleaned[i] === combinedCleaned[j]
    })

    // 2 strings are completely different
    if (pairs.length === 0) {
      return combinedCleaned.join(' ')
    }

    const startNewIdx = pairs[pairs.length - 1][1] + 1

    // 2 strings are the same
    if (startNewIdx >= combinedCleaned.length) {
      return ''
    }

    return combinedCleaned.slice(startNewIdx).join(' ')
  }
}

export { DedupService }