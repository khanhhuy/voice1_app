interface CleanTextOptions {
  normalizeCase?: boolean
  normalizePunctuation?: boolean
  normalizeNumbers?: boolean
  expandContractions?: boolean
  fixCommonErrors?: boolean
  normalizeWhitespace?: boolean
}

export class CleanText {
  private options: Required<CleanTextOptions>

  constructor(options: CleanTextOptions = {}) {
    this.options = {
      normalizeCase: true,
      normalizePunctuation: true,
      normalizeNumbers: true,
      expandContractions: true,
      fixCommonErrors: true,
      normalizeWhitespace: true,
      ...options
    }
  }

  clean(text: string): string {
    let cleaned = text

    if (this.options.normalizeCase) {
      cleaned = this.normalizeCase(cleaned)
    }

    if (this.options.normalizePunctuation) {
      cleaned = this.normalizePunctuation(cleaned)
    }

    if (this.options.normalizeNumbers) {
      cleaned = this.normalizeNumbers(cleaned)
    }

    if (this.options.expandContractions) {
      cleaned = this.expandContractions(cleaned)
    }

    if (this.options.fixCommonErrors) {
      cleaned = this.fixCommonErrors(cleaned)
    }

    if (this.options.normalizeWhitespace) {
      cleaned = this.normalizeWhitespace(cleaned)
    }

    return cleaned
  }

  private normalizeCase(text: string): string {
    return text.toLowerCase()
  }

  private normalizePunctuation(text: string): string {
    return text
      .replace(/[\u2018\u2019]/g, "'") // Curly quotes to straight quotes
      .replace(/[\u201C\u201D]/g, '"') // Curly double quotes to straight
      .replace(/[!?;:,.]/g, ' ') // Replace punctuation with spaces for word separation
      .replace(/'s\b/g, ' ') // Remove possessive 's
      .replace(/[\-\–\—]/g, ' ') // Replace dashes with spaces
  }

  private normalizeNumbers(text: string): string {
    return text
      .replace(/\b(?:zero)\b/gi, '0')
      .replace(/\b(?:one)\b/gi, '1')
      .replace(/\b(?:two)\b/gi, '2')
      .replace(/\b(?:three)\b/gi, '3')
      .replace(/\b(?:four)\b/gi, '4')
      .replace(/\b(?:five)\b/gi, '5')
      .replace(/\b(?:six)\b/gi, '6')
      .replace(/\b(?:seven)\b/gi, '7')
      .replace(/\b(?:eight)\b/gi, '8')
      .replace(/\b(?:nine)\b/gi, '9')
  }

  private expandContractions(text: string): string {
    const contractions: Record<string, string> = {
      "don't": "do not",
      "doesn't": "does not",
      "didn't": "did not",
      "won't": "will not",
      "can't": "cannot",
      "couldn't": "could not",
      "shouldn't": "should not",
      "wouldn't": "would not",
      "isn't": "is not",
      "aren't": "are not",
      "wasn't": "was not",
      "weren't": "were not",
      "haven't": "have not",
      "hasn't": "has not",
      "hadn't": "had not",
      "i'm": "i am",
      "you're": "you are",
      "he's": "he is",
      "she's": "she is",
      "it's": "it is",
      "we're": "we are",
      "they're": "they are",
      "i've": "i have",
      "you've": "you have",
      "we've": "we have",
      "they've": "they have",
      "i'd": "i would",
      "you'd": "you would",
      "he'd": "he would",
      "she'd": "she would",
      "we'd": "we would",
      "they'd": "they would",
      "i'll": "i will",
      "you'll": "you will",
      "he'll": "he will",
      "she'll": "she will",
      "we'll": "we will",
      "they'll": "they will"
    }

    let result = text
    for (const [contraction, expansion] of Object.entries(contractions)) {
      const regex = new RegExp(`\\b${contraction}\\b`, 'gi')
      result = result.replace(regex, expansion)
    }
    return result
  }

  private fixCommonErrors(text: string): string {
    return text
      .replace(/\b(?:their|there|they're)\b/gi, 'their') // Normalize homophones
      .replace(/\b(?:your|you're)\b/gi, 'your')
      .replace(/\b(?:its|it's)\b/gi, 'its')
      .replace(/\b(?:then|than)\b/gi, 'then')
      .replace(/\b(?:affect|effect)\b/gi, 'affect')
      .replace(/\ba\s+(?=[aeiou])/gi, 'an ') // Fix a/an usage
      .replace(/\ban\s+(?=[^aeiou])/gi, 'a ')
  }

  private normalizeWhitespace(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim() // Remove leading/trailing spaces
  }
}