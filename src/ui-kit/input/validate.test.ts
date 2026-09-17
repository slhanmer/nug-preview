import { DEFAULT_MESSAGES, sanitiseText, validateValue } from './validate'

describe('validateValue', () => {
  describe('emptiness', () => {
    it('passes an empty optional field', () => {
      expect(validateValue('text', '')).toBeNull()
      expect(validateValue('email', '   ')).toBeNull()
    })

    it('fails an empty required field', () => {
      expect(validateValue('text', '', { required: true })).toBe(DEFAULT_MESSAGES.required)
    })

    it('does not run type rules on an empty optional field', () => {
      // Nothing typed is not the same as something wrong.
      expect(validateValue('email', '')).toBeNull()
    })
  })

  describe('length', () => {
    it('applies minLength and maxLength before the type rule', () => {
      expect(validateValue('email', 'a@b.io', { minLength: 20 })).toBe(DEFAULT_MESSAGES.tooShort(20))
      expect(validateValue('text', 'abcdef', { maxLength: 3 })).toBe(DEFAULT_MESSAGES.tooLong(3))
    })

    it('measures the trimmed value', () => {
      expect(validateValue('text', '  ab  ', { minLength: 3 })).toBe(DEFAULT_MESSAGES.tooShort(3))
    })
  })

  describe('email', () => {
    it.each(['simon@example.com', 'simon+barber@example.com', "o'neill@example.co.uk", 'a@b.io'])(
      'accepts %s',
      (value) => expect(validateValue('email', value)).toBeNull(),
    )

    it.each(['simon', 'simon@example', 'simon example.com', 'simon@ example.com', 'a@b.c'])(
      'rejects %s',
      (value) => expect(validateValue('email', value)).toBe(DEFAULT_MESSAGES.email),
    )
  })

  describe('tel', () => {
    it.each(['0412 345 678', '0412345678', '07 3000 0000', '(07) 3000-0000', '+61412345678'])(
      'accepts %s in AU',
      (value) => expect(validateValue('tel', value, { region: 'AU' })).toBeNull(),
    )

    it.each(['call me after 6', '12345', '0412 345 67', '+1 555 0100'])(
      'rejects %s in AU',
      (value) => expect(validateValue('tel', value, { region: 'AU' })).toBe(DEFAULT_MESSAGES.tel),
    )

    it('takes a wider view without a region', () => {
      expect(validateValue('tel', '+1 555 010 0100')).toBeNull()
      expect(validateValue('tel', '12345')).toBe(DEFAULT_MESSAGES.tel)
    })
  })

  describe('url', () => {
    it('accepts http and https', () => {
      expect(validateValue('url', 'https://example.com/a?b=c')).toBeNull()
      expect(validateValue('url', 'http://example.com')).toBeNull()
    })

    it('rejects other schemes and non-urls', () => {
      // A parseable URL is not necessarily one worth linking to.
      expect(validateValue('url', 'javascript:alert(1)')).toBe(DEFAULT_MESSAGES.url)
      expect(validateValue('url', 'example.com')).toBe(DEFAULT_MESSAGES.url)
    })
  })

  describe('number', () => {
    it('rejects what is not a number', () => {
      expect(validateValue('number', 'twelve')).toBe(DEFAULT_MESSAGES.number)
    })

    it('applies min and max', () => {
      expect(validateValue('number', '3', { min: 5 })).toBe(DEFAULT_MESSAGES.tooSmall(5))
      expect(validateValue('number', '9', { max: 5 })).toBe(DEFAULT_MESSAGES.tooLarge(5))
      expect(validateValue('number', '5', { min: 5, max: 5 })).toBeNull()
    })

    it('accepts negatives and decimals', () => {
      expect(validateValue('number', '-2.5')).toBeNull()
    })
  })

  describe('password', () => {
    it('defaults to a twelve-character minimum', () => {
      expect(validateValue('password', 'short')).toBe(DEFAULT_MESSAGES.passwordShort(12))
      expect(validateValue('password', 'twelvechars!')).toBeNull()
    })

    it('reports one missing class at a time', () => {
      const options = {
        passwordMinLen: 8,
        requireUpper: true,
        requireNumber: true,
        requireSpecial: true,
      }
      expect(validateValue('password', 'lowercaseonly', options)).toBe(
        DEFAULT_MESSAGES.passwordUpper,
      )
      expect(validateValue('password', 'Lowercaseonly', options)).toBe(
        DEFAULT_MESSAGES.passwordNumber,
      )
      expect(validateValue('password', 'Lowercase1', options)).toBe(DEFAULT_MESSAGES.passwordSpecial)
      expect(validateValue('password', 'Lowercase1!', options)).toBeNull()
    })

    it('measures the raw value, not the trimmed one', () => {
      // A trailing space is a character someone chose. Trimming it here would
      // accept a password the server then hashes differently.
      expect(validateValue('password', 'elevenchar ', { passwordMinLen: 11 })).toBeNull()
    })
  })

  describe('messages', () => {
    it('takes an override per key and leaves the rest alone', () => {
      const messages = { required: 'Tell us who you are.' }
      expect(validateValue('text', '', { required: true, messages })).toBe('Tell us who you are.')
      expect(validateValue('text', 'abc', { maxLength: 2, messages })).toBe(
        DEFAULT_MESSAGES.tooLong(2),
      )
    })
  })
})

describe('sanitiseText', () => {
  it('collapses whitespace and trims', () => {
    expect(sanitiseText('  a   b  ')).toBe('a b')
  })

  it('flattens newlines unless they are allowed', () => {
    expect(sanitiseText('a\nb')).toBe('a b')
    expect(sanitiseText('a\r\nb', { allowNewlines: true })).toBe('a\nb')
  })

  it('keeps paragraphs but not gaps', () => {
    expect(sanitiseText('a\n\n\n\nb', { allowNewlines: true })).toBe('a\n\nb')
  })

  it('strips control characters and zero-width joiners', () => {
    expect(sanitiseText('a\u0000\u200Bb')).toBe('ab')
  })

  it('normalises to NFC, so a composed and a decomposed \u00e9 compare equal', () => {
    expect(sanitiseText('e\u0301')).toBe('\u00e9')
  })

  it('caps length last, after collapsing', () => {
    expect(sanitiseText('a     bcdef', { maxLength: 3 })).toBe('a b')
  })
})
