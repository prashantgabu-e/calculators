# Features

## Navigation And Shell

- Calculator dashboard routing
  What it does: Defines the complete list of calculator pages, their URL slugs, display titles, categories, and icons, then renders matching routes.
  Entry point: `calculatorRoutes` and `App()` in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L146) and [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L221)
  Notable edge cases handled: The route table is the single source for both dashboard cards and sidebar links, so navigation labels stay consistent across both surfaces.

- Dashboard landing page
  What it does: Renders a card grid linking to every calculator from the root route.
  Entry point: `DashboardPage()` in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L296)
  Notable edge cases handled: None beyond reusing the route registry so newly added calculators automatically appear.

- Responsive sidebar and page frame
  What it does: Provides shared page chrome, page titles, sidebar navigation, and mobile sidebar open/close behavior.
  Entry point: `PageFrame()`, `Sidebar()`, and `useCompactViewport()` in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L326), [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L361), and [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L1335)
  Notable edge cases handled: On compact viewports, the sidebar becomes an overlay with a backdrop and auto-closes when the viewport expands beyond 1100px.

- Theme persistence
  What it does: Supports light and dark themes and stores the selected theme in browser storage.
  Entry point: `App()`, `getInitialTheme()`, and CSS theme variables in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L221), [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L1326), and [`src/styles.css`](/E:/Learnings/Projects/calculators/src/styles.css)
  Notable edge cases handled: Only `"light"` and `"dark"` values are accepted from `localStorage`; any other stored value falls back to `"dark"`.

- Desktop sidebar collapse persistence
  What it does: Stores whether the desktop sidebar is collapsed and reuses that preference on reload.
  Entry point: `App()` and `getInitialSidebarState()` in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L221) and [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L1331)
  Notable edge cases handled: The stored value is interpreted strictly as the string `"true"`.

## Shared UI And Utility Primitives

- Reusable form controls
  What it does: Supplies common form wrappers for text input, date input, select menus, and segmented controls used by calculator pages.
  Entry point: `FormGrid()`, `Field()`, `DateField()`, `SelectField()`, and `SegmentedControl()` in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L1197)
  Notable edge cases handled: Numeric fields use `inputMode="decimal"` for mobile keypad guidance, but values are still treated as strings until parsed.

- Result card rendering
  What it does: Displays calculator outputs in a consistent card-based panel.
  Entry point: `ResultPanel()` in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L1309)
  Notable edge cases handled: None; the component assumes callers provide ready-to-render labels and values.

- Number parsing and formatting
  What it does: Converts free-form text input into numbers and formats results for display using the `en-IN` locale.
  Entry point: `toNumber()`, `formatValue()`, `formatMoney()`, `formatInteger()`, and `formatPlain()` in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L1347)
  Notable edge cases handled: Invalid numeric input resolves to `0`; commas are stripped before parsing; non-finite outputs are rendered as `0`.

## Core Math Calculator

- Simple arithmetic calculator
  What it does: Offers button-based and keyboard-driven arithmetic with support for digits, decimal points, operators, sign toggle, clear, delete, and evaluation.
  Entry point: `SimpleCalculatorPage()` in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L425)
  Notable edge cases handled: Prevents a leading operator other than `-`, replaces consecutive trailing operators, blocks duplicate decimals within one operand, handles `Enter`, `Backspace`, and `Escape`, and surfaces invalid expressions as an error state.

- Expression evaluation helper
  What it does: Validates and evaluates arithmetic expressions for the simple calculator and percentage-expression parser.
  Entry point: `evaluateExpression()`, `normalizeExpressionInput()`, `toggleSign()`, and `isOperator()` in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L1415) and [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L1462)
  Notable edge cases handled: Rejects characters outside `[\d+\-*/%.() ]`, returns `"Invalid input"` for disallowed characters, returns `"Invalid expression"` for parse/runtime failures and non-finite results, and trims formatted decimals via `formatPlain()`.

## Percentage And Conversion Tools

- Percentage expression evaluator
  What it does: Computes expressions like `25% of 200` and percentage-containing arithmetic expressions.
  Entry point: `PercentageCalculatorPage()` and `evaluatePercentageExpression()` in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L519) and [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L1369)
  Notable edge cases handled: Empty input returns `0`; exact `"x% of y"` input is handled with a dedicated regex; invalid derived expressions return `"Invalid"`.

- Direct percentage utilities
  What it does: Computes percentage of a value, what percent one value is of another, what whole corresponds to a known percentage, and percentage change from one value to another.
  Entry point: `PercentageCalculatorPage()` in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L519)
  Notable edge cases handled: Division-by-zero-style cases return `"0%"` or `"0"` when the denominator input resolves to zero.

