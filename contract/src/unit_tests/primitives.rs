#[cfg(test)]
mod tests {
    use crate::*;

    fn res(x: u128, f: &SafeFloat) -> u128 {
        let mut y = x * f.val as u128;
        (0..f.pow).for_each(|_| y *= 10);
        (0..-f.pow).for_each(|_| y /= 10);
        y
    }

    #[test]
    fn test_limited_float() {
        for f in [
            SafeFloat { val: 57, pow: 2 },
            SafeFloat {
                val: 9996867,
                pow: -6,
            },
            SafeFloat { val: 139, pow: 0 },
            SafeFloat {
                val: 100_000_000,
                pow: -32,
            },
        ] {
            for v in [
                0,
                1,
                2,
                5,
                123,
                666,
                17,
                1000000009,
                MAX_AMOUNT,
                MAX_AMOUNT - 1,
            ] {
                assert_eq!(f.mult_safe(v) / 1_000_000, res(v, &f) / 1_000_000);
            }
        }
    }
}
