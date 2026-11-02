import Image from "next/image";

// Horizontal logo (sun + SOLEN), 856x190. Size it with a height class, e.g. "h-8 w-auto".
const WIDTH = 856;
const HEIGHT = 190;

type Props = {
  className?: string;
  /** Public page: black logo in light mode. Admin is always dark, so it leaves this off. */
  adaptive?: boolean;
};

export function Logo({ className = "", adaptive = false }: Props) {
  const common = { width: WIDTH, height: HEIGHT };
  if (!adaptive) return <Image alt="Solen" src="/brand/solen-logo-dark.svg" className={className} {...common} />;

  return (
    <>
      <Image alt="Solen" src="/brand/solen-logo-dark.svg" className={`${className} light:hidden`} {...common} />
      <Image alt="Solen" src="/brand/solen-logo-light.svg" className={`${className} hidden light:block`} {...common} />
    </>
  );
}
