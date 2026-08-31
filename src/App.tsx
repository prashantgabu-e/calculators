import {
  ArrowRightLeft,
  Banknote,
  Calculator,
  CalendarDays,
  CalendarRange,
  Car,
  CircleDollarSign,
  CreditCard,
  Flame,
  HandCoins,
  HeartPulse,
  Home,
  Landmark,
  LayoutGrid,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Percent,
  PiggyBank,
  ReceiptIndianRupee,
  ReceiptText,
  Receipt,
  Split,
  Sun,
  Tag,
  TrendingUp,
  Wallet,
  type LucideIcon
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Link, NavLink, Route, Routes } from "react-router-dom";
import {
  CalorieCalculatorPage,
  CreditCardEmiCalculatorPage,
  DateDifferenceCalculatorPage,
  FuelCostCalculatorPage,
  GstReverseCalculatorPage,
  IncomeTaxCalculatorPage,
  InflationCalculatorPage,
  LumpsumCalculatorPage,
  PpfEpfCalculatorPage,
  RentBuyCalculatorPage,
  SalaryCalculatorPage,
  SplitBillCalculatorPage
} from "./extraCalculators";

type Theme = "dark" | "light";
type CalculatorRoute = {
  slug: string;
  title: string;
  category: string;
  icon: LucideIcon;
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
  {
    slug: "simple-calculator",
    title: "Simple Calculator",
    category: "Core",
    icon: Calculator,
    component: SimpleCalculatorPage
  },
  {
    slug: "percentage-calculator",
    title: "Percentage Calculator",
    category: "Math",
    icon: Percent,
    component: PercentageCalculatorPage
  },
  {
    slug: "sip-calculator",
    title: "SIP Calculator",
    category: "Finance",
    icon: PiggyBank,
    component: SipCalculatorPage
  },
  {
    slug: "emi-calculator",
    title: "EMI Calculator",
    category: "Finance",
    icon: Landmark,
    component: EmiCalculatorPage
  },
  { slug: "fd-calculator", title: "FD Calculator", category: "Finance", icon: Wallet, component: FdCalculatorPage },
  { slug: "gst-calculator", title: "GST Calculator", category: "Tax", icon: Receipt, component: GstCalculatorPage },
  {
    slug: "discount-calculator",
    title: "Discount Calculator",
    category: "Shopping",
    icon: Tag,
    component: DiscountCalculatorPage
  },
  {
    slug: "age-calculator",
    title: "Age Calculator",
    category: "Utility",
    icon: CalendarDays,
    component: AgeCalculatorPage
  },
  {
    slug: "bmi-calculator",
    title: "BMI Calculator",
    category: "Health",
    icon: HeartPulse,
    component: BmiCalculatorPage
  },
  {
    slug: "loan-calculator",
    title: "Loan Eligibility / Payment Calculator",
    category: "Finance",
    icon: HandCoins,
    component: LoanCalculatorPage
  },
  {
    slug: "compound-interest-calculator",
    title: "Compound Interest Calculator",
    category: "Finance",
    icon: TrendingUp,
    component: CompoundInterestCalculatorPage
  },
  {
    slug: "income-tax-calculator",
    title: "Income Tax Calculator",
    category: "Tax",
    icon: ReceiptIndianRupee,
    component: IncomeTaxCalculatorPage
  },
  {
    slug: "salary-calculator",
    title: "Salary / Take-home Calculator",
    category: "Finance",
    icon: Banknote,
    component: SalaryCalculatorPage
  },
  {
    slug: "lumpsum-calculator",
    title: "Mutual Fund Lumpsum Calculator",
    category: "Finance",
    icon: CircleDollarSign,
    component: LumpsumCalculatorPage
  },
  {
    slug: "ppf-epf-calculator",
    title: "PPF / EPF Calculator",
    category: "Finance",
    icon: Landmark,
    component: PpfEpfCalculatorPage
  },
  {
    slug: "credit-card-emi-calculator",
    title: "Credit Card EMI Calculator",
    category: "Finance",
    icon: CreditCard,
    component: CreditCardEmiCalculatorPage
  },
  {
    slug: "rent-vs-buy-calculator",
    title: "Rent vs Buy Calculator",
    category: "Finance",
    icon: Home,
    component: RentBuyCalculatorPage
  },
  {
    slug: "inflation-calculator",
    title: "Inflation Calculator",
    category: "Finance",
    icon: TrendingUp,
    component: InflationCalculatorPage
  },
  {
    slug: "fuel-cost-calculator",
    title: "Fuel Cost Calculator",
    category: "Everyday",
    icon: Car,
    component: FuelCostCalculatorPage
  },
  {
    slug: "split-bill-calculator",
    title: "Split Bill Calculator",
    category: "Everyday",
    icon: Split,
    component: SplitBillCalculatorPage
  },
  {
    slug: "date-difference-calculator",
    title: "Date Difference / Working Days",
    category: "Utility",
    icon: CalendarRange,
    component: DateDifferenceCalculatorPage
  },
  {
    slug: "calorie-calculator",
    title: "Calorie / BMR Calculator",
    category: "Health",
    icon: Flame,
    component: CalorieCalculatorPage
  },
  {
    slug: "gst-reverse-calculator",
    title: "GST Reverse Calculator",
    category: "Tax",
    icon: ReceiptText,
    component: GstReverseCalculatorPage
  },
  {
    slug: "converter",
    title: "Currency / Unit Converter",
    category: "Utility",
    icon: ArrowRightLeft,
    component: ConverterPage
  }
];

