# Notes on JMAP, specifically JMAP cal & contacts

JSON Meta Application Protocol

- Core protocol https://jmap.io/spec-core.html
- Sharing https://jmap.io/spec-sharing.html
- Quotas https://www.rfc-editor.org/rfc/rfc9425.html
- Calendars https://jmap.io/spec-calendars.html
- Websocket protocol https://www.rfc-editor.org/rfc/rfc8887.html
- Contacts https://jmap.io/spec-contacts.html

## 1.1 Type information & attributes
- `server-set`, `immutable` and `default` attributes to be adhered to

## 1.2 `Id` data type
- record ids are immutable
- a `String` with maximum size of 255 octets, url & filename safe base64 alphabet (excluding `=`).
- TODO: Some sequences should be avoided (see spec and confirm they do not break recommendations)
- TODO: should id be truly GLOBALLY unique (seems absurd), or do we prefix a unique user identifier when sharing?
- TODO: so what are the best solutions here besides UUID?

## 1.3 `Int` and `UnsignedInt Data Types`
- Integer in the range of -2^52+1<=value<=2^53-1, the safe range of integers stored in a floating-point double (JSON `Number`)
- TODO: FP Double type? Rust?
- `UnsignedInt` = `Int`, same as above but at least 0

## `Date`, `UTCDate`
- date-time format (https://datatracker.ietf.org/doc/rfc3339/)
- Please see notes on normalisation
- UTCDate = Date where the time-offset component MUST be Z

## 1.5 JSON
- Internet JSON (I-JSON) is a strict subset of JSON, must be valid I-JSON (https://datatracker.ietf.org/doc/html/rfc7493)

## 1.6 Terms
- User: Someone accessing JMAP via their set of permissions
- Accounts: A collection of data, multiple data types (mail, contacts, calendars), accountId is mandatory in most API calls.
- Account != User, though primary accounts are common. Single set of credentials may provide access to multiple accounts (sharing, group mailbox). Data that violates JMAP data constraints (e.g. from a server error) may have to reissue account id and clients refetch all data from scratch.
- Data types: Collection of named, typed properties
- Record: Instance of a data typed
- id of a record is immutable, server-assigned

## 1.7 JMAP API Model
- Authenticated user fetches `Session` object with server capabilities & data.
- Method calls can be batched. Binary files use separate endpoint.

## 1.8 Vendor-Specific Extensions
Extra data types can be added to capabilities object identified by vendor-owned domain.

# 2. The JMAP Session Resource
- URL for the JMAP Session resource = first point of contact
- Credentials required for the JMAP Session endpoint = HTTP authorisation (TODO: Add relevant spec)
- See lib.rs for scaffolding of these resources

## 2.2 Service autodiscovery
- DNS SRV record _jmap.tcp.example.com that gives hostname and port i.e. air.day 443
- DNS_SRV or a .well-known/jmap sesion should provide access to JMAP Session resource

## 3. Structured Data exchange

## 3.1 Making an API request
- POST request to the API resource (defined in session.apiUrl)
- application/json encoded

## 3.5 Ommitting arguments
- Ommitted fields with default values will be treated as though they have the default value (whose default is `null`)

## 3.6 Errors
Errors look like this: `urn:ietf:params:jmap:error:unknownCapability`


## Req/response
These are batched calls by default. Request level errors are well-defined. Method level errors may result in partial or complete failure with each documented. In subsequent methods on the same request, arguments can be referenced from results of the previous using an octothorpe (#). Re. concurrency, methods in a single call must be performed in succession, however, methods across calls may be interleaved.

## Language
In the HTTP headers we may have Accept-Language: fr-CH, fr;q=0.9, de;q=0.8, en;q=0.7, *;q=0.5. This is to be respected when sending error messages back etc.
