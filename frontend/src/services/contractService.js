import { JsonRpcProvider, Connection } from '@mysten/sui.js';
import { useWalletKit } from '@mysten/wallet-kit';

// Initialize Sui client
const connection = new Connection({
  fullnode: 'https://fullnode.mainnet.sui.io',
  faucet: 'https://faucet.mainnet.sui.io'
});
const provider = new JsonRpcProvider(connection);

// Contract addresses and object IDs
const CONTRACT_ADDRESS = '0x...'; // Replace with your deployed contract address
const FLIGHT_ORACLE_ADDRESS = '0x...'; // Replace with your oracle address

export const contractService = {
  async purchaseInsurance(walletAddress, flightDetails, coverageAmount) {
    try {
      const txb = await provider.moveCall({
        target: `${CONTRACT_ADDRESS}::flight_insurance::purchase_insurance`,
        arguments: [
          flightDetails.flightNumber,
          flightDetails.airline,
          flightDetails.departureDate,
          flightDetails.departureAirport,
          flightDetails.arrivalAirport,
          coverageAmount
        ],
        typeArguments: []
      });

      const result = await provider.executeTransaction(txb);
      return result;
    } catch (error) {
      console.error('Error purchasing insurance:', error);
      throw new Error('Failed to purchase insurance. Please try again.');
    }
  },

  async getPolicies(walletAddress) {
    try {
      const policies = await provider.getObject({
        id: `${CONTRACT_ADDRESS}::flight_insurance::get_policies`,
        options: {
          showContent: true,
          showOwner: true
        }
      });

      return policies.data.content.fields.policies.map(policy => ({
        id: policy.id,
        flightNumber: policy.flight_number,
        airline: policy.airline,
        departureDate: policy.departure_date,
        departureAirport: policy.departure_airport,
        arrivalAirport: policy.arrival_airport,
        coverageAmount: policy.coverage_amount,
        status: policy.status,
        purchaseDate: policy.purchase_date
      }));
    } catch (error) {
      console.error('Error fetching policies:', error);
      throw new Error('Failed to fetch policies. Please try again.');
    }
  },

  async claimCompensation(walletAddress, policyId) {
    try {
      const txb = await provider.moveCall({
        target: `${CONTRACT_ADDRESS}::flight_insurance::claim_compensation`,
        arguments: [policyId],
        typeArguments: []
      });

      const result = await provider.executeTransaction(txb);
      return result;
    } catch (error) {
      console.error('Error claiming compensation:', error);
      throw new Error('Failed to claim compensation. Please try again.');
    }
  },

  async getPolicyDetails(policyId) {
    try {
      const policy = await provider.getObject({
        id: policyId,
        options: {
          showContent: true,
          showOwner: true
        }
      });

      return {
        id: policy.data.content.fields.id,
        flightNumber: policy.data.content.fields.flight_number,
        airline: policy.data.content.fields.airline,
        departureDate: policy.data.content.fields.departure_date,
        departureAirport: policy.data.content.fields.departure_airport,
        arrivalAirport: policy.data.content.fields.arrival_airport,
        coverageAmount: policy.data.content.fields.coverage_amount,
        status: policy.data.content.fields.status,
        purchaseDate: policy.data.content.fields.purchase_date,
        claimHistory: policy.data.content.fields.claim_history || []
      };
    } catch (error) {
      console.error('Error fetching policy details:', error);
      throw new Error('Failed to fetch policy details. Please try again.');
    }
  },

  async checkFlightStatus(flightNumber, airline) {
    try {
      const status = await provider.moveCall({
        target: `${FLIGHT_ORACLE_ADDRESS}::flight_oracle::get_flight_status`,
        arguments: [flightNumber, airline],
        typeArguments: []
      });

      return status;
    } catch (error) {
      console.error('Error checking flight status:', error);
      throw new Error('Failed to check flight status. Please try again.');
    }
  }
}; 