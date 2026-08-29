import { type ReactNode, useEffect, useState } from "react";
import { Link, NavLink, Route, Routes } from "react-router-dom";

type Theme = "dark" | "light";
type CalculatorRoute = {
  slug: string;
  title: string;
  category: string;
  component: () => ReactNode;
};
type CalcButton = {
  label: string;
  value?: string;
  variant?: "operator" | "accent" | "ghost";
  action?: "clear" | "delete" | "calculate";
};
type ResultItem = {
  label: string;
  value: string;
};
type FrequencyKey = "yearly" | "halfYearly" | "quarterly" | "monthly";
type ConverterCategoryKey = "length" | "weight" | "temperature" | "currency";
type UnitDefinition = {
  label: string;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
};

const TODAY = "2026-08-29";

const CALCULATOR_BUTTONS: CalcButton[] = [
  { label: "C", action: "clear", variant: "ghost" },
  { label: "+/-", value: "negate", variant: "ghost" },
  { label: "%", value: "%", variant: "operator" },
  { label: "/", value: "/", variant: "operator" },
  { label: "7", value: "7" },
  { label: "8", value: "8" },
  { label: "9", value: "9" },
  { label: "*", value: "*", variant: "operator" },
  { label: "4", value: "4" },
  { label: "5", value: "5" },
  { label: "6", value: "6" },
  { label: "-", value: "-", variant: "operator" },
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "+", value: "+", variant: "operator" },
  { label: "0", value: "0" },
  { label: ".", value: "." },
  { label: "DEL", action: "delete", variant: "ghost" },
  { label: "=", action: "calculate", variant: "accent" }
];

const frequencies: Record<FrequencyKey, { label: string; periods: number }> = {
  yearly: { label: "Yearly", periods: 1 },
  halfYearly: { label: "Half yearly", periods: 2 },
  quarterly: { label: "Quarterly", periods: 4 },
  monthly: { label: "Monthly", periods: 12 }
};

const converterOptions: Record<ConverterCategoryKey, Record<string, UnitDefinition>> = {
  length: {
    meter: { label: "Meter", toBase: (value) => value, fromBase: (value) => value },
    kilometer: {
      label: "Kilometer",
      toBase: (value) => value * 1000,
      fromBase: (value) => value / 1000
    },
    mile: {
      label: "Mile",
      toBase: (value) => value * 1609.344,
      fromBase: (value) => value / 1609.344
    },
    foot: {
      label: "Foot",
      toBase: (value) => value * 0.3048,
      fromBase: (value) => value / 0.3048
    }
  },
  weight: {
    kilogram: { label: "Kilogram", toBase: (value) => value, fromBase: (value) => value },
    gram: {
      label: "Gram",
      toBase: (value) => value / 1000,
      fromBase: (value) => value * 1000
    },
    pound: {
      label: "Pound",
      toBase: (value) => value * 0.45359237,
      fromBase: (value) => value / 0.45359237
    },
    ounce: {
      label: "Ounce",
      toBase: (value) => value * 0.0283495231,
      fromBase: (value) => value / 0.0283495231
    }
  },
  temperature: {
    celsius: {
      label: "Celsius",
      toBase: (value) => value,
      fromBase: (value) => value
    },
    fahrenheit: {
      label: "Fahrenheit",
      toBase: (value) => ((value - 32) * 5) / 9,
      fromBase: (value) => (value * 9) / 5 + 32
    },
    kelvin: {
      label: "Kelvin",
      toBase: (value) => value - 273.15,
      fromBase: (value) => value + 273.15
    }
  },
  currency: {
    USD: { label: "US Dollar", toBase: (value) => value, fromBase: (value) => value },
    INR: { label: "Indian Rupee", toBase: (value) => value / 83.1, fromBase: (value) => value * 83.1 },
    EUR: { label: "Euro", toBase: (value) => value / 0.92, fromBase: (value) => value * 0.92 },
    GBP: { label: "British Pound", toBase: (value) => value / 0.79, fromBase: (value) => value * 0.79 },
    AED: { label: "UAE Dirham", toBase: (value) => value / 3.67, fromBase: (value) => value * 3.67 }
  }
};

