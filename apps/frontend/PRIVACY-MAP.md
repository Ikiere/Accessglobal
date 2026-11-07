# Privacy Map — AccessGlobal Market (AGM)

## 1. Data-Flow Inventory

| Field / Event | Purpose | Lawful Basis | Collected At | Storage System | Retention | Encryption | PII / PCI |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Customer Name | Order fulfillment & delivery label | Contractual necessity | Checkout step 2 | Local session state | Session duration | TLS in transit | PII |
| Customer Email | Order confirmation & invoice delivery | Contractual necessity | Checkout step 2 / Auth | Local session state | Session duration | TLS in transit | PII |
| Shipping Address | Physical courier parcel delivery | Contractual necessity | Checkout step 2 | Local session state | Session duration | TLS in transit | PII |
| Newsletter Email | Updates on new workshop drops | Explicit user consent | Footer form | Client validation | Opt-out on request | TLS in transit | PII |
| Payment Method | Preferred billing tokenization | Contractual necessity | Checkout step 2 | Mock client gateway | None (tokenized) | TLS in transit | PCI |

## 2. Privacy Engineering Principles
- **Data Minimization**: No tracking beacons, no third-party cookie sync, and zero speculative profiling.
- **No Unvetted Third Parties**: All interactions stay within the customer-controlled application context.
- **Transparency**: Clear notices displayed on all input forms with instant feedback and opt-in consent for updates.

