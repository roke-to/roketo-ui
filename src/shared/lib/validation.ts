const NUMBER_PATTERN = /^[0-9]+$/;

export const isLikeNumber = (stringLikeNumber: string) => NUMBER_PATTERN.test(stringLikeNumber);
