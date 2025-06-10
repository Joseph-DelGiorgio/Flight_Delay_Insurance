module flight_insurance::flight_insurance {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;
    use sui::clock::{Self, Clock};
    use std::string::{Self, String};
    use std::vector;

    // ===== Constants =====
    const EINVALID_FLIGHT_NUMBER: u64 = 1;
    const EINVALID_DELAY_THRESHOLD: u64 = 2;
    const EINVALID_PREMIUM: u64 = 3;
    const EINVALID_PAYOUT: u64 = 4;
    const EPOLICY_NOT_FOUND: u64 = 5;
    const EPOLICY_EXPIRED: u64 = 6;
    const EINSUFFICIENT_FUNDS: u64 = 7;

    // ===== Structs =====
    struct FlightPolicy has key, store {
        id: UID,
        policy_holder: address,
        flight_number: String,
        scheduled_departure: u64,
        scheduled_arrival: u64,
        delay_threshold: u64, // in minutes
        premium: u64,
        payout: u64,
        status: u8, // 0: active, 1: paid out, 2: expired
        created_at: u64
    }

    struct InsurancePool has key {
        id: UID,
        total_premiums: u64,
        total_payouts: u64,
        active_policies: vector<ID>
    }

    // ===== Events =====
    struct PolicyCreated has copy, drop {
        policy_id: ID,
        flight_number: String,
        policy_holder: address,
        premium: u64,
        payout: u64
    }

    struct PolicyPaidOut has copy, drop {
        policy_id: ID,
        flight_number: String,
        policy_holder: address,
        payout_amount: u64
    }

    // ===== Functions =====
    public fun init(ctx: &mut TxContext) {
        let insurance_pool = InsurancePool {
            id: object::new(ctx),
            total_premiums: 0,
            total_payouts: 0,
            active_policies: vector::empty()
        };
        
        transfer::share_object(insurance_pool);
    }

    public entry fun create_policy(
        pool: &mut InsurancePool,
        flight_number: vector<u8>,
        scheduled_departure: u64,
        scheduled_arrival: u64,
        delay_threshold: u64,
        premium: Coin<SUI>,
        payout: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Validate inputs
        assert!(vector::length(&flight_number) > 0, EINVALID_FLIGHT_NUMBER);
        assert!(delay_threshold > 0, EINVALID_DELAY_THRESHOLD);
        assert!(coin::value(&premium) > 0, EINVALID_PREMIUM);
        assert!(payout > coin::value(&premium), EINVALID_PAYOUT);

        let policy = FlightPolicy {
            id: object::new(ctx),
            policy_holder: tx_context::sender(ctx),
            flight_number: string::utf8(flight_number),
            scheduled_departure,
            scheduled_arrival,
            delay_threshold,
            premium: coin::value(&premium),
            payout,
            status: 0,
            created_at: clock::timestamp_ms(clock)
        };

        // Add policy to pool
        vector::push_back(&mut pool.active_policies, object::id(&policy));
        pool.total_premiums = pool.total_premiums + coin::value(&premium);

        // Emit event
        event::emit(PolicyCreated {
            policy_id: object::id(&policy),
            flight_number: string::utf8(flight_number),
            policy_holder: tx_context::sender(ctx),
            premium: coin::value(&premium),
            payout
        });

        // Transfer premium to pool
        transfer::public_transfer(policy, tx_context::sender(ctx));
        transfer::public_transfer(premium, object::id(pool));
    }

    public fun get_policy_status(policy: &FlightPolicy): u8 {
        policy.status
    }

    public fun get_policy_details(policy: &FlightPolicy): (
        address,
        String,
        u64,
        u64,
        u64,
        u64,
        u64,
        u8
    ) {
        (
            policy.policy_holder,
            policy.flight_number,
            policy.scheduled_departure,
            policy.scheduled_arrival,
            policy.delay_threshold,
            policy.premium,
            policy.payout,
            policy.status
        )
    }

    // This function will be called by the oracle when flight data is received
    public entry fun process_flight_data(
        policy: &mut FlightPolicy,
        pool: &mut InsurancePool,
        actual_arrival: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(policy.status == 0, EPOLICY_EXPIRED);
        
        let delay = if (actual_arrival > policy.scheduled_arrival) {
            actual_arrival - policy.scheduled_arrival
        } else {
            0
        };

        if (delay >= policy.delay_threshold) {
            // Trigger payout
            policy.status = 1;
            pool.total_payouts = pool.total_payouts + policy.payout;

            // Emit payout event
            event::emit(PolicyPaidOut {
                policy_id: object::id(policy),
                flight_number: policy.flight_number,
                policy_holder: policy.policy_holder,
                payout_amount: policy.payout
            });

            // TODO: Implement actual payout transfer
            // This will require additional logic to handle the SUI transfer
        }
    }
} 