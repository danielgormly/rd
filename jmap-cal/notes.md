# Notes on JMAP, specifically JMAP cal & contacts

- Core protocol https://jmap.io/spec-core.html
- Websocket protocol https://www.rfc-editor.org/rfc/rfc8887.html
- Sharing https://jmap.io/spec-sharing.html
- Quotas https://www.rfc-editor.org/rfc/rfc9425.html
- Calendars https://jmap.io/spec-calendars.html
- Contacts https://jmap.io/spec-contacts.html

## Core
- Ensure I-JSON compatibility
- id:
- Date data type is a specific serialised form
- Authentication is based on standard HTTP auth schemes https://www.iana.org/assignments/http-authschemes/
- Multiple accounts! Accounts are collections of data (contacts, events etc), and a single user can access multiple accounts.
- Server can advertise extensions in the capabilities object

## JMAP Session Resource
This is the first point of contact, it contains an `urn:ietf:params:jmap:core` object that contains file size/object qty limitations, accounts, the user's primary account, username, urls, state.

For Airday, I could structure it like
- user: daniel@air.day
-- primaryaccount: airday:uuid:primary
-- calendar-2: airday:uuid:calendar-2
-- calendar-3: airday:uuid:calendar-3

or

- user: daniel@air.day
-- primaryaccount: airday:uuid:primary
-- shared: airday:uuid:public

or... many other solutions. This is at the intersection of simple UX & sharing limitations. TBC.

## Service autodiscovery
- DNS_SRV or a .well-known can be used. In my case, this may be a good thing to have later on - but unsure how this works if auth is not standardised?
- In my case, if there were more clients this could be advertised easily - basically it includes a link to the JMAP session resource on the domain name

## Req/response
These are batched calls by default. Request level errors are well-defined. Method level errors may result in partial or complete failure with each documented. In subsequent methods on the same request, arguments can be referenced from results of the previous using an octothorpe (#). Re. concurrency, methods in a single call must be performed in succession, however, methods across calls may be interleaved.

## Language
In the HTTP headers we may have Accept-Language: fr-CH, fr;q=0.9, de;q=0.8, en;q=0.7, *;q=0.5. This is to be respected when sending error messages back etc.
