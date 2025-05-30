use std::collections::HashMap;

// JSON Meta Application Protocol (JMAP)
// https://datatracker.ietf.org/doc/html/rfc8620
//
// Core Data Structures
// Currently scaffolds, will evolve soon

type id = String; // TODO: UUID?

// https://datatracker.ietf.org/doc/html/rfc8620#section-2
struct Capabilities {
    // "urn:ietf:params:jmap:core"= [capabilities]
    max_size_upload: usize, // 50,000,000 (octets)
    max_concurrent_upload: usize,
    max_size_request: usize,
    max_concurrent_requests: usize,
    max_calls_in_request: usize,
    max_objects_in_get: usize,
    max_objects_in_set: usize,
    collation_algorithms: Vec<String>, // How the server may be queried, as defined in https://datatracker.ietf.org/doc/html/rfc4790
}

// TODO: More likely a struct in itself
struct AccountCapabilityObject {
    // Further information about the account's permissions & restrictions with respect
    // to corresponding capability
}

struct Account {
    name: String,
    is_personal: bool,
    is_read_only: bool,
    account_capabilities: HashMap<String, AccountCapabilityObject>, // e.g. { "urn:ietf:params:jmap:calendars", { // ? } }
}

// https://datatracker.ietf.org/doc/html/rfc8620#section-2
struct Session {
    capabilities: Capabilities, // TODO: Maybe by reference
    accounts: HashMap<id, Account>,
    primary_accounts: HashMap<String, id>, // e.g. calendars: "account-id" i.e. what accounts to treat as default accounts
    username: String,                      // associated with credentials
    api_url: String,                       // URL to use for JMAP API requests
    download_url: String, // URL template with {accountId} {blobId} {type} {name} see https://www.rfc-editor.org/rfc/rfc6570
    upload_url: String,   // URL template with {accountId}
    event_source_url: String, // URL template with {types} {closeafter} {ping} // (Push events)
    state: String, // a means of determining the server session state and if this needs to be refetched (like a version)
}

// aka. method call
// https://datatracker.ietf.org/doc/html/rfc8620#section-3.3
struct Invocation {
    // JSON representation is a tuple
    name: String,
    arguments: Vec<String>,
    method_call_id: String, // echoed back to correlate response
}

// https://datatracker.ietf.org/doc/html/rfc8620#section-3.3
struct Request {
    using: Vec<String>, // capabilities set (TODO: ENUM)
    method_calls: Vec<Invocation>,
    created_ids: HashMap<id, id>, // TODO: Describe process later
}

struct ResponseObject {
    method_responses: Vec<Invocation>,
    created_ids: HashMap<id, id>,
    session_state: String,
}

// TODO: Recommended to set Cache-Control: no-cache, no-store, must-revalidate on the Session response

pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}

// Errors
// accountNotSupportedByMethod
