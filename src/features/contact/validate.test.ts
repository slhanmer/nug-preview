import { EMPTY_VALUES, hasErrors, LIMITS, MIN_MESSAGE, readValues, validate } from './validate'

const good = {
  name: 'Simon Hanmer',
  email: 'simon@example.com',
  phone: '',
  message: 'I need a haircut before Friday, is there anything left this week?',
}

describe('validate', () => {
  it('passes a filled-in form', () => {
    expect(validate(good)).toEqual({})
    expect(hasErrors(validate(good))).toBe(false)
  })

  it('requires a name, an address and a message', () => {
    const errors = validate(EMPTY_VALUES)
    expect(errors.name).toBeDefined()
    expect(errors.email).toBeDefined()
    expect(errors.message).toBeDefined()
  })

  it('does not require a phone number', () => {
    expect(validate(EMPTY_VALUES).phone).toBeUndefined()
  })

  /*
   * The point of the rules living in RULES rather than in this file: the same
   * objects are handed to <Input> on the client. If these strings ever come
   * back as the kit's neutral defaults, the wiring has been broken.
   */
  it('speaks in the site’s voice, not the kit’s', () => {
    const errors = validate(EMPTY_VALUES)
    expect(errors.name).toBe('Tell us who you are.')
    expect(errors.email).toBe('We need an address to reply to.')
    expect(errors.message).toBe('Let us know what you need.')
  })

  it.each(['simon', 'simon@example', 'simon example.com'])('rejects %s as an address', (email) => {
    expect(validate({ ...good, email })).toHaveProperty('email')
  })

  it.each(['0412 345 678', '07 3000 0000', '+61412345678'])('accepts %s as a phone', (phone) => {
    expect(validate({ ...good, phone }).phone).toBeUndefined()
  })

  it('rejects a phone field being used as a note', () => {
    expect(validate({ ...good, phone: 'call me after 6' }).phone).toBeDefined()
  })

  it('rejects a message too short to act on', () => {
    expect(validate({ ...good, message: 'x'.repeat(MIN_MESSAGE - 1) }).message).toBe(
      'A little more detail, please.',
    )
    expect(validate({ ...good, message: 'x'.repeat(MIN_MESSAGE) }).message).toBeUndefined()
  })

  it.each(['name', 'phone', 'message'] as const)('caps %s', (key) => {
    expect(validate({ ...good, [key]: 'a'.repeat(LIMITS[key] + 1) })[key]).toBeDefined()
  })

  it('caps email, even when the address is otherwise well formed', () => {
    expect(validate({ ...good, email: `${'a'.repeat(LIMITS.email)}@example.com` }).email).toBeDefined()
  })
})

describe('readValues', () => {
  it('trims, and treats a missing field as empty', () => {
    const form = new FormData()
    form.set('name', '  Simon  ')
    expect(readValues(form)).toEqual({ ...EMPTY_VALUES, name: 'Simon' })
  })

  it('ignores a field that arrives as a file rather than text', () => {
    const form = new FormData()
    form.set('message', new File(['x'], 'x.txt'))
    expect(readValues(form).message).toBe('')
  })
})
