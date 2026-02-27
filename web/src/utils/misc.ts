/**
 * Miscellaneous utilities for the NUI.
 */

// Example: Format currency
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};
