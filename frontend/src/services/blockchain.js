import { JsonRpcProvider, Connection } from '@mysten/sui.js';

// Configuration
const CONTRACT_ADDRESS = '0x6b20aff2d7f3d65d87e4569cc2f418c673eaed4e2cdb784be45da1e298827579';
const NETWORK = process.env.REACT_APP_NETWORK || 'testnet';

// Initialize provider
const connection = new Connection({
  fullnode: `https://fullnode.${NETWORK}.sui.io`,
  faucet: `https://faucet.${NETWORK}.sui.io`,
});

const provider = new JsonRpcProvider(connection);

// Contract interaction functions
export const createPolicy = async (
  wallet,
  flightNumber,
  scheduledDeparture,
  scheduledArrival,
  delayThreshold,
  premium,
  payout
) => {
  try {
    const txb = await provider.createTransactionBlock({
      target: `${CONTRACT_ADDRESS}::flight_insurance::create_policy`,
      arguments: [
        flightNumber,
        scheduledDeparture,
        scheduledArrival,
        delayThreshold,
        premium,
        payout,
      ],
    });

    const result = await wallet.signAndExecuteTransactionBlock({
      transactionBlock: txb,
    });

    return result;
  } catch (error) {
    console.error('Error creating policy:', error);
    throw error;
  }
};

export const getPolicies = async (wallet) => {
  try {
    const result = await provider.getObject({
      id: CONTRACT_ADDRESS,
      options: {
        showContent: true,
      },
    });

    // TODO: Parse and return policies
    return [];
  } catch (error) {
    console.error('Error fetching policies:', error);
    throw error;
  }
};

export const getPayouts = async (wallet) => {
  try {
    const result = await provider.getObject({
      id: CONTRACT_ADDRESS,
      options: {
        showContent: true,
      },
    });

    // TODO: Parse and return payouts
    return [];
  } catch (error) {
    console.error('Error fetching payouts:', error);
    throw error;
  }
};

// Helper functions
export const formatSuiAmount = (amount) => {
  return amount / 1000000000; // Convert from MIST to SUI
};

export const parseSuiAmount = (amount) => {
  return amount * 1000000000; // Convert from SUI to MIST
};

// Event subscription
export const subscribeToEvents = (callback) => {
  const unsubscribe = provider.subscribeEvent({
    filter: {
      MoveModule: {
        package: CONTRACT_ADDRESS,
        module: 'flight_insurance',
      },
    },
    onMessage: (event) => {
      callback(event);
    },
  });

  return unsubscribe;
}; 