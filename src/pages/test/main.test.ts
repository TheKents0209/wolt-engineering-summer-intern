import { calculateDistanceFee, calculateRushFeeShare, calculateBulkItemFee, calculateSmallOrderFee, calculateTotalFee } from '../main'

describe('distance fee calculator', () => {
    test('1499m should result in 3€', () => {
        expect(calculateDistanceFee(1499)).toBe(3)
    });

    test('1500m should result in 3€', () => {
        expect(calculateDistanceFee(1500)).toBe(3)
    });

    test('1501m should result in 4€', () => {
        expect(calculateDistanceFee(1501)).toBe(4)
    });
})

describe('small order fee calculator', () => {
    test('8.9€ should result in 1.1€', () => {
        expect(calculateSmallOrderFee(8.9)).toBe(1.1)
    });

    test('10€ should result in 0€', () => {
        expect(calculateSmallOrderFee(10)).toBe(0)
    });

    test('12€ should result in 0€', () => {
        expect(calculateSmallOrderFee(12)).toBe(0)
    });
})

describe('rush fee calculator', () => {
    test('10 should result in 2', () => {
        expect(calculateRushFeeShare(10)).toBe(2)
    });

    test('48 should result in 17.6', () => {
        expect(calculateRushFeeShare(48)).toBe(9.6)
    });
})

describe('bulk item fee calculator', () => {
    test('4 should result in 0', () => {
        expect(calculateBulkItemFee(4)).toBe(0)
    });

    test('5 should result in 0.5', () => {
        expect(calculateBulkItemFee(5)).toBe(0.5)
    });

    test('10 should result in 3', () => {
        expect(calculateBulkItemFee(10)).toBe(3)
    });

    test('13 should result in 5.7', () => {
        expect(calculateBulkItemFee(13)).toBe(5.7)
    });
})

describe('total fee calculator', () => {
    test('99€ cart should result delivery price to be atleast 2€', () => {
        expect(calculateTotalFee(99, 2, false)).toBeGreaterThanOrEqual(2)
    });

    test('105€ cart during rush should result delivery price to be 0', () => {
        expect(calculateTotalFee(105, 4, true)).toBe(0)
    });

    test('10€ cart during rush should result delivery price to be atleast 2.4€', () => {
        expect(calculateTotalFee(10, 2, true)).toBeGreaterThanOrEqual(2.4)
    });

    test('100€ cart during rush should result delivery price to be atleast 2.4€', () => {
        expect(calculateTotalFee(100, 2, true)).toBe(0)
    });
})
