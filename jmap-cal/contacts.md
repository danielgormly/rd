# JMAP Contacts Notes

https://jmap.io/spec-contacts.html

## 1.3 Data Model Overview
- Account with support for the contacts data model contains zero or more AddressBook objects
- ContactCard represents a person, company or other entity
- For servers with JMAP Sharing, data may be shared with other users

## 1.4 Capability
`urn:ietf:params:jmap:contacts`
+ maxAddressBooksPerCard (UnsignedInt|null)
+ mayCreateAddressBook: Boolean

## 2. AddressBooks
- Named collection of ContactCards
- id, name, description, sortOrder, isDefault, isSubscribed, shareWith, myRights
- AddressBookRights shows permissions

## 2.1 AddressBook/get
- list of ids, or ids: null to fetch all at once

## 2.2 AddressBook/changes
- Standard /changes

## 2.3 AddressBook/set
- additional arg: onDestroyRemoveContents - like a "force" method on non-empty AddressBook
- additional arg: onSuccessSetIsDefault - attempts to set referenced AddressBook as default
- shareWidth prop only set by users with mayAdmin
- addressBookHasContents error if deleted with ContactCard assigned

## 3. ContactCards
- JSCard object
- id
- addressBookIds - address books it belongs to
- for media objects; blobId

## 3.x Methods
ContactCard/get = Standard
ContactCard/changes = Standard
ContactCard/query = Standard + specific filter & sort info
ContactCard/set = Standard (+ blobId can be specified for photo)
ContactCard/copy = Standard
