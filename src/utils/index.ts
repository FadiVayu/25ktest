export * from './calculationUtils';

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
