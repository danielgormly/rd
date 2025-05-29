## JSContact: JSON representation of contact data

https://www.rfc-editor.org/rfc/rfc9553.html

## 1. Introduction
- JSContact is not a strict subset nor superset of VCard - however they are similar.

## 1.4 Data types
- id
- int/unsigned int
- patch object (partial JSON)
- Resource (reference to blob/url)
- UTCDateTime

## 1.5 Common properties
- context e.g. home, work on phone numbers
- label: small specific labels
- pref: pref order, for sort hints between 2 phone numbers for example
- phonetic: hints on how to pronounce something

## 1.6 Vendor specific properties
- use: v-extension, v-prefix
- vendor specific values for normal keys: e.g. `{ "kind": "example.com:baz" }`

## 1.9 Versioning
- The spec version, not the card version

## 2.0 The Card object

A flat object like so:

```json
{
  "@type": "Card",
  "version": "1.0",
  "uid": "22B2C7DF-9120-4969-8460-05956FE6B065",
  "kind": "individual",
  "name": {
    "components": [
      { "kind": "given", "value": "John" },
      { "kind": "surname", "value": "Doe" }
    ],
    "isOrdered": true
  }
}

```

- the rest of the spec is mostly about individual properties