function App() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => getInitialSidebarState());
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const isCompactViewport = useCompactViewport();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("calcverse-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("calcverse-sidebar-collapsed", String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    if (!isCompactViewport) {
      setIsMobileSidebarOpen(false);
    }
  }, [isCompactViewport]);

  const toggleSidebar = () => {
    if (isCompactViewport) {
      setIsMobileSidebarOpen((current) => !current);
      return;
    }

    setIsSidebarCollapsed((current) => !current);
  };

  return (
    <div className={`shell${isSidebarCollapsed ? " sidebar-collapsed" : ""}`}>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isCompactViewport={isCompactViewport}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        theme={theme}
      />
      <main className="content">
        <Routes>
          <Route
            path="/"
            element={
              <DashboardPage
                isCompactViewport={isCompactViewport}
                isSidebarCollapsed={isSidebarCollapsed}
                onToggleSidebar={toggleSidebar}
              />
            }
          />
          {calculatorRoutes.map((route) => (
            <Route
              key={route.slug}
              path={`/${route.slug}`}
              element={
                <PageFrame
                  icon={route.icon}
                  isCompactViewport={isCompactViewport}
                  isSidebarCollapsed={isSidebarCollapsed}
                  onToggleSidebar={toggleSidebar}
                  title={route.title}
                >
                  <route.component />
                </PageFrame>
              }
            />
          ))}
        </Routes>
      </main>
      <MobileBottomNav onOpenMenu={() => setIsMobileSidebarOpen(true)} />
    </div>
  );
}

function MobileBottomNav({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <nav aria-label="Mobile navigation" className="mobile-bottom-nav">
      <NavLink className={({ isActive }) => `bottom-nav-item${isActive ? " active" : ""}`} end to="/">
        <LayoutGrid size={19} strokeWidth={2.1} />
        <span>Explore</span>
      </NavLink>
      <NavLink className={({ isActive }) => `bottom-nav-item${isActive ? " active" : ""}`} to="/simple-calculator">
        <Calculator size={19} strokeWidth={2.1} />
        <span>Calculate</span>
      </NavLink>
      <NavLink className={({ isActive }) => `bottom-nav-item${isActive ? " active" : ""}`} to="/sip-calculator">
        <PiggyBank size={19} strokeWidth={2.1} />
        <span>Plan</span>
      </NavLink>
      <button aria-label="Open all calculators" className="bottom-nav-item" onClick={onOpenMenu} type="button">
        <Menu size={20} strokeWidth={2.1} />
        <span>More</span>
      </button>
    </nav>
  );
}

function DashboardPage({
  isCompactViewport,
  isSidebarCollapsed,
  onToggleSidebar
}: {
  isCompactViewport: boolean;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}) {
  return (
    <PageFrame
      icon={LayoutGrid}
      isCompactViewport={isCompactViewport}
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebar={onToggleSidebar}
      title="Calculators"
    >
      <section className="dashboard-grid">
        {calculatorRoutes.map((route) => (
          <Link className="dashboard-card" key={route.slug} to={`/${route.slug}`}>
            <route.icon className="card-icon" size={20} strokeWidth={2} />
            <span className="card-category">{route.category}</span>
            <strong>{route.title}</strong>
          </Link>
        ))}
      </section>
    </PageFrame>
  );
}

