# JMAP over Websocket Subprotocol

## 1. Introduction
- Every JMAP API request must be authenticated
- But not with the Websocket API
- Websocket binding can allow compression

## 3. Discovery
- `urn:ietf:params:jmap:websocket` can be added to capabilities object
- url + supportsPush as arguments to above capability

## 4. Subprotocol
- Application-level protocol layered ontop of WS connection
- Client must make an authenticated HTTP request
- Sec-WebSocket-Protocol must say "jmap"
- When authentication lapses, connection can be closed or treat further reqs as unauthenticated

## 4.3. Websocket messages
- Data framem essages = text frames containing UTF-8 encoded data
- Client->Server messages: A single JMAP req object, JMAP WebSocketPushEnable or JMAPWebSocketDisablePush
- Server->client messages: JMAP Response, JSON Problem Details or JMAPStateChange
- Fragmented messages MUST be coalesced first

## 4.3.1. Handling Invalid Data
- On receiving a binary frame, the endpoint can ignore or close the connection, and optionally send a close frame with a status code of 1003 (Unsupported Data).
- Client can close on invalid message, client can send a Close frame with status code of 1007 - Invliad frame payload data.
- Server must send JSON Problem Details object for any req-level errors.

## 4.3.2 JMAP Requests
- Every request includes:
@type: "String" = "Request"
id: "String" (optional) // to be echoed back, as requests can be processed out-of-order
- maxConcurrentRequests limit in the capabilities obj also applies to ws reqs.

## 4.3.3. JMAP Responses
- Responses similarly include:
@type: "String" = "Response" | "RequestError
requestId: "String" (optional) // client-specified id

## 4.3.5. JMAP Push Notifications
- "supportsPush: true" advertised in the ws prop in the server capabilities object if true

## 4.3.5.x Notification Format
- pushState: "String" - string that encodes server state (immediately get changes that occurred while it was disconnected)
- you can also enable & disable with separate messages (see section)

## 4.x
- Examples & security concerns listed
