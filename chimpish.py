#!/usr/bin/env python3
"""
Chimpish Cipher Encoder & Decoder

Maps A–Z (case-insensitive) to “chimpish” symbols, separates letters with spaces,
words with full stops, and can encode or decode messages.
"""

import string

# Define the symbol list in order A→Z
symbols = [
    '-',  '/',  '/-',  ':',  ':-',  ':/',  ':/-',    # A–G
    ';',  ';-', ';/', ';/-',                       # H–K
    ';:', ';:-', ';:/', ';:/-',                    # L–O
    '(',  '(-', '(/', '(/-',                        # P–S
    '(:', '(:-', '(:/', '(:/-',                     # T–W
    '(;', '(;-', '(;/'                              # X–Z
]

# Build mappings
ENCODE_MAP = dict(zip(string.ascii_uppercase, symbols))
DECODE_MAP = {sym: letter for letter, sym in ENCODE_MAP.items()}


def encode(message: str) -> str:
    """
    Encode a message using the chimpish cipher.
    - Letters are case-insensitive; only A–Z and spaces allowed (others raise KeyError).
    - Words in the input (separated by spaces) become symbol-blocks separated by periods.
    - Returns a string of symbols separated by spaces, with '.' tokens between words.
    """
    tokens = []
    for word in message.upper().split():
        for ch in word:
            tokens.append(ENCODE_MAP[ch])
        tokens.append('.')  # word separator
    if tokens and tokens[-1] == '.':
        tokens.pop()
    return ' '.join(tokens)


def decode(encoded: str) -> str:
    """
    Decode a chimpish-encoded string back to plain text.
    - Assumes letters are symbol sequences separated by spaces, words by '.' tokens.
    - Returns an uppercase string of A–Z and spaces.
    - Raises KeyError if an unknown symbol is encountered.
    """
    decoded_chars = []
    for token in encoded.strip().split():
        if token == '.':
            decoded_chars.append(' ')
        else:
            decoded_chars.append(DECODE_MAP[token])
    # collapse any multiple spaces (in case of accidental '..')
    return ''.join(decoded_chars).replace('  ', ' ')


def main():
    choice = input("Encode or decode? [e/d]: ").strip().lower()
    if choice not in ('e', 'd'):
        print("Please enter 'e' to encode or 'd' to decode.")
        return

    text = input("Enter your text: ").strip()
    try:
        if choice == 'e':
            result = encode(text)
            print("\nEncoded chimpish:")
        else:
            result = decode(text)
            print("\nDecoded plain text:")
        print(result)
    except KeyError as e:
        print(f"Error: Unsupported token {e.args[0]!r}. "
              "Make sure your input uses only A–Z (for encoding) or valid chimpish symbols & '.' (for decoding).")


if __name__ == "__main__":
    main()
