#[cfg(test)]
mod tests {
    use crate::*;

    fn res(x: u128, f: &SafeFloat) -> u128 {
        let mut y = x as f64 * f.val as f64;
        (0..f.pow).for_each(|_| y *= 10.0);
        (0..-f.pow).for_each(|_| y /= 10.0);
        y as u128
    }

    #[test]
    fn test_limited_float() {
        // TODO extend
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
                17,
                123,
                701,
                999999999,
                1000000000,
                1000000007,
                MAX_AMOUNT,
                MAX_AMOUNT - 1,
                MAX_AMOUNT / 701701,
            ] {
                let (x, y) = (
                    std::cmp::max(f.mult_safe(v), res(v, &f)),
                    std::cmp::min(f.mult_safe(v), res(v, &f)),
                );
                // First nine digits are correct.
                //
                // Actual precision is higher than 9 digits,
                // however we cannot check it easily
                // due to inaccuracy of f64 type cast.
                assert!(x - y <= x / 1_000_000_000);
            }
        }
    }

    #[test]
    fn test_constants() {
        assert_eq!(MAX_AMOUNT, 1_000_000_000_000_000__000_000_000_000_000_000);
        assert_eq!(MAX_STREAMING_SPEED, 1_000_000_000_000_000_000_000_000_000);

        assert_eq!(TICKS_PER_SECOND, 1_000_000_000);

        assert_eq!(SafeFloat::MAX_SAFE, 1_000_000_000_000_000_000_000_000_000);
    }
}
