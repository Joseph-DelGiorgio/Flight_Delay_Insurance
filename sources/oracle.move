module flight_delay_insurance::oracle {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::clock::{Self, Clock};
    use sui::event;
    use std::vector;
    use flight_delay_insurance::flight_insurance;

    /// Error codes
    const EINVALID_ORACLE: u64 = 1;
    const EINVALID_FLIGHT_STATUS: u64 = 2;
    const EINVALID_POLICY: u64 = 3;

    /// Oracle object that stores authorized callers and flight statuses
    struct Oracle has key {
        id: UID,
        authorized_callers: vector<address>,
        flight_statuses: vector<FlightStatus>
    }

    /// Flight status information
    struct FlightStatus has store {
        flight_number: vector<u8>,
        airline: vector<u8>,
        status: vector<u8>,
        timestamp: u64
    }

    /// Event emitted when flight status is updated
    struct FlightStatusUpdated has copy, drop {
        flight_number: vector<u8>,
        airline: vector<u8>,
        status: vector<u8>,
        timestamp: u64
    }

    /// Initialize the oracle
    fun init(ctx: &mut TxContext) {
        let oracle = Oracle {
            id: object::new(ctx),
            authorized_callers: vector::empty(),
            flight_statuses: vector::empty()
        };

        // Add the deployer as the first authorized caller
        vector::push_back(&mut oracle.authorized_callers, tx_context::sender(ctx));

        // Share the oracle object
        transfer::share_object(oracle);
    }

    /// Add an authorized caller
    public entry fun add_authorized_caller(
        oracle: &mut Oracle,
        caller: address,
        ctx: &mut TxContext
    ) {
        // Only the first authorized caller can add new callers
        let first_caller = vector::borrow(&oracle.authorized_callers, 0);
        assert!(tx_context::sender(ctx) == *first_caller, EINVALID_ORACLE);
        vector::push_back(&mut oracle.authorized_callers, caller);
    }

    /// Remove an authorized caller
    public entry fun remove_authorized_caller(
        oracle: &mut Oracle,
        caller: address,
        ctx: &mut TxContext
    ) {
        // Only the first authorized caller can remove callers
        let first_caller = vector::borrow(&oracle.authorized_callers, 0);
        assert!(tx_context::sender(ctx) == *first_caller, EINVALID_ORACLE);
        
        let len = vector::length(&oracle.authorized_callers);
        let i = 0;
        while (i < len) {
            let current_caller = vector::borrow(&oracle.authorized_callers, i);
            if (*current_caller == caller) {
                vector::remove(&mut oracle.authorized_callers, i);
                break
            };
            i = i + 1;
        };
    }

    /// Check if an address is an authorized caller
    public fun is_authorized_caller(oracle: &Oracle, caller: address): bool {
        let len = vector::length(&oracle.authorized_callers);
        let i = 0;
        while (i < len) {
            let current_caller = vector::borrow(&oracle.authorized_callers, i);
            if (*current_caller == caller) {
                return true
            };
            i = i + 1;
        };
        false
    }

    /// Update flight status
    public entry fun update_flight_status(
        oracle: &mut Oracle,
        policy: &flight_insurance::Policy,
        status: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(is_authorized_caller(oracle, sender), EINVALID_ORACLE);

        let (_, flight_number, airline, _, _, _, _, _) = flight_insurance::get_policy_details(policy);

        // Create new flight status
        let flight_status = FlightStatus {
            flight_number,
            airline,
            status,
            timestamp: tx_context::epoch(ctx)
        };

        // Add to flight statuses
        vector::push_back(&mut oracle.flight_statuses, flight_status);

        // Emit event
        event::emit(FlightStatusUpdated {
            flight_number,
            airline,
            status,
            timestamp: tx_context::epoch(ctx)
        });
    }

    /// Get latest flight status
    public fun get_latest_flight_status(
        oracle: &Oracle,
        flight_number: vector<u8>,
        airline: vector<u8>
    ): (vector<u8>, u64) {
        let len = vector::length(&oracle.flight_statuses);
        let i = 0;
        let latest_status = vector::empty();
        let latest_timestamp = 0u64;

        while (i < len) {
            let status = vector::borrow(&oracle.flight_statuses, i);
            if (status.flight_number == flight_number && status.airline == airline) {
                if (status.timestamp > latest_timestamp) {
                    latest_status = status.status;
                    latest_timestamp = status.timestamp;
                };
            };
            i = i + 1;
        };

        (latest_status, latest_timestamp)
    }
} 