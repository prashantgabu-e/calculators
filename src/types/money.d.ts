declare module "money" {
  type ConversionOptions = {
    from?: string;
    to?: string;
  };

  type MoneyWrapper = {
    convert(options?: ConversionOptions): number;
    from(currency: string): MoneyWrapper;
    to(currency: string): number;
  };

  type Money = {
    (value: number | string): MoneyWrapper;
    base: string;
    convert(value: number, options?: ConversionOptions): number;
    rates: Record<string, number>;
    settings: Required<ConversionOptions>;
    version: string;
  };

  const fx: Money;
  export default fx;
}
