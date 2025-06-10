#[test_only]
module flight_insurance::flight_insurance_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::test_utils::assert_eq;
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use flight_insurance::flight_insurance::{Self, FlightPolicy, InsurancePool};
    use flight_insurance::oracle::{Self, Oracle};
    use std::string;

    // Test addresses
    const ADMIN: address = @0xAD;
    const USER: address = @0xB0B;
    const ORACLE: address = @0x0RACL3;

    // Test data
    const FLIGHT_NUMBER: vector<u8> = b"AA123";
    const SCHEDULED_DEPARTURE: u64 = 1678900000;
    const SCHEDULED_ARRIVAL: u64 = 1678903600;
    const DELAY_THRESHOLD: u64 = 30; // 30 minutes
    const PREMIUM: u64 = 1000000; // 1 SUI
    const PAYOUT: u64 = 2000000; // 2 SUI

    fun setup_test(): Scenario {
        let scenario = ts::begin(ADMIN);
        
        // Initialize the insurance contract
        {
            flight_insurance::init(ts::ctx(&mut scenario));
        };
        
        // Initialize the oracle
        {
            oracle::init(ts::ctx(&mut scenario));
        };
        
        // Add oracle as authorized caller
        {
            let oracle_obj = ts::take_from_sender<Oracle>(&scenario);
            oracle::add_authorized_caller(&mut oracle_obj, ORACLE, ts::ctx(&mut scenario));
            ts::return_to_sender(&scenario, oracle_obj);
        };
        
        scenario
    }

    #[test]
    fun test_create_policy() {
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
        
        // Verify policy creation
        {
            let policy = ts::take_from_sender<FlightPolicy>(&scenario);
            let (holder, flight, dep, arr, threshold, prem, payout, status) = 
                flight_insurance::get_policy_details(&policy);
            
            assert_eq(holder, USER);
            assert_eq(flight, string::utf8(FLIGHT_NUMBER));
            assert_eq(dep, SCHEDULED_DEPARTURE);
            assert_eq(arr, SCHEDULED_ARRIVAL);
            assert_eq(threshold, DELAY_THRESHOLD);
            assert_eq(prem, PREMIUM);
            assert_eq(payout, PAYOUT);
            assert_eq(status, 0);
            
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