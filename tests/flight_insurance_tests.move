#[test_only]
module flight_insurance::flight_insurance_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::object::{Self, ID};
    use sui::balance;
    use sui::clock::{Self, Clock};
    use sui::test_utils::assert_eq;

    use flight_insurance::flight_insurance::{
        Self, Policy, InsurancePool,
        PolicyCreated, ClaimProcessed
    };
    use flight_insurance::oracle::{Self, Oracle};

    // Test addresses
    const ADMIN: address = @0xAD;
    const USER: address = @0xB0B;
    const ORACLE_PROVIDER: address = @0x0C1;

    // Test constants
    const FLIGHT_NUMBER: vector<u8> = b"AA123";
    const AIRLINE: vector<u8> = b"SuiAir";
    const DEPARTURE_TIME: u64 = 172800000; // In milliseconds
    const COVERAGE: u64 = 100_000_000; // 0.1 SUI
    const PREMIUM: u64 = 5_000_000; // 0.005 SUI
    const DELAY_THRESHOLD_MINUTES: u64 = 30;

    fun setup_test_scenario(): (Scenario, ID, ID) {
        let mut scenario = ts::begin(ADMIN);
        
        // Init the insurance pool
        {
            flight_insurance::init(ts::ctx(&mut scenario));
        };

        // Init the oracle and authorize the provider
        {
            oracle::init(ts::ctx(&mut scenario));
            let oracle_obj = ts::take_shared<Oracle>(&scenario);
            oracle::add_authorized_caller(&mut oracle_obj, ORACLE_PROVIDER, ts::ctx(&mut scenario));
            ts::return_shared(oracle_obj);
        };

        // Get pool and oracle IDs for later use
        let pool_id = ts::most_recent_shared_object_id<InsurancePool>(&scenario);
        let oracle_id = ts::most_recent_shared_object_id<Oracle>(&scenario);

        // Give the user some SUI
        ts::next_tx(&mut scenario, USER);
        {
            let coin = coin::mint_for_testing<SUI>(PREMIUM, ts::ctx(&mut scenario));
            ts::transfer_to_sender(&mut scenario, coin);
        };

        (scenario, pool_id, oracle_id)
    }

    #[test]
    fun test_create_and_get_policy() {
        let (mut scenario, pool_id, _) = setup_test_scenario();

        ts::next_tx(&mut scenario, USER);
        
        // Create a policy
        {
            let pool = ts::borrow_shared_mut<InsurancePool>(&mut scenario, pool_id);
            let premium_coin = ts::take_from_sender<Coin<SUI>>(&scenario);
            
            flight_insurance::create_policy(
                pool,
                FLIGHT_NUMBER,
                AIRLINE,
                DEPARTURE_TIME,
                COVERAGE,
                premium_coin,
                ts::ctx(&mut scenario)
            );
        };

        ts::assert_last_event<PolicyCreated>(&scenario, |e| {
            assert_eq(e.owner, USER);
            assert_eq(e.flight_number, FLIGHT_NUMBER);
            assert_eq(e.premium, PREMIUM);
            assert_eq(e.coverage_amount, COVERAGE);
        });

        // Verify policy details
        {
            let pool = ts::borrow_shared<InsurancePool>(&scenario, pool_id);
            let user_policies = flight_insurance::get_policies(pool, USER);
            assert_eq(vector::length(&user_policies), 1);
            let policy_id = *vector::borrow(&user_policies, 0);
            
            let policy: &Policy = ts::read_object(&scenario, policy_id);
            let (owner, flight, airline, _, coverage, premium, status, _) = 
                flight_insurance::get_policy_details(policy);
            
            assert_eq(owner, USER);
            assert_eq(flight, FLIGHT_NUMBER);
            assert_eq(airline, AIRLINE);
            assert_eq(coverage, COVERAGE);
            assert_eq(premium, PREMIUM);
            assert_eq(status, b"ACTIVE");
        };

        ts::end(scenario);
    }

    #[test]
    fun test_process_claim_approved() {
        let (mut scenario, pool_id, oracle_id) = setup_test_scenario();

        ts::next_tx(&mut scenario, USER);
        
        // Create a policy first
        {
            let pool = ts::borrow_shared_mut<InsurancePool>(&mut scenario, pool_id);
            let premium_coin = ts::take_from_sender<Coin<SUI>>(&scenario);
            flight_insurance::create_policy(pool, FLIGHT_NUMBER, AIRLINE, DEPARTURE_TIME, COVERAGE, premium_coin, ts::ctx(&mut scenario));
        };

        // Oracle processes the flight as delayed
        ts::next_tx(&mut scenario, ORACLE_PROVIDER);
        {
            let pool = ts::borrow_shared_mut<InsurancePool>(&mut scenario, pool_id);
            let user_policies = flight_insurance::get_policies(pool, USER);
            let policy_id = *vector::borrow(&user_policies, 0);

            // Simulate a delay of 45 minutes, which is over the threshold
            flight_insurance::process_claim(pool, policy_id, 45, ts::ctx(&mut scenario));
        };

        // Check event
        ts::assert_last_event<ClaimProcessed>(&scenario, |e| {
            assert_eq(e.owner, USER);
            assert_eq(e.amount, COVERAGE);
            assert_eq(e.status, b"APPROVED");
        });

        // Verify user received the payout
        ts::next_tx(&mut scenario, USER);
        {
            let user_balance = ts::balance_for_sender<SUI>(&scenario);
            assert_eq(balance::value(user_balance), COVERAGE);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_process_claim_rejected() {
        let (mut scenario, pool_id, oracle_id) = setup_test_scenario();

        ts::next_tx(&mut scenario, USER);
        
        // Create a policy
        {
            let pool = ts::borrow_shared_mut<InsurancePool>(&mut scenario, pool_id);
            let premium_coin = ts::take_from_sender<Coin<SUI>>(&scenario);
            flight_insurance::create_policy(pool, FLIGHT_NUMBER, AIRLINE, DEPARTURE_TIME, COVERAGE, premium_coin, ts::ctx(&mut scenario));
        };

        // Oracle processes the flight as on-time
        ts::next_tx(&mut scenario, ORACLE_PROVIDER);
        {
            let pool = ts::borrow_shared_mut<InsurancePool>(&mut scenario, pool_id);
            let user_policies = flight_insurance::get_policies(pool, USER);
            let policy_id = *vector::borrow(&user_policies, 0);

            // Simulate a delay of 15 minutes, which is under the threshold
            flight_insurance::process_claim(pool, policy_id, 15, ts::ctx(&mut scenario));
        };

        // Check event
        ts::assert_last_event<ClaimProcessed>(&scenario, |e| {
            assert_eq(e.owner, USER);
            assert_eq(e.amount, 0);
            assert_eq(e.status, b"REJECTED");
        });

        // Verify policy status is rejected
        {
             let pool = ts::borrow_shared<InsurancePool>(&scenario, pool_id);
            let user_policies = flight_insurance::get_policies(pool, USER);
            let policy_id = *vector::borrow(&user_policies, 0);
            
            let policy: &Policy = ts::read_object(&scenario, policy_id);
            let (_, _, _, _, _, _, status, _) = flight_insurance::get_policy_details(policy);
            
            assert_eq(status, b"REJECTED");
        };

        ts::end(scenario);
    }
} 