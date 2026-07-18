// Hand-updated to match the new SplitBill.sol (adds cancelBill, the
// BillCancelled event, the NotOrganizer/BillIsCancelled errors, and the
// `cancelled` field in getBill's return tuple). If you ever run
// `forge build` again after further contract changes, you can regenerate
// this from contracts/out/SplitBill.sol/SplitBill.json's top-level "abi"
// field instead of hand-editing.

export const splitBillAbi = [
  {
    type: "function",
    name: "amountPaid",
    inputs: [
      { name: "", type: "uint256", internalType: "uint256" },
      { name: "", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "billCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "cancelBill",
    inputs: [{ name: "billId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createBill",
    inputs: [
      { name: "label", type: "string", internalType: "string" },
      { name: "participants", type: "address[]", internalType: "address[]" },
      { name: "shares", type: "uint256[]", internalType: "uint256[]" },
    ],
    outputs: [{ name: "billId", type: "uint256", internalType: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getBill",
    inputs: [{ name: "billId", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "organizer", type: "address", internalType: "address" },
      { name: "label", type: "string", internalType: "string" },
      { name: "totalAmount", type: "uint256", internalType: "uint256" },
      { name: "paidAmount", type: "uint256", internalType: "uint256" },
      { name: "settled", type: "bool", internalType: "bool" },
      { name: "cancelled", type: "bool", internalType: "bool" },
      { name: "participants", type: "address[]", internalType: "address[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasPaid",
    inputs: [
      { name: "billId", type: "uint256", internalType: "uint256" },
      { name: "who", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "paySplit",
    inputs: [{ name: "billId", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "shareOwed",
    inputs: [
      { name: "", type: "uint256", internalType: "uint256" },
      { name: "", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "BillCancelled",
    inputs: [{ name: "billId", type: "uint256", indexed: true, internalType: "uint256" }],
    anonymous: false,
  },
  {
    type: "event",
    name: "BillCreated",
    inputs: [
      { name: "billId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "organizer", type: "address", indexed: true, internalType: "address" },
      { name: "label", type: "string", indexed: false, internalType: "string" },
      { name: "totalAmount", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "BillSettled",
    inputs: [
      { name: "billId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "totalAmount", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "SharePaid",
    inputs: [
      { name: "billId", type: "uint256", indexed: true, internalType: "uint256" },
      { name: "payer", type: "address", indexed: true, internalType: "address" },
      { name: "amount", type: "uint256", indexed: false, internalType: "uint256" },
    ],
    anonymous: false,
  },
  { type: "error", name: "AlreadyPaidInFull", inputs: [] },
  { type: "error", name: "AlreadySettled", inputs: [] },
  { type: "error", name: "BillIsCancelled", inputs: [] },
  { type: "error", name: "DuplicateParticipant", inputs: [] },
  { type: "error", name: "MismatchedShares", inputs: [] },
  { type: "error", name: "NotAParticipant", inputs: [] },
  { type: "error", name: "NotOrganizer", inputs: [] },
  { type: "error", name: "TransferFailed", inputs: [] },
  { type: "error", name: "WrongAmount", inputs: [] },
  { type: "error", name: "ZeroAddressParticipant", inputs: [] },
  { type: "error", name: "ZeroShare", inputs: [] },
] as const;

export const splitBillAddress = process.env
  .NEXT_PUBLIC_SPLITBILL_ADDRESS as `0x${string}`;
