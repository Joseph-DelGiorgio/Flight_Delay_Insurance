# Flight Delay Insurance on Sui

A decentralized flight delay insurance platform built on the Sui blockchain using Move smart contracts and Chainlink oracles.

## Overview

This project implements a decentralized insurance system for flight delays where:
- Users can purchase insurance policies for specific flights
- Chainlink oracles fetch real-time flight data
- Automatic payouts are triggered when delays exceed thresholds
- All transactions are transparent and on-chain

## Project Structure

```
flight_delay_insurance/
├── Move.toml                 # Move package manifest
├── sources/                  # Move smart contract source files
│   ├── flight_insurance.move # Main contract implementation
│   └── oracle.move          # Oracle integration module
├── tests/                    # Test files
│   └── flight_insurance_tests.move
└── scripts/                  # Deployment and interaction scripts
    └── deploy.move
```

## Setup

1. Install Sui CLI:
```bash
cargo install --locked --git https://github.com/MystenLabs/sui.git --branch devnet sui
```

2. Build the project:
```bash
sui move build
```

3. Run tests:
```bash
sui move test
```

## Smart Contract Architecture

The system consists of the following main components:

1. **Policy Management**
   - Policy creation and storage
   - Premium calculation
   - Policy status tracking

2. **Oracle Integration**
   - Chainlink oracle integration for flight data
   - Flight status verification
   - Delay threshold monitoring

3. **Payout System**
   - Automatic payout triggers
   - Escrow management
   - Payment processing

## Security Considerations

- All funds are held in escrow within the smart contract
- Oracle data is verified through Chainlink's decentralized network
- Access control for administrative functions
- Rate limiting and circuit breakers for emergency situations

## Development Status

🚧 Under Development 🚧

## License

MIT License 