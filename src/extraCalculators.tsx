import { useState, type ReactNode } from "react";

const n = (v: string) => Number(v.replace(/,/g, "")) || 0;
const rupees = (v: number) => "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.max(0, Number.isFinite(v) ? v : 0));
const shown = (v: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(Number.isFinite(v) ? v : 0);
function Field({ label, value, set, suffix = "₹", type = "number" }: { label: string; value: string; set: (v: string) => void; suffix?: string; type?: string }) { return <label className="field"><span>{label}</span><div className="input-shell"><input inputMode="decimal" min="0" onChange={(e) => set(e.target.value)} placeholder={"Enter " + label.toLowerCase()} type={type} value={value} />{suffix && <small>{suffix}</small>}</div></label>; }
function Results({ children }: { children: ReactNode }) { return <article className="panel result-panel">{children}</article>; }
function Result({ label, value }: { label: string; value: string }) { return <div className="result-card"><span>{label}</span><strong>{value}</strong></div>; }
function Layout({ title, children, results }: { title: string; children: ReactNode; results: ReactNode }) { return <section className="calculator-grid"><article className="panel"><h2 className="panel-title">{title}</h2><div className="form-grid">{children}</div></article><Results>{results}</Results></section>; }

function slabTax(income: number, slabs: Array<[number, number]>) { let previous = 0, tax = 0; for (const [limit, rate] of slabs) { tax += Math.max(0, Math.min(income, limit) - previous) * rate; previous = limit; if (income <= limit) break; } return tax; }

export function IncomeTaxCalculatorPage() {
  const [income, setIncome] = useState(""), [deductions, setDeductions] = useState("");
  const gross = n(income), taxableNew = Math.max(0, gross - 75000), taxableOld = Math.max(0, gross - 50000 - n(deductions));
  const newBase = slabTax(taxableNew, [[400000, 0], [800000, .05], [1200000, .1], [1600000, .15], [2000000, .2], [2400000, .25], [Infinity, .3]]);
  const newRebate = taxableNew <= 1200000 ? Math.min(newBase, 60000) : Math.max(0, Math.min(60000, newBase - (taxableNew - 1200000)));
  const newTax = (newBase - newRebate) * 1.04, oldBase = slabTax(taxableOld, [[250000, 0], [500000, .05], [1000000, .2], [Infinity, .3]]), oldTax = (oldBase - (taxableOld <= 500000 ? Math.min(oldBase, 12500) : 0)) * 1.04;
  return <Layout title="Income & deductions" results={<><Result label="New-regime tax" value={rupees(newTax)} /><Result label="Old-regime tax" value={rupees(oldTax)} /><Result label="Better option" value={newTax <= oldTax ? "New regime" : "Old regime"} /><Result label="Estimated saving" value={rupees(Math.abs(newTax - oldTax))} /></>}><Field label="Annual gross income" value={income} set={setIncome} /><Field label="Old-regime deductions" value={deductions} set={setDeductions} /><div className="calculator-note">AY 2026–27 · resident, salary income. New regime includes ₹75,000 standard deduction, rebate and 4% cess.</div></Layout>;
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
