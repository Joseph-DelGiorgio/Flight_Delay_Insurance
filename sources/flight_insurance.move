module flight_insurance::flight_insurance {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use sui::table::{Self, Table};
    use sui::table_vec::{Self, TableVec};
    use std::string::{Self, String};
    use std::vector;
    use sui::balance::{Self, Balance};
    use sui::event;
    use std::option::Option;

    // Error codes
    const EINVALID_PREMIUM: u64 = 1;
    const EINVALID_PAYOUT: u64 = 2;
    const EINVALID_DELAY: u64 = 3;
    const EINVALID_OPERATION: u64 = 4;
    const EPOLICY_NOT_FOUND: u64 = 5;
    const EINSUFFICIENT_FUNDS: u64 = 6;
    const EINVALID_STATUS: u64 = 7;

    // Policy status constants
    const STATUS_ACTIVE: u8 = 0;
    const STATUS_PAID: u8 = 1;
    const STATUS_CANCELLED: u8 = 2;
    const STATUS_EXPIRED: u8 = 3;

    // Minimum premium in MIST (0.01 SUI)
    const MINIMUM_PREMIUM: u64 = 10_000_000;
    // Maximum payout in MIST (100 SUI)
    const MAXIMUM_PAYOUT: u64 = 100_000_000_000;
    // Maximum delay threshold in minutes (24 hours)
    const MAX_DELAY_THRESHOLD: u64 = 1440;

    struct FlightPolicy has key, store {
        id: UID,
        policy_holder: address,
        flight_number: String,
        scheduled_departure: u64,
        scheduled_arrival: u64,
        delay_threshold: u64,
        premium: u64,
        payout: u64,
        status: u8,
        created_at: u64,
        updated_at: u64
    }

    struct InsurancePool has key {
        id: UID,
        treasury_cap: TreasuryCap<SUI>,
        active_policies: TableVec<ID>,
        total_premiums: u64,
        total_payouts: u64
    }

    struct FlightData has store {
        flight_number: String,
        actual_arrival: u64,
        delay_minutes: u64,
        timestamp: u64
    }

    // ===== Events =====
    struct PolicyCreated has copy, drop {
        policy_id: ID,
        flight_number: String,
        policy_holder: address,
        premium: u64,
        payout: u64,
        delay_threshold: u64
    }

    struct PolicyPaidOut has copy, drop {
        policy_id: ID,
        flight_number: String,
        policy_holder: address,
        payout_amount: u64,
        delay: u64
    }

    struct PolicyCancelled has copy, drop {
        policy_id: ID,
        flight_number: String,
        policy_holder: address,
        refund_amount: u64
    }

    struct PoolUpdated has copy, drop {
        total_premiums: u64,
        total_payouts: u64,
        active_policies: u64
    }

    // ===== Functions =====
    fun init(ctx: &mut TxContext) {
        let treasury_cap = coin::mint_for_testing<SUI>(0, ctx);
        let pool = InsurancePool {
            id: object::new(ctx),
            treasury_cap,
            active_policies: table_vec::empty<ID>(ctx),
            total_premiums: 0,
            total_payouts: 0
        };
        transfer::share_object(pool);
    }

    public fun create_policy(
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
        let premium_amount = coin::value(&premium);
        assert!(premium_amount > 0, EINVALID_PREMIUM);
        assert!(payout > premium_amount, EINVALID_PAYOUT);
        assert!(delay_threshold > 0, EINVALID_DELAY);
        assert!(scheduled_arrival > scheduled_departure, EINVALID_DELAY);

        let policy = FlightPolicy {
            id: object::new(ctx),
            policy_holder: tx_context::sender(ctx),
            flight_number: string::utf8(flight_number),
            scheduled_departure,
            scheduled_arrival,
            delay_threshold,
            premium: premium_amount,
            payout,
            status: STATUS_ACTIVE,
            created_at: clock::timestamp_ms(clock),
            updated_at: clock::timestamp_ms(clock)
        };

        let policy_id = object::id(&policy);
        table_vec::push_back(&mut pool.active_policies, policy_id);
        pool.total_premiums = pool.total_premiums + premium_amount;

        transfer::public_transfer(policy, tx_context::sender(ctx));
        coin::destroy_zero(premium);
    }

    public fun cancel_policy(
        policy: &mut FlightPolicy,
        pool: &mut InsurancePool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == policy.policy_holder, EINVALID_OPERATION);
        assert!(policy.status == STATUS_ACTIVE, EINVALID_STATUS);

        let current_time = clock::timestamp_ms(clock);
        assert!(current_time < policy.scheduled_departure, EINVALID_OPERATION);

        policy.status = STATUS_CANCELLED;
        policy.updated_at = current_time;
    }

    public fun process_flight_data(
        policy: &mut FlightPolicy,
        pool: &mut InsurancePool,
        actual_arrival: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(policy.status == STATUS_ACTIVE, EINVALID_STATUS);
        assert!(actual_arrival >= policy.scheduled_arrival, EINVALID_OPERATION);

        let delay_minutes = (actual_arrival - policy.scheduled_arrival) / 60;
        if (delay_minutes >= policy.delay_threshold) {
            policy.status = STATUS_PAID;
            policy.updated_at = clock::timestamp_ms(clock);
            pool.total_payouts = pool.total_payouts + policy.payout;
        } else {
            policy.status = STATUS_EXPIRED;
            policy.updated_at = clock::timestamp_ms(clock);
        }
    }

    public fun get_policy_details(policy: &FlightPolicy): (
        address,
        String,
        u64,
        u64,
        u64,
        u64,
        u64,
        u8,
        u64,
        u64
    ) {
        (
            policy.policy_holder,
            policy.flight_number,
            policy.scheduled_departure,
            policy.scheduled_arrival,
            policy.delay_threshold,
            policy.premium,
            policy.payout,
            policy.status,
            policy.created_at,
            policy.updated_at
        )
    }

    public fun get_policy_status(policy: &FlightPolicy): u8 {
        policy.status
    }

    public fun get_pool_stats(pool: &InsurancePool): (u64, u64) {
        (pool.total_premiums, pool.total_payouts)
    }
} 