function PageFrame({
  title,
  children,
  icon: Icon,
  isCompactViewport,
  isSidebarCollapsed,
  onToggleSidebar
}: {
  title: string;
  children: ReactNode;
  icon: LucideIcon;
  isCompactViewport: boolean;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}) {
  const ToggleIcon = isCompactViewport ? Menu : isSidebarCollapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <section className="page-stack">
      <header className="page-header">
        <div className="page-header-main">
          <button aria-label="Toggle sidebar" className="sidebar-toggle" onClick={onToggleSidebar} type="button">
            <ToggleIcon size={18} strokeWidth={2.2} />
          </button>
          <div className="page-title-wrap">
            <Icon className="page-title-icon" size={18} strokeWidth={2.1} />
            <h1>{title}</h1>
          </div>
        </div>
      </header>
      {children}
    </section>
  );
}

function Sidebar({
  isCollapsed,
  isCompactViewport,
  isOpen,
  onClose,
  onToggleTheme,
  theme
}: {
  isCollapsed: boolean;
  isCompactViewport: boolean;
  isOpen: boolean;
  onClose: () => void;
  onToggleTheme: () => void;
  theme: Theme;
}) {
  const ThemeIcon = theme === "dark" ? Sun : Moon;

  return (
    <>
      {isCompactViewport && isOpen ? (
        <button aria-label="Close sidebar" className="sidebar-backdrop" onClick={onClose} type="button" />
      ) : null}
      <aside className={`sidebar${isCollapsed ? " collapsed" : ""}${isOpen ? " open" : ""}`}>
        <Link className="brand" to="/">
          <span className="brand-mark">
            <Calculator size={16} strokeWidth={2.2} />
          </span>
          <div className="brand-copy">
            <strong>Calculators</strong>
          </div>
        </Link>

        <button className="theme-toggle" onClick={onToggleTheme} type="button">
          <ThemeIcon size={16} strokeWidth={2.2} />
          <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>

        <nav aria-label="Primary" className="nav-list">
          <NavLink className={({ isActive }) => navClass(isActive)} end onClick={isCompactViewport ? onClose : undefined} to="/">
            <LayoutGrid size={17} strokeWidth={2.1} />
            <span>All calculators</span>
          </NavLink>
          {Object.entries(groupCalculatorRoutes()).map(([category, routes]) => (
            <div className="nav-group" key={category}>
              <span className="nav-group-title">{category}</span>
              {routes.map((route) => (
                <NavLink
                  className={({ isActive }) => navClass(isActive)}
                  key={route.slug}
                  onClick={isCompactViewport ? onClose : undefined}
                  to={`/${route.slug}`}
                >
                  <route.icon size={17} strokeWidth={2.1} />
                  <span>{route.title}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        {isCompactViewport && isOpen ? (
          <button className="sidebar-close" onClick={onClose} type="button">
            Close
          </button>
        ) : null}
      </aside>
    </>
  );
}

function SimpleCalculatorPage() {
  const [expression, setExpression] = useState("");
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
  const [expression, setExpression] = useState("");
  const [percentOf, setPercentOf] = useState("");
  const [percentBase, setPercentBase] = useState("");
  const [portion, setPortion] = useState("");
  const [whole, setWhole] = useState("");
  const [knownValue, setKnownValue] = useState("");
  const [knownPercent, setKnownPercent] = useState("");
  const [fromValue, setFromValue] = useState("");
  const [toValue, setToValue] = useState("");
  const [percentValue, setPercentValue] = useState("");
  const [fractionNumerator, setFractionNumerator] = useState("");
  const [fractionDenominator, setFractionDenominator] = useState("");
  const [decimalValue, setDecimalValue] = useState("");

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
              <input
                onChange={(event) => setExpression(event.target.value)}
                placeholder="25% of 200"
                type="text"
                value={expression}
              />
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
              <input
                inputMode="decimal"
                onChange={(event) => setPercentOf(event.target.value)}
                placeholder="18"
                type="text"
                value={percentOf}
              />
            </div>
          </label>
          <div className="formula-text">% of</div>
          <label className="field compact">
            <span>Value</span>
            <div className="input-shell">
              <input
                inputMode="decimal"
                onChange={(event) => setPercentBase(event.target.value)}
                placeholder="2500"
                type="text"
                value={percentBase}
              />
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
              <input
                inputMode="decimal"
                onChange={(event) => setPortion(event.target.value)}
                placeholder="45"
                type="text"
                value={portion}
              />
            </div>
          </label>
          <div className="formula-text">is what % of</div>
          <label className="field compact">
            <span>Total</span>
            <div className="input-shell">
              <input
                inputMode="decimal"
                onChange={(event) => setWhole(event.target.value)}
                placeholder="180"
                type="text"
                value={whole}
              />
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
              <input
                inputMode="decimal"
                onChange={(event) => setKnownValue(event.target.value)}
                placeholder="45"
                type="text"
                value={knownValue}
              />
            </div>
          </label>
          <div className="formula-text">is</div>
          <label className="field compact">
            <span>Percent</span>
            <div className="input-shell">
              <input
                inputMode="decimal"
                onChange={(event) => setKnownPercent(event.target.value)}
                placeholder="18"
                type="text"
                value={knownPercent}
              />
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
              <input
                inputMode="decimal"
                onChange={(event) => setFromValue(event.target.value)}
                placeholder="120"
                type="text"
                value={fromValue}
              />
            </div>
          </label>
          <div className="formula-text">to</div>
          <label className="field compact">
            <span>To</span>
            <div className="input-shell">
              <input
                inputMode="decimal"
                onChange={(event) => setToValue(event.target.value)}
                placeholder="156"
                type="text"
                value={toValue}
              />
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
              <input
                inputMode="decimal"
                onChange={(event) => setPercentValue(event.target.value)}
                placeholder="12.5"
                type="text"
                value={percentValue}
              />
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
                <input
                  inputMode="decimal"
                  onChange={(event) => setFractionNumerator(event.target.value)}
                  placeholder="1"
                  type="text"
                  value={fractionNumerator}
                />
              </div>
              <div className="fraction-divider" />
              <div className="input-shell">
                <input
                  inputMode="decimal"
                  onChange={(event) => setFractionDenominator(event.target.value)}
                  placeholder="8"
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
              <input
                inputMode="decimal"
                onChange={(event) => setDecimalValue(event.target.value)}
                placeholder="0.125"
                type="text"
                value={decimalValue}
              />
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
  const [monthlyInvestment, setMonthlyInvestment] = useState("");
  const [annualReturn, setAnnualReturn] = useState("");
  const [years, setYears] = useState("");

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
          <Field label="Monthly investment" onChange={setMonthlyInvestment} placeholder="5000" value={monthlyInvestment} />
          <Field label="Expected return" onChange={setAnnualReturn} placeholder="12" suffix="%" value={annualReturn} />
          <Field label="Years" onChange={setYears} placeholder="10" value={years} />
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
  const [principal, setPrincipal] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");

  const payment = calculateEmi(toNumber(principal), toNumber(annualRate), toNumber(years));
  const totalPayment = payment.emi * payment.months;

  return (
    <section className="calculator-grid">
      <article className="panel">
        <FormGrid>
          <Field label="Loan amount" onChange={setPrincipal} placeholder="1000000" value={principal} />
          <Field label="Interest rate" onChange={setAnnualRate} placeholder="8.5" suffix="%" value={annualRate} />
          <Field label="Tenure" onChange={setYears} placeholder="5" suffix="Years" value={years} />
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
  const [deposit, setDeposit] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");
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
          <Field label="Deposit amount" onChange={setDeposit} placeholder="250000" value={deposit} />
          <Field label="Interest rate" onChange={setAnnualRate} placeholder="7" suffix="%" value={annualRate} />
          <Field label="Years" onChange={setYears} placeholder="3" value={years} />
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
  const [amount, setAmount] = useState("");
  const [gstRate, setGstRate] = useState("");
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
            placeholder="1000"
            value={amount}
          />
          <Field label="GST rate" onChange={setGstRate} placeholder="18" suffix="%" value={gstRate} />
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
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");

  const original = toNumber(price);
  const percent = toNumber(discount) / 100;
  const saved = original * percent;
  const finalPrice = original - saved;

  return (
    <section className="calculator-grid">
      <article className="panel">
        <FormGrid>
          <Field label="Original price" onChange={setPrice} placeholder="2499" value={price} />
          <Field label="Discount" onChange={setDiscount} placeholder="20" suffix="%" value={discount} />
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
  const [birthDate, setBirthDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const age = calculateAge(birthDate, targetDate);

  return (
    <section className="calculator-grid">
      <article className="panel">
        <FormGrid>
          <DateField label="Birth date" onChange={setBirthDate} placeholder="1998-06-15" value={birthDate} />
          <DateField label="Age on" onChange={setTargetDate} placeholder={TODAY} value={targetDate} />
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
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  const weightValue = toNumber(weight);
  const heightMeters = toNumber(height) / 100;
  const bmi = heightMeters === 0 ? 0 : weightValue / (heightMeters * heightMeters);

  return (
    <section className="calculator-grid">
      <article className="panel">
        <FormGrid>
          <Field label="Weight" onChange={setWeight} placeholder="68" suffix="kg" value={weight} />
          <Field label="Height" onChange={setHeight} placeholder="172" suffix="cm" value={height} />
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
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [tenureYears, setTenureYears] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [existingObligations, setExistingObligations] = useState("");

  const payment = calculateEmi(toNumber(loanAmount), toNumber(interestRate), toNumber(tenureYears));
  const maxAffordableEmi = Math.max(toNumber(monthlyIncome) * 0.5 - toNumber(existingObligations), 0);
  const eligibleLoan = calculateEligibleLoan(maxAffordableEmi, toNumber(interestRate), toNumber(tenureYears));

  return (
    <section className="calculator-grid">
      <article className="panel">
        <h2 className="panel-title">Loan payment</h2>
        <FormGrid>
          <Field label="Loan amount" onChange={setLoanAmount} placeholder="1500000" value={loanAmount} />
          <Field label="Interest rate" onChange={setInterestRate} placeholder="9" suffix="%" value={interestRate} />
          <Field label="Years" onChange={setTenureYears} placeholder="8" value={tenureYears} />
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
          <Field label="Monthly income" onChange={setMonthlyIncome} placeholder="90000" value={monthlyIncome} />
          <Field label="Existing EMIs" onChange={setExistingObligations} placeholder="15000" value={existingObligations} />
          <Field label="Interest rate" onChange={setInterestRate} placeholder="9" suffix="%" value={interestRate} />
          <Field label="Years" onChange={setTenureYears} placeholder="8" value={tenureYears} />
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
  const [principal, setPrincipal] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [years, setYears] = useState("");
  const [contribution, setContribution] = useState("");
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
          <Field label="Principal" onChange={setPrincipal} placeholder="100000" value={principal} />
          <Field label="Interest rate" onChange={setAnnualRate} placeholder="10" suffix="%" value={annualRate} />
          <Field label="Years" onChange={setYears} placeholder="7" value={years} />
          <Field label="Contribution per period" onChange={setContribution} placeholder="5000" value={contribution} />
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
  const [value, setValue] = useState("");

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
          <Field label="Value" onChange={setValue} placeholder="1" value={value} />
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
  placeholder,
  suffix,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  value: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-shell">
        <input
          inputMode="decimal"
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type="text"
          value={value}
        />
        {suffix ? <small>{suffix}</small> : null}
      </div>
    </label>
  );
}

function DateField({
  label,
  onChange,
  placeholder,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-shell">
        <input onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type="date" value={value} />
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

function groupCalculatorRoutes() {
  const order = ["Core", "Finance", "Tax", "Everyday", "Math", "Shopping", "Health", "Utility"];
  return order.reduce<Record<string, CalculatorRoute[]>>((groups, category) => {
    const routes = calculatorRoutes.filter((route) => route.category === category);
    if (routes.length) groups[category] = routes;
    return groups;
  }, {});
}

function getInitialTheme(): Theme {
  const saved = window.localStorage.getItem("calcverse-theme");
  return saved === "light" || saved === "dark" ? saved : "light";
}

function getInitialSidebarState() {
  return window.localStorage.getItem("calcverse-sidebar-collapsed") === "true";
}

function useCompactViewport() {
  const [isCompactViewport, setIsCompactViewport] = useState(() => window.innerWidth <= 1100);

  useEffect(() => {
    const onResize = () => setIsCompactViewport(window.innerWidth <= 1100);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return isCompactViewport;
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
