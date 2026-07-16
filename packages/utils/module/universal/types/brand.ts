declare const BRAND: unique symbol;

/**
Nominal-typing wrapper that distinguishes structurally identical
`Base` values by an opaque string `Tag`. Two `Brand<string, "X">`
and `Brand<string, "Y">` are not assignable to each other even
though their runtime representations are identical.

The discriminator is a `unique symbol` declared at module scope
and never exported, so branded values cannot be constructed or
inspected from outside this module — use {@link brand}.
*/
export type Brand<Base, Tag extends string> = Base & {
  readonly [BRAND]: Tag;
};

/**
Constructs a branded value. The single sanctioned construction
site for {@link Brand}; every other module constructs branded
values exclusively through this helper so type assertions stay
out of domain code.

@param value - The base value to brand
@returns The same `value` typed as `Brand<Base, Tag>`
*/
export const brand = <Tag extends string, Base = string>(
  value: Base,
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Branding is a nominal-typing trick: the cast has no runtime effect (Brand<Base, Tag> = Base & { [BRAND]: Tag }, and BRAND is a declared-only symbol with no runtime presence). Centralising the cast here keeps domain modules cast-free.
): Brand<Base, Tag> => value as Brand<Base, Tag>;