- Percent, fraction, and decimal conversion
  What it does: Converts between percent, fraction, and decimal views in a three-column layout.
  Entry point: `PercentageCalculatorPage()`, `decimalToFraction()`, and `greatestCommonDivisor()` in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L519), [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L1388), and [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L1402)
  Notable edge cases handled: Non-finite decimals return `0/1`; denominator zero in fraction input returns decimal `0`; fractions are reduced using a greatest-common-divisor pass and a fixed precision scale of `1000000`.

- Unit and currency converter
  What it does: Converts values across predefined length, weight, temperature, and currency units using category-specific base-unit transforms.
  Entry point: `converterOptions` and `ConverterPage()` in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L83) and [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L1130)
  Notable edge cases handled: Changing the category resets the `from` and `to` units to the first available options for that category; currency formatting uses 4 decimals while other categories use 6. Currency conversion is based on hard-coded rates in code, not live exchange data.

## Finance Calculators

- SIP calculator
  What it does: Estimates invested amount, estimated returns, and future value for monthly systematic investments.
  Entry point: `SipCalculatorPage()` in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L800)
  Notable edge cases handled: When expected return is zero, future value falls back to `monthly * months` instead of using the annuity-growth formula.

- EMI calculator
  What it does: Calculates monthly EMI, total interest, and total payment for a loan.
  Entry point: `EmiCalculatorPage()` and `calculateEmi()` in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L834) and [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L1488)
  Notable edge cases handled: Zero or negative tenure rounds to `0` months and yields zeroed results; zero interest rate falls back to simple principal divided by months.

- Fixed deposit calculator
  What it does: Computes invested amount, earned interest, and maturity value using configurable compounding frequency.
  Entry point: `FdCalculatorPage()` and `frequencies` in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L862) and [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L76)
  Notable edge cases handled: None beyond shared numeric parsing; compounding options are limited to yearly, half-yearly, quarterly, and monthly.

- Loan payment and eligibility calculator
  What it does: Combines a payment calculator with an eligibility estimator based on monthly income and existing EMI obligations.
  Entry point: `LoanCalculatorPage()`, `calculateEmi()`, and `calculateEligibleLoan()` in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L1031), [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L1488), and [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L1504)
  Notable edge cases handled: Affordable EMI is clamped to zero with `Math.max`; zero interest and zero/negative tenure are handled by the shared helpers.

- Compound interest calculator
  What it does: Projects future value from an initial principal plus recurring contributions, with configurable compounding frequency.
  Entry point: `CompoundInterestCalculatorPage()` and `frequencies` in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L1078) and [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L76)
  Notable edge cases handled: If periodic interest is zero, contribution growth falls back to simple multiplication by total periods.

## Tax, Shopping, Health, And Utility Calculators

- GST calculator
  What it does: Calculates either tax-on-top totals for exclusive pricing or extracts base amount and included GST from inclusive pricing.
  Entry point: `GstCalculatorPage()` in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L903)
  Notable edge cases handled: The input label changes based on mode (`Base amount` vs `Total amount`), and the result card set switches between exclusive and inclusive interpretations.

- Discount calculator
  What it does: Calculates saved amount, final price, and original price reference from a discount percentage.
  Entry point: `DiscountCalculatorPage()` in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L952)
  Notable edge cases handled: None beyond defaulting invalid inputs to zero through `toNumber()`.

- Age calculator
  What it does: Computes elapsed years, months, days, and total days between a birth date and a target date.
  Entry point: `AgeCalculatorPage()` and `calculateAge()` in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L980) and [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L1519)
  Notable edge cases handled: Invalid dates and target dates earlier than the birth date return all zeros; when day subtraction goes negative, the helper borrows days from the previous month before adjusting months and years.

- BMI calculator
  What it does: Computes body mass index from kilograms and centimeters and maps the result to a label.
  Entry point: `BmiCalculatorPage()` and `getBmiLabel()` in [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L1005) and [`src/App.tsx`](/E:/Learnings/Projects/calculators/src/App.tsx#L1547)
  Notable edge cases handled: Zero height produces BMI `0`; category thresholds are `<18.5` underweight, `<25` normal, `<30` overweight, otherwise obese.

## Build And Deployment Support

- Static build configuration
  What it does: Builds the app with Vite using the base path `/calculators/` and writes the production bundle to `docs/`.
  Entry point: [`vite.config.ts`](/E:/Learnings/Projects/calculators/vite.config.ts) and the `build` script in [`package.json`](/E:/Learnings/Projects/calculators/package.json)
  Notable edge cases handled: None in code, but the output directory differs from the `deploy` script’s `dist` target, so the Vite config is the authoritative build output for the current repository state.

- PowerShell build-and-push helper
  What it does: Runs the build, stages tracked files plus `docs/`, creates a timestamped commit, and pushes `origin master`.
  Entry point: [`build-and-push.ps1`](/E:/Learnings/Projects/calculators/build-and-push.ps1)
  Notable edge cases handled: Stops on build, commit, or push failure; exits cleanly when the build produces no file changes.
