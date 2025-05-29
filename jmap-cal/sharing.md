# JMAP Sharing

## 1. Introduction
- Represent entities in a collaborative environment for sharing data

## 1.3. Data Model
- Principal: An individual, team or resource (room or projector), holds information about the entity. Associated with zero or more Accounts belonging to the principal. Principal management = domain-specific.
- Data types can allow users to share data with others by assigning permissions to principals; a ShareNotification object is created when a user's permissions are changed. HMM?

## 1.4. Subscriptions
- Permissions determine if a user can access data or not.
- JMAP Session Object typically includes an object in the accounts property for every account that the user has access to. However if the user has no subscriptions to an account, it should not appear there. State changes should only be sent where user is subscribed and must not where they are not subscribed (unless they are the owner of the account).

## 1.5. Addition to the Capabilities object
- `urn:ietf:params:jmap:principals` with currentUserPrincipalId

## 2. Principal API
- This is about sharing (or removing permissions to) accounts with someone + constraints

## 3. Share Notifications
- Servers create a ShareNotification, users receive them after their client presents them.
