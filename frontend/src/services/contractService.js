import { TransactionBlock } from '@mysten/sui.js';

const CONTRACT_ADDRESS = '0xa3c42824eb667f74c42a76a62d218e420d7031459350ac52ac34e133008a0974';
const INSURANCE_POOL_ID = '0xa9460a5641a90dba113a7e1bdeb83125769101028b3612c830c4a5420f725c7c';

export const contractService = {
  createPolicyTransaction(flightDetails, coverageAmount, premiumAmount) {
    try {
      const txb = new TransactionBlock();

      const premiumInMIST = Math.round(premiumAmount * 1_000_000_000);
      const coverageInMIST = Math.round(coverageAmount * 1_000_000_000);

      const [premiumCoin] = txb.splitCoins(txb.gas, [txb.pure(premiumInMIST)]);

      txb.moveCall({
        target: `${CONTRACT_ADDRESS}::flight_insurance::create_policy`,
        arguments: [
          txb.object(INSURANCE_POOL_ID),
          txb.pure(Array.from(new TextEncoder().encode(flightDetails.flightNumber))),
          txb.pure(Array.from(new TextEncoder().encode(flightDetails.airline))),
          txb.pure(flightDetails.departureDate),
          txb.pure(coverageInMIST),
          premiumCoin,
        ],
        typeArguments: [],
      });
      
      return txb;
    } catch (error) {
      console.error('Error creating policy transaction:', error);
      throw new Error('Failed to create policy transaction. Please check the console for details.');
    }
  },

  async getPolicies(client, walletAddress) {
    if (!walletAddress) {
      return [];
    }
    try {
      const policyObjects = await client.getOwnedObjects({
        owner: walletAddress,
        filter: { StructType: `${CONTRACT_ADDRESS}::flight_insurance::Policy` },
        options: { showContent: true, showType: true },
      });

      return policyObjects.data.map(({ data }) => {
        const fields = data.content.fields;
        return {
          id: fields.id.id,
          flightNumber: String.fromCharCode.apply(null, fields.flight_number),
          airline: String.fromCharCode.apply(null, fields.airline),
          departureTime: new Date(Number(fields.departure_time)).toLocaleString(),
          coverageAmount: Number(fields.coverage_amount) / 1_000_000_000,
          premium: Number(fields.premium) / 1_000_000_000,
          status: String.fromCharCode.apply(null, fields.status),
          createdAt: new Date(Number(fields.created_at)).toLocaleString(),
        };
      });
    } catch (error) {
      console.error('Error fetching policies:', error);
      throw new Error('Failed to fetch policies.');
    }
  },

  async getPolicyDetails(client, policyId) {
    try {
      const response = await client.getObject({
        id: policyId,
        options: { showContent: true },
      });
      
      const fields = response.data.content.fields;
      return {
        id: fields.id.id,
        flightNumber: String.fromCharCode.apply(null, fields.flight_number),
        airline: String.fromCharCode.apply(null, fields.airline),
        departureTime: new Date(Number(fields.departure_time)).toLocaleString(),
        coverageAmount: Number(fields.coverage_amount) / 1_000_000_000,
        premium: Number(fields.premium) / 1_000_000_000,
        status: String.fromCharCode.apply(null, fields.status),
        createdAt: new Date(Number(fields.created_at)).toLocaleString(),
      };
    } catch (error) {
      console.error('Error fetching policy details:', error);
      throw new Error('Failed to fetch policy details.');
    }
  },

  claimCompensationTransaction(policyId) {
    const simulatedDelay = 1500;

    const txb = new TransactionBlock();
    txb.moveCall({
        target: `${CONTRACT_ADDRESS}::flight_insurance::process_claim`,
        arguments: [
            txb.object(INSURANCE_POOL_ID),
            txb.object(policyId),
            txb.pure(simulatedDelay)
        ],
        typeArguments: [],
    });
    return txb;
  }
};