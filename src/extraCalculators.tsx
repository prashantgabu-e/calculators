import { useState, type ReactNode } from "react";

const n = (v: string) => Number(v.replace(/,/g, "")) || 0;
const rupees = (v: number) => "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.max(0, Number.isFinite(v) ? v : 0));
const shown = (v: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(Number.isFinite(v) ? v : 0);
function Field({ label, value, set, suffix = "₹", type = "number" }: { label: string; value: string; set: (v: string) => void; suffix?: string; type?: string }) { return <label className="field"><span>{label}</span><div className="input-shell"><input inputMode="decimal" min="0" onChange={(e) => set(e.target.value)} placeholder={"Enter " + label.toLowerCase()} type={type} value={value} />{suffix && <small>{suffix}</small>}</div></label>; }
function Results({ children }: { children: ReactNode }) { return <article className="panel result-panel">{children}</article>; }
function Result({ label, value }: { label: string; value: string }) { return <div className="result-card"><span>{label}</span><strong>{value}</strong></div>; }
function Layout({ title, children, results }: { title: string; children: ReactNode; results: ReactNode }) { return <section className="calculator-grid"><article className="panel"><h2 className="panel-title">{title}</h2><div className="form-grid">{children}</div></article><Results>{results}</Results></section>; }

type TaxRegime = "new" | "old";
type AgeBand = "regular" | "senior" | "superSenior";

const newRegimeSlabs: Array<[number, number]> = [[400000, 0], [800000, .05], [1200000, .1], [1600000, .15], [2000000, .2], [2400000, .25], [Infinity, .3]];
const oldRegimeSlabs: Record<AgeBand, Array<[number, number]>> = {
  regular: [[250000, 0], [500000, .05], [1000000, .2], [Infinity, .3]],
  senior: [[300000, 0], [500000, .05], [1000000, .2], [Infinity, .3]],
  superSenior: [[500000, 0], [1000000, .2], [Infinity, .3]]
};

function slabTax(income: number, slabs: Array<[number, number]>) { let previous = 0, tax = 0; for (const [limit, rate] of slabs) { tax += Math.max(0, Math.min(income, limit) - previous) * rate; previous = limit; if (income <= limit) break; } return tax; }
function cap(value: number, limit: number) { return Math.min(Math.max(value, 0), limit); }
function surchargeRate(income: number, regime: TaxRegime) { if (income > 50000000) return regime === "old" ? .37 : .25; if (income > 20000000) return .25; if (income > 10000000) return .15; if (income > 5000000) return .1; return 0; }
function taxBeforeCess(taxable: number, regime: TaxRegime, age: AgeBand) {
  const baseTax = slabTax(taxable, regime === "new" ? newRegimeSlabs : oldRegimeSlabs[age]);
  const rebateLimit = regime === "new" ? 1200000 : 500000;
  const rebateCap = regime === "new" ? 60000 : 12500;
  const rebate = taxable <= rebateLimit ? Math.min(baseTax, rebateCap) : 0;
  const taxAfterRebate = Math.max(0, baseTax - rebate);
  return { baseTax, rebate, taxAfterRebate };
}
function taxWithSurchargeRelief(taxable: number, regime: TaxRegime, age: AgeBand) {
  const { baseTax, rebate, taxAfterRebate } = taxBeforeCess(taxable, regime, age);
  const rate = surchargeRate(taxable, regime);
  let taxPlusSurcharge = taxAfterRebate * (1 + rate);
  const thresholds = regime === "old" ? [5000000, 10000000, 20000000, 50000000] : [5000000, 10000000, 20000000];
  for (const threshold of thresholds) {
    if (taxable > threshold) {
      const thresholdTax = taxBeforeCess(threshold, regime, age).taxAfterRebate;
      const thresholdTotal = thresholdTax * (1 + surchargeRate(threshold, regime));
      taxPlusSurcharge = Math.min(taxPlusSurcharge, thresholdTotal + taxable - threshold);
    }
  }
  const surcharge = Math.max(0, taxPlusSurcharge - taxAfterRebate);
  const cess = taxPlusSurcharge * .04;
  return { taxable, baseTax, rebate, surcharge, cess, total: taxPlusSurcharge + cess };
}

export function IncomeTaxCalculatorPage() {
  const [salary, setSalary] = useState(""), [otherIncome, setOtherIncome] = useState(""), [age, setAge] = useState<AgeBand>("regular");
  const [hra, setHra] = useState(""), [section80C, setSection80C] = useState(""), [npsSelf, setNpsSelf] = useState(""), [medical, setMedical] = useState("");
  const [homeLoan, setHomeLoan] = useState(""), [otherOldDeductions, setOtherOldDeductions] = useState(""), [employerNps, setEmployerNps] = useState("");
  const gross = n(salary) + n(otherIncome);
  const employerNpsAllowed = cap(n(employerNps), n(salary) * .14);
  const oldDeductions = 50000 + n(hra) + cap(n(section80C), 150000) + cap(n(npsSelf), 50000) + cap(n(medical), 100000) + cap(n(homeLoan), 200000) + n(otherOldDeductions) + employerNpsAllowed;
  const newDeductions = 75000 + employerNpsAllowed;
  const oldTax = taxWithSurchargeRelief(Math.max(0, gross - oldDeductions), "old", age);
  const newTax = taxWithSurchargeRelief(Math.max(0, gross - newDeductions), "new", age);
  const better = newTax.total <= oldTax.total ? "New regime" : "Old regime";
  return <section className="calculator-grid"><article className="panel"><h2 className="panel-title">Income & deductions</h2><div className="form-grid"><Field label="Annual salary / pension" value={salary} set={setSalary} /><Field label="Other taxable income" value={otherIncome} set={setOtherIncome} /><label className="field"><span>Age category</span><div className="segmented-control"><button className={"segment " + (age === "regular" ? "active" : "")} onClick={() => setAge("regular")} type="button">Below 60</button><button className={"segment " + (age === "senior" ? "active" : "")} onClick={() => setAge("senior")} type="button">60-79</button><button className={"segment " + (age === "superSenior" ? "active" : "")} onClick={() => setAge("superSenior")} type="button">80+</button></div></label><Field label="HRA / other salary exemptions" value={hra} set={setHra} /><Field label="80C investments" value={section80C} set={setSection80C} /><Field label="NPS self 80CCD(1B)" value={npsSelf} set={setNpsSelf} /><Field label="80D medical insurance" value={medical} set={setMedical} /><Field label="Home loan interest" value={homeLoan} set={setHomeLoan} /><Field label="Other old-regime deductions" value={otherOldDeductions} set={setOtherOldDeductions} /><Field label="Employer NPS contribution" value={employerNps} set={setEmployerNps} /><div className="calculator-note">AY 2026-27 estimate for resident individuals. New regime uses ₹4L/₹8L/₹12L/₹16L/₹20L/₹24L slabs, ₹75,000 salary standard deduction, ₹60,000 rebate up to ₹12L taxable income, surcharge and 4% cess. Old regime includes common deductions only; special-rate income such as capital gains is not included.</div></div></article><Results><Result label="New-regime tax" value={rupees(newTax.total)} /><Result label="Old-regime tax" value={rupees(oldTax.total)} /><Result label="Better option" value={better} /><Result label="Estimated saving" value={rupees(Math.abs(newTax.total - oldTax.total))} /><Result label="New taxable income" value={rupees(newTax.taxable)} /><Result label="Old taxable income" value={rupees(oldTax.taxable)} /><Result label="New rebate" value={rupees(newTax.rebate)} /><Result label="Old rebate" value={rupees(oldTax.rebate)} /><Result label="New surcharge + cess" value={rupees(newTax.surcharge + newTax.cess)} /><Result label="Old surcharge + cess" value={rupees(oldTax.surcharge + oldTax.cess)} /></Results></section>;
}

export function SalaryCalculatorPage() {
  const [ctc, setCtc] = useState(""), [basicPct, setBasicPct] = useState(""), [deduction, setDeduction] = useState("");
  const c = n(ctc), pf = Math.min(c * n(basicPct) / 100, 180000) * .12, take = c - pf - n(deduction);
  return <Layout title="Salary structure" results={<><Result label="Monthly take-home*" value={rupees(take / 12)} /><Result label="Employee PF estimate" value={rupees(pf)} /><Result label="Annual take-home*" value={rupees(take)} /><Result label="Monthly CTC" value={rupees(c / 12)} /></>}><Field label="Annual CTC" value={ctc} set={setCtc} /><Field label="Basic salary share" suffix="%" value={basicPct} set={setBasicPct} /><Field label="Other annual deductions" value={deduction} set={setDeduction} /></Layout>;
}

export function LumpsumCalculatorPage() {
  const [amount, setAmount] = useState(""), [rate, setRate] = useState(""), [years, setYears] = useState(""); const invested = n(amount), future = invested * (1 + n(rate) / 100) ** n(years);
  return <Layout title="One-time investment" results={<><Result label="Future value" value={rupees(future)} /><Result label="Amount invested" value={rupees(invested)} /><Result label="Estimated gains" value={rupees(future - invested)} /></>}><Field label="Investment amount" value={amount} set={setAmount} /><Field label="Expected annual return" suffix="%" value={rate} set={setRate} /><Field label="Investment duration" suffix="years" value={years} set={setYears} /></Layout>;
}

export function PpfEpfCalculatorPage() {
  const [contribution, setContribution] = useState(""), [rate, setRate] = useState(""), [years, setYears] = useState(""); const monthly = n(contribution), months = n(years) * 12, r = n(rate) / 1200, future = r ? monthly * (((1 + r) ** months - 1) / r) * (1 + r) : monthly * months;
  return <Layout title="PPF / EPF projection" results={<><Result label="Projected corpus" value={rupees(future)} /><Result label="Total contribution" value={rupees(monthly * months)} /><Result label="Estimated interest" value={rupees(future - monthly * months)} /></>}><Field label="Monthly contribution" value={contribution} set={setContribution} /><Field label="Annual interest rate" suffix="%" value={rate} set={setRate} /><Field label="Years invested" suffix="years" value={years} set={setYears} /></Layout>;
}

export function CreditCardEmiCalculatorPage() {
  const [purchase, setPurchase] = useState(""), [rate, setRate] = useState(""), [months, setMonths] = useState(""), [fee, setFee] = useState(""); const p = n(purchase), m = n(months), r = n(rate) / 1200, emi = m ? r ? p * r * (1 + r) ** m / ((1 + r) ** m - 1) : p / m : 0, total = emi * m + n(fee);
  return <Layout title="Card purchase to EMI" results={<><Result label="Monthly EMI" value={rupees(emi)} /><Result label="Total payable" value={rupees(total)} /><Result label="Interest + fee" value={rupees(total - p)} /></>}><Field label="Purchase amount" value={purchase} set={setPurchase} /><Field label="Annual interest rate" suffix="%" value={rate} set={setRate} /><Field label="Tenure" suffix="months" value={months} set={setMonths} /><Field label="Processing fee" value={fee} set={setFee} /></Layout>;
}

export function RentBuyCalculatorPage() {
  const [price, setPrice] = useState(""), [rent, setRent] = useState(""), [years, setYears] = useState(""), [growth, setGrowth] = useState(""); const y = n(years), g = n(growth) / 100, future = n(price) * (1 + g) ** y, rentTotal = Array.from({ length: y }, (_, i) => n(rent) * 12 * (1 + g) ** i).reduce((a, b) => a + b, 0);
  return <Layout title="Compare a home decision" results={<><Result label="Future home value" value={rupees(future)} /><Result label="Total rent paid" value={rupees(rentTotal)} /><Result label="Value growth" value={rupees(future - n(price))} /><Result label="Perspective" value="Excludes loan & upkeep" /></>}><Field label="Home price today" value={price} set={setPrice} /><Field label="Monthly rent today" value={rent} set={setRent} /><Field label="Comparison period" suffix="years" value={years} set={setYears} /><Field label="Annual price / rent growth" suffix="%" value={growth} set={setGrowth} /></Layout>;
}

export function InflationCalculatorPage() {
  const [amount, setAmount] = useState(""), [rate, setRate] = useState(""), [years, setYears] = useState(""); const today = n(amount), future = today * (1 + n(rate) / 100) ** n(years);
  return <Layout title="Future purchasing power" results={<><Result label="Amount needed then" value={rupees(future)} /><Result label="Today's buying power then" value={rupees(today * today / future)} /><Result label="Increase needed" value={rupees(future - today)} /></>}><Field label="Amount today" value={amount} set={setAmount} /><Field label="Expected inflation" suffix="%" value={rate} set={setRate} /><Field label="Years ahead" suffix="years" value={years} set={setYears} /></Layout>;
}

export function FuelCostCalculatorPage() {
  const [distance, setDistance] = useState(""), [mileage, setMileage] = useState(""), [price, setPrice] = useState(""), [trips, setTrips] = useState(""); const litres = n(distance) / Math.max(n(mileage), 1), cost = litres * n(price);
  return <Layout title="Trip & monthly fuel spend" results={<><Result label="Fuel for one trip" value={shown(litres) + " L"} /><Result label="Cost per trip" value={rupees(cost)} /><Result label="Monthly estimate" value={rupees(cost * n(trips))} /></>}><Field label="Trip distance" suffix="km" value={distance} set={setDistance} /><Field label="Vehicle mileage" suffix="km/L" value={mileage} set={setMileage} /><Field label="Fuel price" suffix="₹ / L" value={price} set={setPrice} /><Field label="Trips each month" suffix="trips" value={trips} set={setTrips} /></Layout>;
}

export function SplitBillCalculatorPage() {
  const [bill, setBill] = useState(""), [people, setPeople] = useState(""), [tip, setTip] = useState(""), [tax, setTax] = useState(""); const base = n(bill), total = base * (1 + (n(tip) + n(tax)) / 100);
  return <Layout title="Share an expense fairly" results={<><Result label="Total bill" value={rupees(total)} /><Result label="Each person pays" value={rupees(total / Math.max(n(people), 1))} /><Result label="Tip + tax" value={rupees(total - base)} /></>}><Field label="Bill amount" value={bill} set={setBill} /><Field label="People sharing" suffix="people" value={people} set={setPeople} /><Field label="Tip" suffix="%" value={tip} set={setTip} /><Field label="Tax" suffix="%" value={tax} set={setTax} /></Layout>;
}

export function DateDifferenceCalculatorPage() {
  const [start, setStart] = useState(""), [end, setEnd] = useState(""); const a = new Date(start + "T00:00:00"), b = new Date(end + "T00:00:00"), rawDays = Math.round((b.getTime() - a.getTime()) / 86400000), days = Number.isFinite(rawDays) ? Math.max(0, rawDays) : 0; let work = 0; if (start && end) for (const d = new Date(a); d < b; d.setDate(d.getDate() + 1)) if (d.getDay() !== 0 && d.getDay() !== 6) work++;
  return <Layout title="Date difference" results={<><Result label="Calendar days" value={days + " days"} /><Result label="Working days*" value={work + " days"} /><Result label="Weeks" value={shown(days / 7)} /></>}><Field label="Start date" suffix="" type="date" value={start} set={setStart} /><Field label="End date" suffix="" type="date" value={end} set={setEnd} /></Layout>;
}

export function CalorieCalculatorPage() {
  const [weight, setWeight] = useState(""), [height, setHeight] = useState(""), [age, setAge] = useState(""), [sex, setSex] = useState("male"), [activity, setActivity] = useState(""); const bmr = Math.max(0, 10 * n(weight) + 6.25 * n(height) - 5 * n(age) + (sex === "male" ? 5 : -161)), maintenance = bmr * n(activity);
  return <Layout title="Daily calorie estimate" results={<><Result label="BMR (at rest)" value={rupees(bmr).replace("₹", "") + " kcal"} /><Result label="Maintain weight" value={rupees(maintenance).replace("₹", "") + " kcal"} /><Result label="Gentle loss target" value={rupees(Math.max(0, maintenance - 500)).replace("₹", "") + " kcal"} /></>}><Field label="Weight" suffix="kg" value={weight} set={setWeight} /><Field label="Height" suffix="cm" value={height} set={setHeight} /><Field label="Age" suffix="years" value={age} set={setAge} /><label className="field"><span>Sex</span><div className="segmented-control"><button className={"segment " + (sex === "male" ? "active" : "")} onClick={() => setSex("male")} type="button">Male</button><button className={"segment " + (sex === "female" ? "active" : "")} onClick={() => setSex("female")} type="button">Female</button></div></label><Field label="Activity multiplier" suffix="×" value={activity} set={setActivity} /></Layout>;
}

export function GstReverseCalculatorPage() {
  const [inclusive, setInclusive] = useState(""), [rate, setRate] = useState(""); const total = n(inclusive), base = total / (1 + n(rate) / 100), gst = total - base;
  return <Layout title="Remove GST from a price" results={<><Result label="Base price" value={rupees(base)} /><Result label="GST included" value={rupees(gst)} /><Result label="CGST / SGST share" value={rupees(gst / 2) + " each"} /></>}><Field label="Price including GST" value={inclusive} set={setInclusive} /><Field label="GST rate" suffix="%" value={rate} set={setRate} /></Layout>;
}
