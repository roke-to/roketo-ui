import React from 'react';
// import { useRoketoContext } from 'app/roketo-context';

type NearTokenImageProps = {
  className?: string;
};

function NearTokenImage(props: NearTokenImageProps) {
  return (
    <svg
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      width="20pt"
      height="20pt"
      viewBox="0 0 864.000000 864.000000"
      preserveAspectRatio="xMidYMid meet"
      {...props}
    >
      <g
        transform="translate(0.000000,864.000000) scale(0.100000,-0.100000)"
        fill="#000000"
        stroke="none"
      >
        <path d="M2490 6461 c-164 -53 -265 -156 -314 -320 -14 -49 -16 -226 -16 -1821 0 -1595 2 -1772 16 -1821 25 -85 62 -148 118 -205 179 -178 476 -178 650 0 30 30 249 347 519 749 518 772 502 742 438 799 -21 19 -42 28 -66 28 -40 0 -6 28 -555 -449 -283 -246 -411 -351 -425 -349 -20 3 -20 11 -20 1238 l0 1235 21 3 c16 2 286 -315 1376 -1621 746 -892 1372 -1637 1392 -1654 94 -83 187 -113 351 -113 169 0 275 39 371 134 56 57 93 120 118 205 14 49 16 226 16 1821 0 1595 -2 1772 -16 1821 -25 85 -62 148 -118 205 -179 178 -476 178 -650 0 -30 -30 -249 -347 -519 -749 -518 -772 -502 -742 -438 -799 21 -19 42 -28 66 -28 40 0 6 -28 555 449 283 246 411 351 425 349 20 -3 20 -11 20 -1238 l0 -1235 -21 -3 c-16 -2 -286 315 -1376 1621 -746 892 -1372 1637 -1392 1654 -95 85 -187 113 -356 112 -82 0 -131 -5 -170 -18z" />
      </g>
    </svg>
  );
}

type FallbackTokenImageProps = {
  className?: string;
};

function FallbackTokenImage(props: FallbackTokenImageProps) {
  return (
    <svg
      version="1.0"
      xmlns="http://www.w3.org/2000/svg"
      width="20pt"
      height="20pt"
      viewBox="0 0 864.000000 864.000000"
      preserveAspectRatio="xMidYMid meet"
      {...props}
    >
      <g
        transform="translate(0.000000,864.000000) scale(0.100000,-0.100000)"
        fill="#000000"
        stroke="none"
      >
        <path d="M2490 6461 c-164 -53 -265 -156 -314 -320 -14 -49 -16 -226 -16 -1821 0 -1595 2 -1772 16 -1821 25 -85 62 -148 118 -205 179 -178 476 -178 650 0 30 30 249 347 519 749 518 772 502 742 438 799 -21 19 -42 28 -66 28 -40 0 -6 28 -555 -449 -283 -246 -411 -351 -425 -349 -20 3 -20 11 -20 1238 l0 1235 21 3 c16 2 286 -315 1376 -1621 746 -892 1372 -1637 1392 -1654 94 -83 187 -113 351 -113 169 0 275 39 371 134 56 57 93 120 118 205 14 49 16 226 16 1821 0 1595 -2 1772 -16 1821 -25 85 -62 148 -118 205 -179 178 -476 178 -650 0 -30 -30 -249 -347 -519 -749 -518 -772 -502 -742 -438 -799 21 -19 42 -28 66 -28 40 0 6 -28 555 449 283 246 411 351 425 349 20 -3 20 -11 20 -1238 l0 -1235 -21 -3 c-16 -2 -286 315 -1376 1621 -746 892 -1372 1637 -1392 1654 -95 85 -187 113 -356 112 -82 0 -131 -5 -170 -18z" />
      </g>
    </svg>
  );
}

const currentTokens = {
  NEAR: NearTokenImage,
};

function isValidTokenName(tokenName: string): tokenName is keyof typeof currentTokens {
  return tokenName in currentTokens;
}

type TokenIconProps = {
  tokenName: string;
  className?: string;
};

export function TokenIcon({ tokenName, className, ...rest }: TokenIconProps) {
  // const { tokens } = useRoketoContext();
  // const image = tokens.get(tokenName).metadata.icon;

  // if (image) {
  //   return (
  //     <img src={image} alt={tokenName} className={className} {...rest} />
  //   );
  // }
  const Component = isValidTokenName(tokenName) ? currentTokens[tokenName] : FallbackTokenImage;
  return <Component className={className} {...rest} />;
}