const calculatorRoutes: CalculatorRoute[] = [
  { slug: "simple-calculator", title: "Simple Calculator", category: "Core", component: SimpleCalculatorPage },
  { slug: "percentage-calculator", title: "Percentage Calculator", category: "Math", component: PercentageCalculatorPage },
  { slug: "sip-calculator", title: "SIP Calculator", category: "Finance", component: SipCalculatorPage },
  { slug: "emi-calculator", title: "EMI Calculator", category: "Finance", component: EmiCalculatorPage },
  { slug: "fd-calculator", title: "FD Calculator", category: "Finance", component: FdCalculatorPage },
  { slug: "gst-calculator", title: "GST Calculator", category: "Tax", component: GstCalculatorPage },
  { slug: "discount-calculator", title: "Discount Calculator", category: "Shopping", component: DiscountCalculatorPage },
  { slug: "age-calculator", title: "Age Calculator", category: "Utility", component: AgeCalculatorPage },
  { slug: "bmi-calculator", title: "BMI Calculator", category: "Health", component: BmiCalculatorPage },
  {
    slug: "loan-calculator",
    title: "Loan Eligibility / Payment Calculator",
    category: "Finance",
    component: LoanCalculatorPage
  },
  {
    slug: "compound-interest-calculator",
    title: "Compound Interest Calculator",
    category: "Finance",
    component: CompoundInterestCalculatorPage
  },
  {
    slug: "converter",
    title: "Currency / Unit Converter",
    category: "Utility",
    component: ConverterPage
  }
];

function App() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("calcverse-theme", theme);
  }, [theme]);

  return (
    <div className="shell">
      <Sidebar theme={theme} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} />
      <main className="content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          {calculatorRoutes.map((route) => (
            <Route
              key={route.slug}
              path={`/${route.slug}`}
              element={
                <PageFrame title={route.title}>
                  <route.component />
                </PageFrame>
              }
            />
          ))}
        </Routes>
      </main>
    </div>
  );
}

function DashboardPage() {
  return (
    <PageFrame title="Calculators">
      <section className="dashboard-grid">
        {calculatorRoutes.map((route) => (
          <Link className="dashboard-card" key={route.slug} to={`/${route.slug}`}>
            <span className="card-category">{route.category}</span>
            <strong>{route.title}</strong>
          </Link>
        ))}
      </section>
    </PageFrame>
  );
}

function PageFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="page-stack">
      <header className="page-header">
        <h1>{title}</h1>
      </header>
      {children}
    </section>
  );
}

