module flight_insurance::oracle {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use std::string::{Self, String};
    use flight_insurance::flight_insurance::{Self, FlightPolicy, InsurancePool};

    // ===== Constants =====
    const EINVALID_ORACLE: u64 = 1;
    const EINVALID_FLIGHT_DATA: u64 = 2;

    // ===== Structs =====
    struct OracleData has copy, drop {
        flight_number: String,
        actual_arrival: u64,
        timestamp: u64
    }

    struct Oracle has key {
        id: UID,
        authorized_callers: vector<address>
    }

    // ===== Events =====
    struct FlightDataReceived has copy, drop {
        flight_number: String,
        actual_arrival: u64,
        timestamp: u64
    }

    // ===== Functions =====
    public fun init(ctx: &mut TxContext) {
        let oracle = Oracle {
            id: object::new(ctx),
            authorized_callers: vector::empty()
        };
        
        // Add the contract deployer as an authorized caller
        vector::push_back(&mut oracle.authorized_callers, tx_context::sender(ctx));
        
        transfer::share_object(oracle);
    }

    public entry fun add_authorized_caller(
        oracle: &mut Oracle,
        caller: address,
        ctx: &TxContext
    ) {
        assert!(tx_context::sender(ctx) == vector::borrow(&oracle.authorized_callers, 0), EINVALID_ORACLE);
        vector::push_back(&mut oracle.authorized_callers, caller);
    }

    public entry fun remove_authorized_caller(
        oracle: &mut Oracle,
        caller: address,
        ctx: &TxContext
    ) {
        assert!(tx_context::sender(ctx) == vector::borrow(&oracle.authorized_callers, 0), EINVALID_ORACLE);
        let i = 0;
        let len = vector::length(&oracle.authorized_callers);
        while (i < len) {
            if (vector::borrow(&oracle.authorized_callers, i) == &caller) {
                vector::remove(&mut oracle.authorized_callers, i);
                break
            };
            i = i + 1;
        };
    }

    public entry fun submit_flight_data(
        oracle: &Oracle,
        policy: &mut FlightPolicy,
        pool: &mut InsurancePool,
        flight_number: vector<u8>,
        actual_arrival: u64,
        ctx: &mut TxContext
    ) {
        // Verify the caller is authorized
        let sender = tx_context::sender(ctx);
        let i = 0;
        let len = vector::length(&oracle.authorized_callers);
        let is_authorized = false;
        while (i < len) {
            if (vector::borrow(&oracle.authorized_callers, i) == &sender) {
                is_authorized = true;
                break
            };
            i = i + 1;
        };
        assert!(is_authorized, EINVALID_ORACLE);

        // Verify flight number matches
        let policy_flight_number = flight_insurance::get_policy_details(policy).1;
        assert!(policy_flight_number == string::utf8(flight_number), EINVALID_FLIGHT_DATA);

        // Process the flight data
        flight_insurance::process_flight_data(
            policy,
            pool,
            actual_arrival,
            clock::timestamp_ms(clock::new(ctx)),
            ctx
        );

        // Emit event
        event::emit(FlightDataReceived {
            flight_number: string::utf8(flight_number),
            actual_arrival,
            timestamp: clock::timestamp_ms(clock::new(ctx))
        });
    }
} 