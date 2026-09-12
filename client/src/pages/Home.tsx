import { useMemo, useState } from "react";
import { ArrowUpRight, Check, Circle, MapPin, Phone, Search, ShieldCheck, Star, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type Doctor = { id: number; name: string; specialty: string; fee: number; clinic: string; address: string; rating: string | number; ratingCount: number; about: string; accent: string; available: boolean };

const initials = (name: string) => name.replace("Dr. ", "").split(" ").map(part => part[0]).slice(0, 2).join("");

export default function Home() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All specialties");
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyLocation, setEmergencyLocation] = useState("");
  const [emergencyNotes, setEmergencyNotes] = useState("");
  const query = trpc.doctors.list.useQuery({ search: search || undefined, specialty }, { refetchInterval: 10000 });
  const doctors = (query.data ?? []) as Doctor[];
  const specialties = useMemo(() => ["All specialties", ...Array.from(new Set(doctors.map(doctor => doctor.specialty)))], [doctors]);
  const bookMutation = trpc.appointments.create.useMutation();
  const paymentMutation = trpc.appointments.paymentLink.useMutation();
  const emergencyMutation = trpc.emergency.create.useMutation();

  const submitBooking = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!bookingDoctor) return;
    try {
      const appointment = await bookMutation.mutateAsync({ doctorId: bookingDoctor.id, patientName, patientEmail: patientEmail || undefined, date, time });
      const payment = await paymentMutation.mutateAsync({ appointmentId: appointment?.id ?? "pending", amount: bookingDoctor.fee, doctorName: bookingDoctor.name });
      toast.success("Appointment reserved — opening payment handoff");
      window.open(payment.uri, "_blank");
      setBookingDoctor(null);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to reserve appointment"); }
  };

  const submitEmergency = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const alert = await emergencyMutation.mutateAsync({ patientName: emergencyName || undefined, phone: emergencyPhone || undefined, location: emergencyLocation || undefined, notes: emergencyNotes || undefined });
      toast.success("Emergency alert logged — calling dispatch line");
      setEmergencyOpen(false);
      window.location.href = alert.callUri;
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to create emergency alert"); }
  };

  return <div className="site-shell">
    <header className="topbar"><a className="brand" href="#top"><span className="brand-spark">✦</span>pulse<span>care</span></a><nav><a href="#explore">Explore</a><a href="#how">How it works</a><button className="nav-alert" onClick={() => setEmergencyOpen(true)}>Emergency help</button></nav><button className="mobile-menu" aria-label="Open navigation">☰</button></header>
    <main id="top">
      <section className="hero container"><div className="hero-copy"><p className="eyebrow">A better way to feel better <span className="live-dot" /> realtime network</p><h1>Care that moves<br /><em>with you.</em></h1><p className="lede">Book trusted doctors, pay securely, and stay connected to care from the first search to the follow-up.</p><div className="searchbox"><Search size={20} /><input aria-label="Search doctors" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search specialty or doctor" /><select aria-label="Filter by specialty" value={specialty} onChange={event => setSpecialty(event.target.value)}>{specialties.map(item => <option key={item}>{item}</option>)}</select><button onClick={() => document.querySelector("#explore")?.scrollIntoView({ behavior: "smooth" })}>Find care <ArrowUpRight size={15} /></button></div><div className="hero-meta"><span><ShieldCheck size={14} /> 6,200+ verified doctors</span><span><Star size={14} /> Average 4.8 rating</span></div></div><div className="hero-art" aria-hidden="true"><div className="orb orb-a" /><div className="orb orb-b" /><div className="care-card card-back"><Zap size={22} /><strong>LIVE CARE</strong><small>Available now</small></div><div className="care-card card-front"><div className="mini-avatar">PS</div><div><strong>Dr. Priya Shah</strong><small>General physician</small></div><span className="available">●</span><div className="wave">⌁⌁⌁⌁</div></div><div className="float-pill pill-one">✚ 24/7 support</div><div className="float-pill pill-two">⌁ 12 min avg. reply</div></div></section>
      <section className="trust container"><span>Trusted care, designed around you</span><div><b>VITALIS</b><b>med<span>+</span></b><b>HEALIO</b><b>northstar health</b></div></section>
      <section id="explore" className="container doctors-section"><div className="section-head"><div><p className="eyebrow">Your care team</p><h2>Meet your <em>doctor.</em></h2></div><div className="realtime"><span className="pulse" /> Live availability <span>{query.isFetching ? "syncing" : "connected"}</span></div></div>{query.isLoading ? <div className="loading">Loading your care network…</div> : <div className="doctor-grid">{doctors.map(doctor => <article className="doctor-card" key={doctor.id}><div className="doctor-top"><div className="doctor-avatar" style={{ background: doctor.accent }}>{initials(doctor.name)}</div><div className="rating"><Star size={14} fill="currentColor" /> {Number(doctor.rating).toFixed(1)} <span>({doctor.ratingCount})</span></div></div><div className="specialty">{doctor.specialty}</div><h3>{doctor.name}</h3><p className="about">{doctor.about}</p><div className="clinic"><MapPin size={13} /> {doctor.clinic} · {doctor.address}</div><button className="book-btn" onClick={() => setBookingDoctor(doctor)}>Book ₹{doctor.fee} consultation <ArrowUpRight size={14} /></button></article>)}</div>}</section>
      <section id="how" className="how"><div><p className="eyebrow">Simple by design</p><h2>From search to <em>care.</em></h2></div><div className="steps"><div><span>01</span><h3>Discover</h3><p>Find specialists by expertise, rating, and real-time availability.</p></div><div><span>02</span><h3>Connect</h3><p>Choose a time that works and confirm in a few calm steps.</p></div><div><span>03</span><h3>Feel better</h3><p>Pay securely and keep your care journey in one place.</p></div></div></section>
    </main>
    <button className="emergency-fab" onClick={() => setEmergencyOpen(true)}><Phone size={20} /><div><b>Emergency?</b><small>Get immediate help</small></div></button>
    {bookingDoctor && <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal-card"><button className="close" onClick={() => setBookingDoctor(null)} aria-label="Close"><X /></button><p className="eyebrow">Secure appointment</p><h2>Book with <em>{bookingDoctor.name.split(" ")[1]}.</em></h2><p>{bookingDoctor.specialty} · {bookingDoctor.clinic}<br />Consultation fee: <strong>₹{bookingDoctor.fee}</strong></p><form className="form-stack" onSubmit={submitBooking}><label>Your name<input required value={patientName} onChange={event => setPatientName(event.target.value)} placeholder="Full name" /></label><label>Email for confirmation<input type="email" value={patientEmail} onChange={event => setPatientEmail(event.target.value)} placeholder="you@example.com" /></label><div className="form-row"><label>Date<input required type="date" value={date} onChange={event => setDate(event.target.value)} /></label><label>Time<input required type="time" value={time} onChange={event => setTime(event.target.value)} /></label></div><button className="primary" disabled={bookMutation.isPending || paymentMutation.isPending}>{bookMutation.isPending ? "Reserving…" : "Continue to secure payment ↗"}</button></form></div></div>}
    {emergencyOpen && <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal-card emergency-card"><button className="close" onClick={() => setEmergencyOpen(false)} aria-label="Close"><X /></button><p className="eyebrow">Priority response</p><h2>Get help <em>now.</em></h2><div className="emergency-callout"><strong>Call the hospital dispatch desk</strong><p>PulseCare will log your alert and open your phone dialer. Tell dispatch your location and request an ambulance.</p></div><form className="form-stack" onSubmit={submitEmergency}><label>Your name<input value={emergencyName} onChange={event => setEmergencyName(event.target.value)} placeholder="Optional" /></label><label>Phone number<input value={emergencyPhone} onChange={event => setEmergencyPhone(event.target.value)} placeholder="For dispatch callback" /></label><label>Location<input value={emergencyLocation} onChange={event => setEmergencyLocation(event.target.value)} placeholder="Address or landmark" /></label><label>What happened?<textarea rows={3} value={emergencyNotes} onChange={event => setEmergencyNotes(event.target.value)} placeholder="Brief description" /></label><button className="primary emergency-primary" disabled={emergencyMutation.isPending}><Phone size={15} /> {emergencyMutation.isPending ? "Creating alert…" : "Create alert & call dispatch"}</button></form></div></div>}
    <footer className="container footer"><a className="brand" href="#top">✦ pulse<span>care</span></a><span>Care, in every dimension.</span><span>© 2026 PulseCare</span></footer>
  </div>;
}