function Sidebar({ onToggleTheme, theme }: { onToggleTheme: () => void; theme: Theme }) {
  return (
    <aside className="sidebar">
      <Link className="brand" to="/">
        <span className="brand-mark">C</span>
        <div>
          <strong>Calcverse</strong>
          <span>Dashboard</span>
        </div>
      </Link>

      <button className="theme-toggle" onClick={onToggleTheme} type="button">
        {theme === "dark" ? "Light mode" : "Dark mode"}
      </button>

      <nav aria-label="Primary" className="nav-list">
        <NavLink className={({ isActive }) => navClass(isActive)} end to="/">
          All calculators
        </NavLink>
        {calculatorRoutes.map((route) => (
          <NavLink className={({ isActive }) => navClass(isActive)} key={route.slug} to={`/${route.slug}`}>
            {route.title}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

function SimpleCalculatorPage() {
  const [expression, setExpression] = useState("12+8/2");
  const [error, setError] = useState("");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (/^[0-9+\-*/.%]$/.test(event.key)) {
        setExpression((current) => normalizeExpressionInput(current, event.key));
        setError("");
      } else if (event.key === "Enter") {
        event.preventDefault();
        setExpression((current) => {
          const calculation = evaluateExpression(current);
          if (!calculation.ok) {
            setError(calculation.message);
            return current;
          }
          setError("");
          return calculation.value;
        });
      } else if (event.key === "Backspace") {
        setExpression((current) => current.slice(0, -1));
      } else if (event.key === "Escape") {
        setExpression("");
        setError("");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const displayValue = error || expression || "0";

  const onButtonPress = (button: CalcButton) => {
    if (button.action === "clear") {
      setExpression("");
      setError("");
      return;
    }

    if (button.action === "delete") {
      setExpression((current) => current.slice(0, -1));
      setError("");
      return;
    }

    if (button.action === "calculate") {
      const calculation = evaluateExpression(expression);
      if (!calculation.ok) {
        setError(calculation.message);
        return;
      }
      setExpression(calculation.value);
      setError("");
      return;
    }

    if (button.value === "negate") {
      setExpression((current) => toggleSign(current));
      setError("");
      return;
    }

    if (button.value) {
      setExpression((current) => normalizeExpressionInput(current, button.value ?? ""));
      setError("");
    }
  };

  return (
    <section className="calculator-grid single">
      <article className="calculator-panel">
        <div className="display-panel">
          <span className="history-line">{expression || "0"}</span>
          <div className={`display-screen${error ? " has-error" : ""}`}>{displayValue}</div>
        </div>
        <div className="button-grid">
          {CALCULATOR_BUTTONS.map((button) => (
            <button
              className={`calc-button${button.variant ? ` ${button.variant}` : ""}`}
              key={button.label}
              onClick={() => onButtonPress(button)}
              type="button"
            >
              {button.label}
            </button>
          ))}
        </div>
      </article>
    </section>
  );
}

function PercentageCalculatorPage() {
  const [expression, setExpression] = useState("25% of 200");
  const [percentOf, setPercentOf] = useState("18");
  const [percentBase, setPercentBase] = useState("2500");
  const [portion, setPortion] = useState("45");
  const [whole, setWhole] = useState("180");
  const [knownValue, setKnownValue] = useState("45");
  const [knownPercent, setKnownPercent] = useState("18");
  const [fromValue, setFromValue] = useState("120");
  const [toValue, setToValue] = useState("156");
  const [percentValue, setPercentValue] = useState("12.5");
  const [fractionNumerator, setFractionNumerator] = useState("1");
  const [fractionDenominator, setFractionDenominator] = useState("8");
  const [decimalValue, setDecimalValue] = useState("0.125");

  const expressionResult = evaluatePercentageExpression(expression);
  const percentOfResult = (toNumber(percentOf) * toNumber(percentBase)) / 100;
  const isWhatPercentResult =
    toNumber(whole) === 0 ? "0%" : `${formatValue((toNumber(portion) / toNumber(whole)) * 100)}%`;
  const ofWhatResult =
    toNumber(knownPercent) === 0 ? "0" : formatValue((toNumber(knownValue) * 100) / toNumber(knownPercent));
  const percentageChangeResult =
    toNumber(fromValue) === 0
      ? "0%"
      : `${formatValue(((toNumber(toValue) - toNumber(fromValue)) / toNumber(fromValue)) * 100)}%`;
  const percentToDecimal = formatPlain(toNumber(percentValue) / 100);
  const fractionToDecimal =
    toNumber(fractionDenominator) === 0 ? "0" : formatPlain(toNumber(fractionNumerator) / toNumber(fractionDenominator));
  const decimalToPercent = `${formatValue(toNumber(decimalValue) * 100)}%`;
  const percentFraction = decimalToFraction(toNumber(percentValue) / 100);
  const decimalFraction = decimalToFraction(toNumber(decimalValue));

  return (
    <section className="calculator-stack">
      <article className="panel formula-panel">
        <div className="formula-row">
          <label className="field compact grow">
            <span>Expression</span>
            <div className="input-shell">
              <input onChange={(event) => setExpression(event.target.value)} type="text" value={expression} />
            </div>
          </label>
          <div className="formula-equals">=</div>
          <div className="result-inline">
            <span>Result</span>
            <strong>{expressionResult}</strong>
          </div>
        </div>
      </article>

      <article className="panel formula-panel">
        <div className="formula-row">
          <label className="field compact">
            <span>What is</span>
            <div className="input-shell">
              <input inputMode="decimal" onChange={(event) => setPercentOf(event.target.value)} type="text" value={percentOf} />
            </div>
          </label>
          <div className="formula-text">% of</div>
          <label className="field compact">
            <span>Value</span>
            <div className="input-shell">
              <input inputMode="decimal" onChange={(event) => setPercentBase(event.target.value)} type="text" value={percentBase} />
            </div>
          </label>
          <div className="formula-equals">=</div>
          <div className="result-inline">
            <span>Answer</span>
            <strong>{formatValue(percentOfResult)}</strong>
          </div>
        </div>
      </article>

      <article className="panel formula-panel">
        <div className="formula-row">
          <label className="field compact">
            <span>Value</span>
            <div className="input-shell">
              <input inputMode="decimal" onChange={(event) => setPortion(event.target.value)} type="text" value={portion} />
            </div>
          </label>
          <div className="formula-text">is what % of</div>
          <label className="field compact">
            <span>Total</span>
            <div className="input-shell">
              <input inputMode="decimal" onChange={(event) => setWhole(event.target.value)} type="text" value={whole} />
            </div>
          </label>
          <div className="formula-equals">=</div>
          <div className="result-inline">
            <span>Percent</span>
            <strong>{isWhatPercentResult}</strong>
          </div>
        </div>
      </article>

      <article className="panel formula-panel">
        <div className="formula-row">
          <label className="field compact">
            <span>Value</span>
            <div className="input-shell">
              <input inputMode="decimal" onChange={(event) => setKnownValue(event.target.value)} type="text" value={knownValue} />
            </div>
          </label>
          <div className="formula-text">is</div>
          <label className="field compact">
            <span>Percent</span>
            <div className="input-shell">
              <input inputMode="decimal" onChange={(event) => setKnownPercent(event.target.value)} type="text" value={knownPercent} />
              <small>%</small>
            </div>
          </label>
          <div className="formula-text">of what</div>
          <div className="formula-equals">=</div>
          <div className="result-inline">
            <span>Whole</span>
            <strong>{ofWhatResult}</strong>
          </div>
        </div>
      </article>

      <article className="panel formula-panel">
        <div className="formula-row">
          <div className="formula-text">Change from</div>
          <label className="field compact">
            <span>From</span>
            <div className="input-shell">
              <input inputMode="decimal" onChange={(event) => setFromValue(event.target.value)} type="text" value={fromValue} />
            </div>
          </label>
          <div className="formula-text">to</div>
          <label className="field compact">
            <span>To</span>
            <div className="input-shell">
              <input inputMode="decimal" onChange={(event) => setToValue(event.target.value)} type="text" value={toValue} />
            </div>
          </label>
          <div className="formula-equals">=</div>
          <div className="result-inline">
            <span>Change</span>
            <strong>{percentageChangeResult}</strong>
          </div>
        </div>
      </article>

      <article className="panel formula-panel">
        <div className="converter-grid">
          <div className="converter-column">
            <span className="converter-title">Percent</span>
            <div className="input-shell">
              <input inputMode="decimal" onChange={(event) => setPercentValue(event.target.value)} type="text" value={percentValue} />
              <small>%</small>
            </div>
            <div className="result-inline block">
              <span>Fraction</span>
              <strong>{percentFraction}</strong>
            </div>
            <div className="result-inline block">
              <span>Decimal</span>
              <strong>{percentToDecimal}</strong>
            </div>
          </div>

          <div className="converter-column">
            <span className="converter-title">Fraction</span>
            <div className="fraction-stack">
              <div className="input-shell">
                <input inputMode="decimal" onChange={(event) => setFractionNumerator(event.target.value)} type="text" value={fractionNumerator} />
              </div>
              <div className="fraction-divider" />
              <div className="input-shell">
                <input
                  inputMode="decimal"
                  onChange={(event) => setFractionDenominator(event.target.value)}
                  type="text"
                  value={fractionDenominator}
                />
              </div>
            </div>
            <div className="result-inline block">
              <span>Percent</span>
              <strong>{`${formatValue(toNumber(fractionToDecimal) * 100)}%`}</strong>
            </div>
            <div className="result-inline block">
              <span>Decimal</span>
              <strong>{fractionToDecimal}</strong>
            </div>
          </div>

          <div className="converter-column">
            <span className="converter-title">Decimal</span>
            <div className="input-shell">
              <input inputMode="decimal" onChange={(event) => setDecimalValue(event.target.value)} type="text" value={decimalValue} />
            </div>
            <div className="result-inline block">
              <span>Percent</span>
              <strong>{decimalToPercent}</strong>
            </div>
            <div className="result-inline block">
              <span>Fraction</span>
              <strong>{decimalFraction}</strong>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

function SipCalculatorPage() {
  const [monthlyInvestment, setMonthlyInvestment] = useState("5000");
  const [annualReturn, setAnnualReturn] = useState("12");
  const [years, setYears] = useState("10");

  const monthly = toNumber(monthlyInvestment);
  const rate = toNumber(annualReturn) / 100 / 12;
  const months = toNumber(years) * 12;
  const futureValue =
    rate === 0
      ? monthly * months
      : monthly * (((1 + rate) ** months - 1) / rate) * (1 + rate);
  const invested = monthly * months;

  return (
    <section className="calculator-grid">
      <article className="panel">
        <FormGrid>
          <Field label="Monthly investment" onChange={setMonthlyInvestment} value={monthlyInvestment} />
          <Field label="Expected return" onChange={setAnnualReturn} suffix="%" value={annualReturn} />
          <Field label="Years" onChange={setYears} value={years} />
        </FormGrid>
      </article>
      <ResultPanel
        items={[
          { label: "Invested amount", value: formatMoney(invested) },
          { label: "Estimated returns", value: formatMoney(futureValue - invested) },
          { label: "Future value", value: formatMoney(futureValue) }
        ]}
      />
    </section>
  );
}

function EmiCalculatorPage() {
  const [principal, setPrincipal] = useState("1000000");
  const [annualRate, setAnnualRate] = useState("8.5");
  const [years, setYears] = useState("5");

  const payment = calculateEmi(toNumber(principal), toNumber(annualRate), toNumber(years));
  const totalPayment = payment.emi * payment.months;

  return (
    <section className="calculator-grid">
      <article className="panel">
        <FormGrid>
          <Field label="Loan amount" onChange={setPrincipal} value={principal} />
          <Field label="Interest rate" onChange={setAnnualRate} suffix="%" value={annualRate} />
          <Field label="Tenure" onChange={setYears} suffix="Years" value={years} />
        </FormGrid>
      </article>
      <ResultPanel
        items={[
          { label: "Monthly EMI", value: formatMoney(payment.emi) },
          { label: "Total interest", value: formatMoney(totalPayment - toNumber(principal)) },
          { label: "Total payment", value: formatMoney(totalPayment) }
        ]}
      />
    </section>
  );
}

function FdCalculatorPage() {
  const [deposit, setDeposit] = useState("250000");
  const [annualRate, setAnnualRate] = useState("7");
  const [years, setYears] = useState("3");
  const [frequency, setFrequency] = useState<FrequencyKey>("quarterly");

  const principal = toNumber(deposit);
  const rate = toNumber(annualRate) / 100;
  const time = toNumber(years);
  const periods = frequencies[frequency].periods;
  const maturity = principal * (1 + rate / periods) ** (periods * time);

  return (
    <section className="calculator-grid">
      <article className="panel">
        <FormGrid>
          <Field label="Deposit amount" onChange={setDeposit} value={deposit} />
          <Field label="Interest rate" onChange={setAnnualRate} suffix="%" value={annualRate} />
          <Field label="Years" onChange={setYears} value={years} />
          <SelectField
            label="Compounding"
            onChange={(value) => setFrequency(value as FrequencyKey)}
            options={Object.entries(frequencies).map(([value, item]) => ({
              label: item.label,
              value
            }))}
            value={frequency}
          />
        </FormGrid>
      </article>
      <ResultPanel
        items={[
          { label: "Invested amount", value: formatMoney(principal) },
          { label: "Interest earned", value: formatMoney(maturity - principal) },
          { label: "Maturity value", value: formatMoney(maturity) }
        ]}
      />
    </section>
  );
}

function GstCalculatorPage() {
  const [amount, setAmount] = useState("1000");
  const [gstRate, setGstRate] = useState("18");
  const [mode, setMode] = useState<"exclusive" | "inclusive">("exclusive");

  const baseAmount = toNumber(amount);
  const rate = toNumber(gstRate) / 100;
  const exclusiveTax = baseAmount * rate;
  const inclusiveBase = baseAmount / (1 + rate);
  const inclusiveTax = baseAmount - inclusiveBase;

  const items =
    mode === "exclusive"
      ? [
          { label: "GST amount", value: formatMoney(exclusiveTax) },
          { label: "Total amount", value: formatMoney(baseAmount + exclusiveTax) }
        ]
      : [
          { label: "Base amount", value: formatMoney(inclusiveBase) },
          { label: "GST included", value: formatMoney(inclusiveTax) }
        ];

  return (
    <section className="calculator-grid">
      <article className="panel">
        <FormGrid>
          <Field
            label={mode === "exclusive" ? "Base amount" : "Total amount"}
            onChange={setAmount}
            value={amount}
          />
          <Field label="GST rate" onChange={setGstRate} suffix="%" value={gstRate} />
          <SegmentedControl
            label="Mode"
            onChange={(value) => setMode(value as "exclusive" | "inclusive")}
            options={[
              { label: "Exclusive", value: "exclusive" },
              { label: "Inclusive", value: "inclusive" }
            ]}
            value={mode}
          />
        </FormGrid>
      </article>
      <ResultPanel items={items} />
    </section>
  );
}

function DiscountCalculatorPage() {
  const [price, setPrice] = useState("2499");
  const [discount, setDiscount] = useState("20");

  const original = toNumber(price);
  const percent = toNumber(discount) / 100;
  const saved = original * percent;
  const finalPrice = original - saved;

  return (
    <section className="calculator-grid">
      <article className="panel">
        <FormGrid>
          <Field label="Original price" onChange={setPrice} value={price} />
          <Field label="Discount" onChange={setDiscount} suffix="%" value={discount} />
        </FormGrid>
      </article>
      <ResultPanel
        items={[
          { label: "You save", value: formatMoney(saved) },
          { label: "Final price", value: formatMoney(finalPrice) },
          { label: "Discounted from", value: formatMoney(original) }
        ]}
      />
    </section>
  );
}

function AgeCalculatorPage() {
  const [birthDate, setBirthDate] = useState("1998-06-15");
  const [targetDate, setTargetDate] = useState(TODAY);
  const age = calculateAge(birthDate, targetDate);

  return (
    <section className="calculator-grid">
      <article className="panel">
        <FormGrid>
          <DateField label="Birth date" onChange={setBirthDate} value={birthDate} />
          <DateField label="Age on" onChange={setTargetDate} value={targetDate} />
        </FormGrid>
      </article>
      <ResultPanel
        items={[
          { label: "Years", value: String(age.years) },
          { label: "Months", value: String(age.months) },
          { label: "Days", value: String(age.days) },
          { label: "Total days", value: formatInteger(age.totalDays) }
        ]}
      />
    </section>
  );
}

function BmiCalculatorPage() {
  const [weight, setWeight] = useState("68");
  const [height, setHeight] = useState("172");

  const weightValue = toNumber(weight);
  const heightMeters = toNumber(height) / 100;
  const bmi = heightMeters === 0 ? 0 : weightValue / (heightMeters * heightMeters);

  return (
    <section className="calculator-grid">
      <article className="panel">
        <FormGrid>
          <Field label="Weight" onChange={setWeight} suffix="kg" value={weight} />
          <Field label="Height" onChange={setHeight} suffix="cm" value={height} />
        </FormGrid>
      </article>
      <ResultPanel
        items={[
          { label: "BMI", value: formatValue(bmi) },
          { label: "Category", value: getBmiLabel(bmi) }
        ]}
      />
    </section>
  );
}

function LoanCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState("1500000");
  const [interestRate, setInterestRate] = useState("9");
  const [tenureYears, setTenureYears] = useState("8");
  const [monthlyIncome, setMonthlyIncome] = useState("90000");
  const [existingObligations, setExistingObligations] = useState("15000");

  const payment = calculateEmi(toNumber(loanAmount), toNumber(interestRate), toNumber(tenureYears));
  const maxAffordableEmi = Math.max(toNumber(monthlyIncome) * 0.5 - toNumber(existingObligations), 0);
  const eligibleLoan = calculateEligibleLoan(maxAffordableEmi, toNumber(interestRate), toNumber(tenureYears));

  return (
    <section className="calculator-grid">
      <article className="panel">
        <h2 className="panel-title">Loan payment</h2>
        <FormGrid>
          <Field label="Loan amount" onChange={setLoanAmount} value={loanAmount} />
          <Field label="Interest rate" onChange={setInterestRate} suffix="%" value={interestRate} />
          <Field label="Years" onChange={setTenureYears} value={tenureYears} />
        </FormGrid>
      </article>
      <ResultPanel
        items={[
          { label: "EMI", value: formatMoney(payment.emi) },
          { label: "Total interest", value: formatMoney(payment.emi * payment.months - toNumber(loanAmount)) },
          { label: "Total payment", value: formatMoney(payment.emi * payment.months) }
        ]}
      />
      <article className="panel">
        <h2 className="panel-title">Loan eligibility</h2>
        <FormGrid>
          <Field label="Monthly income" onChange={setMonthlyIncome} value={monthlyIncome} />
          <Field label="Existing EMIs" onChange={setExistingObligations} value={existingObligations} />
          <Field label="Interest rate" onChange={setInterestRate} suffix="%" value={interestRate} />
          <Field label="Years" onChange={setTenureYears} value={tenureYears} />
        </FormGrid>
      </article>
      <ResultPanel
        items={[
          { label: "Affordable EMI", value: formatMoney(maxAffordableEmi) },
          { label: "Estimated eligible loan", value: formatMoney(eligibleLoan) }
        ]}
      />
    </section>
  );
}

function CompoundInterestCalculatorPage() {
  const [principal, setPrincipal] = useState("100000");
  const [annualRate, setAnnualRate] = useState("10");
  const [years, setYears] = useState("7");
  const [contribution, setContribution] = useState("5000");
  const [frequency, setFrequency] = useState<FrequencyKey>("monthly");

  const p = toNumber(principal);
  const rate = toNumber(annualRate) / 100;
  const time = toNumber(years);
  const periods = frequencies[frequency].periods;
  const periodicRate = rate / periods;
  const totalPeriods = periods * time;
  const principalGrowth = p * (1 + periodicRate) ** totalPeriods;
  const contributionValue = toNumber(contribution);
  const contributionGrowth =
    periodicRate === 0
      ? contributionValue * totalPeriods
      : contributionValue * (((1 + periodicRate) ** totalPeriods - 1) / periodicRate);
  const futureValue = principalGrowth + contributionGrowth;
  const totalInvested = p + contributionValue * totalPeriods;

  return (
    <section className="calculator-grid">
      <article className="panel">
        <FormGrid>
          <Field label="Principal" onChange={setPrincipal} value={principal} />
          <Field label="Interest rate" onChange={setAnnualRate} suffix="%" value={annualRate} />
          <Field label="Years" onChange={setYears} value={years} />
          <Field label="Contribution per period" onChange={setContribution} value={contribution} />
          <SelectField
            label="Compounding"
            onChange={(value) => setFrequency(value as FrequencyKey)}
            options={Object.entries(frequencies).map(([value, item]) => ({
              label: item.label,
              value
            }))}
            value={frequency}
          />
        </FormGrid>
      </article>
      <ResultPanel
        items={[
          { label: "Total invested", value: formatMoney(totalInvested) },
          { label: "Interest earned", value: formatMoney(futureValue - totalInvested) },
          { label: "Future value", value: formatMoney(futureValue) }
        ]}
      />
    </section>
  );
}

function ConverterPage() {
  const [category, setCategory] = useState<ConverterCategoryKey>("length");
  const [fromUnit, setFromUnit] = useState("meter");
  const [toUnit, setToUnit] = useState("kilometer");
  const [value, setValue] = useState("1");

  useEffect(() => {
    const entries = Object.keys(converterOptions[category]);
    setFromUnit(entries[0]);
    setToUnit(entries[1] ?? entries[0]);
  }, [category]);

  const units = converterOptions[category];
  const input = toNumber(value);
  const baseValue = units[fromUnit].toBase(input);
  const converted = units[toUnit].fromBase(baseValue);

  return (
    <section className="calculator-grid">
      <article className="panel">
        <FormGrid>
          <SelectField
            label="Category"
            onChange={(next) => setCategory(next as ConverterCategoryKey)}
            options={Object.entries({
              length: "Length",
              weight: "Weight",
              temperature: "Temperature",
              currency: "Currency"
            }).map(([optionValue, label]) => ({
              label,
              value: optionValue
            }))}
            value={category}
          />
          <Field label="Value" onChange={setValue} value={value} />
          <SelectField
            label="From"
            onChange={setFromUnit}
            options={Object.entries(units).map(([unitValue, unit]) => ({
              label: unit.label,
              value: unitValue
            }))}
            value={fromUnit}
          />
          <SelectField
            label="To"
            onChange={setToUnit}
            options={Object.entries(units).map(([unitValue, unit]) => ({
              label: unit.label,
              value: unitValue
            }))}
            value={toUnit}
          />
        </FormGrid>
      </article>
      <ResultPanel
        items={[
          { label: "Converted value", value: formatValue(converted, category === "currency" ? 4 : 6) },
          { label: "From", value: units[fromUnit].label },
          { label: "To", value: units[toUnit].label }
        ]}
      />
    </section>
  );
}

function FormGrid({ children }: { children: ReactNode }) {
  return <div className="form-grid">{children}</div>;
}

function Field({
  label,
  onChange,
  suffix,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  suffix?: string;
  value: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-shell">
        <input inputMode="decimal" onChange={(event) => onChange(event.target.value)} type="text" value={value} />
        {suffix ? <small>{suffix}</small> : null}
      </div>
    </label>
  );
}

function DateField({
  label,
  onChange,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-shell">
        <input onChange={(event) => onChange(event.target.value)} type="date" value={value} />
      </div>
    </label>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-shell">
        <select onChange={(event) => onChange(event.target.value)} value={value}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function SegmentedControl({
  label,
  onChange,
  options,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <div className="field">
      <span>{label}</span>
      <div className="segmented-control">
        {options.map((option) => (
          <button
            className={`segment${value === option.value ? " active" : ""}`}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultPanel({ items }: { items: ResultItem[] }) {
  return (
    <article className="panel result-panel">
      {items.map((item) => (
        <div className="result-card" key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </article>
  );
}

function navClass(isActive: boolean) {
  return `nav-item${isActive ? " active" : ""}`;
}

function getInitialTheme(): Theme {
  const saved = window.localStorage.getItem("calcverse-theme");
  return saved === "light" || saved === "dark" ? saved : "dark";
}

function toNumber(value: string) {
  const normalized = value.replace(/,/g, "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatValue(value: number, digits = 2) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: digits
  }).format(Number.isFinite(value) ? value : 0);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2
  }).format(Number.isFinite(value) ? value : 0);
}

function formatInteger(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.max(value, 0));
}

function evaluatePercentageExpression(input: string) {
  const normalized = input.trim().toLowerCase();

  if (!normalized) {
    return "0";
  }

  const ofMatch = normalized.match(/^(-?\d*\.?\d+)\s*%\s*of\s*(-?\d*\.?\d+)$/);
  if (ofMatch) {
    const percent = Number(ofMatch[1]);
    const base = Number(ofMatch[2]);
    return formatValue((percent * base) / 100);
  }

  const plainExpression = normalized.replace(/(\d*\.?\d+)\s*%/g, "($1/100)");
  const calculation = evaluateExpression(plainExpression);
  return calculation.ok ? calculation.value : "Invalid";
}

function decimalToFraction(value: number) {
  if (!Number.isFinite(value)) {
    return "0/1";
  }

  const sign = value < 0 ? -1 : 1;
  const absolute = Math.abs(value);
  const scale = 1000000;
  const numerator = Math.round(absolute * scale);
  const denominator = scale;
  const divisor = greatestCommonDivisor(numerator, denominator);
  return `${sign * (numerator / divisor)}/${denominator / divisor}`;
}

function greatestCommonDivisor(a: number, b: number): number {
  let left = Math.abs(a);
  let right = Math.abs(b);

  while (right !== 0) {
    const temp = right;
    right = left % right;
    left = temp;
  }

  return left || 1;
}

function normalizeExpressionInput(current: string, next: string) {
  if (!current && isOperator(next) && next !== "-") {
    return current;
  }

  if (isOperator(next) && isOperator(current.slice(-1))) {
    return `${current.slice(0, -1)}${next}`;
  }

  if (next === ".") {
    const lastChunk = current.split(/[+\-*/%]/).pop() ?? "";
    if (lastChunk.includes(".")) {
      return current;
    }
  }

  return `${current}${next}`;
}

function toggleSign(current: string) {
  if (!current) {
    return "-";
  }

  const chunks = current.match(/(.*?)(-?\d*\.?\d*)$/);
  if (!chunks) {
    return current;
  }

  const prefix = chunks[1] ?? "";
  const trailing = chunks[2] ?? "";

  if (!trailing) {
    return `${current}-`;
  }

  if (trailing.startsWith("-")) {
    return `${prefix}${trailing.slice(1)}`;
  }

  return `${prefix}-${trailing}`;
}

function isOperator(value: string) {
  return ["+", "-", "*", "/", "%"].includes(value);
}

function evaluateExpression(expression: string) {
  if (!expression) {
    return { ok: true as const, value: "0" };
  }

  if (!/^[\d+\-*/%.() ]+$/.test(expression)) {
    return { ok: false as const, message: "Invalid input" };
  }

  try {
    const output = Function(`"use strict"; return (${expression})`)();

    if (typeof output !== "number" || Number.isNaN(output) || !Number.isFinite(output)) {
      return { ok: false as const, message: "Invalid expression" };
    }

    return { ok: true as const, value: formatPlain(output) };
  } catch {
    return { ok: false as const, message: "Invalid expression" };
  }
}

function formatPlain(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(6).replace(/\.?0+$/, "");
}

function calculateEmi(principal: number, annualRate: number, years: number) {
  const months = Math.max(Math.round(years * 12), 0);
  if (months === 0) {
    return { emi: 0, months: 0 };
  }

  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) {
    return { emi: principal / months, months };
  }

  const factor = (1 + monthlyRate) ** months;
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  return { emi, months };
}

function calculateEligibleLoan(emi: number, annualRate: number, years: number) {
  const months = Math.max(Math.round(years * 12), 0);
  if (months === 0) {
    return 0;
  }

  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) {
    return emi * months;
  }

  const factor = (1 + monthlyRate) ** months;
  return (emi * (factor - 1)) / (monthlyRate * factor);
}

function calculateAge(birthDate: string, targetDate: string) {
  const birth = new Date(`${birthDate}T00:00:00`);
  const target = new Date(`${targetDate}T00:00:00`);

  if (Number.isNaN(birth.getTime()) || Number.isNaN(target.getTime()) || target < birth) {
    return { years: 0, months: 0, days: 0, totalDays: 0 };
  }

  let years = target.getFullYear() - birth.getFullYear();
  let months = target.getMonth() - birth.getMonth();
  let days = target.getDate() - birth.getDate();

  if (days < 0) {
    const previousMonth = new Date(target.getFullYear(), target.getMonth(), 0);
    days += previousMonth.getDate();
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  const totalDays = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

  return { years, months, days, totalDays };
}

function getBmiLabel(bmi: number) {
  if (bmi < 18.5) {
    return "Underweight";
  }

  if (bmi < 25) {
    return "Normal";
  }

  if (bmi < 30) {
    return "Overweight";
  }

  return "Obese";
}

export default App;
