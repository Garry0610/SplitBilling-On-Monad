// Lightweight client-side "address book": maps wallet addresses to a
// nickname you choose, so you can tell your friends' wallets apart at a
// glance. This is NOT stored on-chain — the contract only knows addresses.
// It's stored in this browser only, so nicknames you set won't show up for
// other people opening the same bill link on their own device unless they
// set their own.

const STORAGE_KEY = "splitbill:addressBook";

type AddressBook = Record<string, string>; // lowercased address -> nickname

function readBook(): AddressBook {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AddressBook) : {};
  } catch {
    return {};
  }
}

function writeBook(book: AddressBook) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(book));
}

export function getNickname(address: string): string | null {
  const book = readBook();
  return book[address.toLowerCase()] ?? null;
}

export function setNickname(address: string, nickname: string) {
  const book = readBook();
  const trimmed = nickname.trim();
  if (trimmed) {
    book[address.toLowerCase()] = trimmed;
  } else {
    delete book[address.toLowerCase()];
  }
  writeBook(book);
}
