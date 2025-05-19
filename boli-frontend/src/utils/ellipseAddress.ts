
// src/utils/ellipseAddress.ts

/**
 * Shortens an Algorand address for display purposes.
 * Takes the first and last few characters of an address and adds an ellipsis in the middle.
 * 
 * @param address The Algorand address to shorten
 * @param width The number of characters to keep at the beginning and end
 * @returns The shortened address string
 */
export function ellipseAddress(address: string | null, width = 6): string {
  if (!address) return '';
  
  // If the address is shorter than 2*width+3, return it as is
  if (address.length < 2 * width + 3) return address;
  
  return `${address.slice(0, width)}...${address.slice(-width)}`;
}