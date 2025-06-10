#[test_only]
module flight_insurance::flight_insurance_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::test_utils::assert_eq;
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::object::{Self, ID};
    use flight_insurance::flight_insurance::{Self, FlightPolicy, InsurancePool};
    use flight_insurance::oracle::{Self, Oracle};
    use std::string;

    // Test addresses
    const ADMIN: address = @0xAD;
    const USER: address = @0xB0B;
    const ORACLE: address = @0x0RACL3;

    // Test constants
    const FLIGHT_NUMBER: vector<u8> = b"AA123";
    const DELAY_THRESHOLD: u64 = 60; // 1 hour
    const PREMIUM: u64 = 10000000; // 0.01 SUI
    const PAYOUT: u64 = 100000000; // 0.1 SUI

    fun setup_test(): Scenario {
        let scenario = ts::begin(ADMIN);
        
        // Initialize the insurance pool
        {
            flight_insurance::init(ts::ctx(&mut scenario));
        };
        
        // Create test coins
        {
            let ctx = ts::ctx(&mut scenario);
            let coin = coin::mint_for_testing(PREMIUM, ctx);
            ts::transfer(&mut scenario, coin, USER);
        };

        scenario
    }

    #[test]
    fun test_create_policy() {
        let scenario = setup_test();
        let current_time = 1000;
        let scheduled_departure = current_time + 3600; // 1 hour from now
        let scheduled_arrival = scheduled_departure + 7200; // 2 hours after departure

        // Create a policy
        {
            let ctx = ts::ctx(&mut scenario);
            let clock = clock::create_for_testing(ctx, current_time);
            let premium = ts::take_from_sender<Coin<SUI>>(&scenario);
            
            flight_insurance::create_policy(
                ts::take_shared<InsurancePool>(&scenario),
                FLIGHT_NUMBER,
                scheduled_departure,
                scheduled_arrival,
                DELAY_THRESHOLD,
                premium,
                PAYOUT,
                &clock,
                ctx
            );
        };

        // Verify policy creation
        {
            let policy = ts::take_from_sender<FlightPolicy>(&scenario);
            let (holder, flight_num, _, _, threshold, premium, payout, status, _, _) = 
                flight_insurance::get_policy_details(&policy);
            
            assert_eq(holder, USER);
            assert_eq(flight_num, string::utf8(FLIGHT_NUMBER));
            assert_eq(threshold, DELAY_THRESHOLD);
            assert_eq(premium, PREMIUM);
            assert_eq(payout, PAYOUT);
            assert_eq(status, 0); // active status
            
            ts::return_to_sender(&scenario, policy);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_cancel_policy() {
        let scenario = setup_test();
        let current_time = 1000;
        let scheduled_departure = current_time + 3600;
        let scheduled_arrival = scheduled_departure + 7200;

        // Create a policy first
        {
            let ctx = ts::ctx(&mut scenario);
            let clock = clock::create_for_testing(ctx, current_time);
            let premium = ts::take_from_sender<Coin<SUI>>(&scenario);
            
            flight_insurance::create_policy(
                ts::take_shared<InsurancePool>(&scenario),
                FLIGHT_NUMBER,
                scheduled_departure,
                scheduled_arrival,
                DELAY_THRESHOLD,
                premium,
                PAYOUT,
                &clock,
                ctx
            );
        };

        // Cancel the policy
        {
            let ctx = ts::ctx(&mut scenario);
            let clock = clock::create_for_testing(ctx, current_time + 1800); // 30 minutes after creation
            
            flight_insurance::cancel_policy(
                ts::take_from_sender<FlightPolicy>(&scenario),
                ts::take_shared<InsurancePool>(&scenario),
                &clock,
                ctx
            );
        };

        // Verify cancellation
        {
            let policy = ts::take_from_sender<FlightPolicy>(&scenario);
            let status = flight_insurance::get_policy_status(&policy);
            assert_eq(status, 2); // cancelled status
            ts::return_to_sender(&scenario, policy);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_process_delayed_flight() {
        let scenario = setup_test();
        
        // Create a policy
        {
            let pool = ts::take_from_sender<InsurancePool>(&scenario);
            let premium = coin::mint_for_testing(PREMIUM, ts::ctx(&mut scenario));
            
            flight_insurance::create_policy(
                &mut pool,
                FLIGHT_NUMBER,
                SCHEDULED_DEPARTURE,
                SCHEDULED_ARRIVAL,
                DELAY_THRESHOLD,
                premium,
                PAYOUT,
                ts::clock(&scenario),
                ts::ctx(&mut scenario)
            );
            
            ts::return_to_sender(&scenario, pool);
        };
        
        // Submit delayed flight data
        {
            let oracle_obj = ts::take_from_sender<Oracle>(&scenario);
            let policy = ts::take_from_sender<FlightPolicy>(&scenario);
            let pool = ts::take_from_sender<InsurancePool>(&scenario);
            
            // Simulate 45-minute delay
            let actual_arrival = SCHEDULED_ARRIVAL + (45 * 60);
            
            oracle::submit_flight_data(
                &oracle_obj,
                &mut policy,
                &mut pool,
                FLIGHT_NUMBER,
                actual_arrival,
                ts::ctx(&mut scenario)
            );
            
            ts::return_to_sender(&scenario, oracle_obj);
            ts::return_to_sender(&scenario, policy);
            ts::return_to_sender(&scenario, pool);
        };
        
        // Verify policy status
        {
            let policy = ts::take_from_sender<FlightPolicy>(&scenario);
            let (_, _, _, _, _, _, _, status) = flight_insurance::get_policy_details(&policy);
            
            assert_eq(status, 1); // Status should be "paid out"
            
            ts::return_to_sender(&scenario, policy);
        };
        
        ts::end(scenario);
    }

    #[test]
    fun test_process_ontime_flight() {
        let scenario = setup_test();
        
        // Create a policy
        {
            let pool = ts::take_from_sender<InsurancePool>(&scenario);
            let premium = coin::mint_for_testing(PREMIUM, ts::ctx(&mut scenario));
            
            flight_insurance::create_policy(
                &mut pool,
                FLIGHT_NUMBER,
                SCHEDULED_DEPARTURE,
                SCHEDULED_ARRIVAL,
                DELAY_THRESHOLD,
                premium,
                PAYOUT,
                ts::clock(&scenario),
                ts::ctx(&mut scenario)
            );
            
            ts::return_to_sender(&scenario, pool);
        };
        
        // Submit on-time flight data
        {
            let oracle_obj = ts::take_from_sender<Oracle>(&scenario);
            let policy = ts::take_from_sender<FlightPolicy>(&scenario);
            let pool = ts::take_from_sender<InsurancePool>(&scenario);
            
            // Simulate 15-minute delay (below threshold)
            let actual_arrival = SCHEDULED_ARRIVAL + (15 * 60);
            
            oracle::submit_flight_data(
                &oracle_obj,
                &mut policy,
                &mut pool,
                FLIGHT_NUMBER,
                actual_arrival,
                ts::ctx(&mut scenario)
            );
            
            ts::return_to_sender(&scenario, oracle_obj);
            ts::return_to_sender(&scenario, policy);
            ts::return_to_sender(&scenario, pool);
        };
        
        // Verify policy status
        {
            let policy = ts::take_from_sender<FlightPolicy>(&scenario);
            let (_, _, _, _, _, _, _, status) = flight_insurance::get_policy_details(&policy);
            
            assert_eq(status, 0); // Status should still be "active"
            
            ts::return_to_sender(&scenario, policy);
        };
        
        ts::end(scenario);
    }
} 