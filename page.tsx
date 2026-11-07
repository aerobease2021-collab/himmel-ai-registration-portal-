 "use client";

import { useState } from "react";
import { ArrowRight, Building2, Globe2, Languages, ShieldCheck, Users, CheckCircle2, UploadCloud, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Kind = "vendor" | "freelancer";
const services = ["AI Data Collection", "AI Training & Data Annotation", "Localization & Translation", "Transcription", "Voice Recording & Dubbing", "Staffing & Recruitment", "EdTech", "Linguistic QA & Testing", "Other"];
const languages = ["Hindi", "Bengali", "Gujarati", "Punjabi", "Marathi", "Tamil", "Telugu", "Kannada", "Malayalam", "Urdu", "Assamese", "Nepali", "Sinhala", "Sindhi", "English", "Other"];

export default function Home() {
  const [kind, setKind] = useState<Kind>("vendor");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formElement = e.currentTarget;
    setError(""); setSuccess("");
    if (!supabase) { setError("Portal setup is incomplete. Please configure the Supabase environment variables."); return; }
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const name = String(form.get("contact_name") || "").trim();
    if (!email || !name) { setError("Please complete all required fields."); return; }
    if (kind === "freelancer" && !file) { setError("Please upload your CV or portfolio document."); return; }
    if (kind === "vendor" && !file) { setError("Please upload your company profile."); return; }
    setBusy(true);
    try {
      const ext = file!.name.split(".").pop()?.toLowerCase() || "pdf";
      const safeName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
      const path = `${kind}/${safeName}`;
      const { error: uploadError } = await supabase.storage.from("registration-documents").upload(path, file!, { upsert: false });
      if (uploadError) throw uploadError;

      const payload = {
        type: kind,
        company_name: kind === "vendor" ? String(form.get("company_name") || "") : null,
        contact_name: name,
        email,
        phone: String(form.get("phone") || ""),
        country: String(form.get("country") || ""),
        website: String(form.get("website") || "") || null,
        services: form.getAll("services").map(String),
        languages: form.getAll("languages").map(String),
        experience: String(form.get("experience") || ""),
        capacity: String(form.get("capacity") || "") || null,
        availability: kind === "freelancer" ? String(form.get("availability") || "") : null,
        rate: kind === "freelancer" ? String(form.get("rate") || "") : null,
        document_path: path,
        notes: String(form.get("notes") || "") || null
      };
      const { error: insertError } = await supabase.from("registrations").insert(payload);
      if (insertError) {
        await supabase.storage.from("registration-documents").remove([path]);
        throw insertError;
      }
      setSuccess("Thank you! Your registration has been received. Our team will review your details and contact you if there is a suitable opportunity.");
      formElement.reset(); setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally { setBusy(false); }
  }

  return <main>
    <nav className="nav wrap">
      <a className="brand" href="#"><span className="brand-mark">H</span><span>HIMMEL <b>AI</b><small>BEYOND TECHNOLOGY. TOWARDS POSSIBILITIES.</small></span></a>
      <a className="nav-link" href="mailto:contacthimmelai@gmail.com">Contact us <ArrowRight size={15}/></a>
    </nav>
    <section className="hero wrap">
      <div className="eyebrow"><Sparkles size={14}/> PARTNER & TALENT NETWORK</div>
      <h1>Let’s build what’s<br/><em>possible, together.</em></h1>
      <p className="hero-copy">Join Himmel AI’s growing network of trusted business partners and skilled independent professionals powering the future of AI, language and technology.</p>
      <div className="trust-row"><span><ShieldCheck size={16}/> Secure registration</span><span><Globe2 size={16}/> Global opportunities</span><span><Users size={16}/> Growing network</span></div>
    </section>
    <section className="wrap registration">
      <div className="intro"><div className="eyebrow">GET STARTED</div><h2>Choose how you’d like<br/>to work with us.</h2><p>Select the registration type that best describes you.</p></div>
      <div className="choice-grid">
        <button className={`choice ${kind === "vendor" ? "selected" : ""}`} onClick={() => {setKind("vendor");setSuccess("");setError("");setFile(null);}}>
          <span className="choice-icon"><Building2/></span><span><b>Vendor / Company</b><small>For agencies, companies and service providers.</small></span><ArrowRight className="choice-arrow"/>
        </button>
        <button className={`choice ${kind === "freelancer" ? "selected" : ""}`} onClick={() => {setKind("freelancer");setSuccess("");setError("");setFile(null);}}>
          <span className="choice-icon"><Users/></span><span><b>Freelancer / Individual</b><small>For linguists, annotators and independent experts.</small></span><ArrowRight className="choice-arrow"/>
        </button>
      </div>
      <form className="form-card" onSubmit={submit}>
        <div className="form-head"><div><div className="eyebrow">{kind === "vendor" ? "BUSINESS PARTNER" : "INDEPENDENT PROFESSIONAL"}</div><h3>{kind === "vendor" ? "Vendor registration" : "Freelancer registration"}</h3><p>Fields marked with * are required.</p></div><span className="form-icon">{kind === "vendor" ? <Building2/> : <Users/>}</span></div>
        <div className="fields">
          {kind === "vendor" && <label>Company / Business name *<input name="company_name" required placeholder="Enter registered business name"/></label>}
          <label>{kind === "vendor" ? "Contact person name *" : "Full name *"}<input name="contact_name" required placeholder="Your full name"/></label>
          <label>Business / Personal email *<input name="email" type="email" required placeholder="name@example.com"/></label>
          <label>Phone / WhatsApp number *<input name="phone" required type="tel" placeholder="+91 00000 00000"/></label>
          <label>Country *<input name="country" required placeholder="Country of operation"/></label>
          {kind === "vendor" && <label>Company website<input name="website" type="url" placeholder="https://example.com"/></label>}
          <label className="full">Services / Skills *<span className="check-grid">{services.map(s=><span key={s}><input type="checkbox" name="services" value={s}/>{s}</span>)}</span></label>
          <label className="full">Languages supported / known<span className="check-grid">{languages.map(s=><span key={s}><input type="checkbox" name="languages" value={s}/>{s}</span>)}</span></label>
          <label>Relevant experience *<select name="experience" required defaultValue=""><option value="" disabled>Select experience</option><option>Fresher / New</option><option>Less than 1 year</option><option>1–3 years</option><option>3–5 years</option><option>5+ years</option></select></label>
          {kind === "vendor" ? <label>Team / Resource capacity<input name="capacity" placeholder="e.g. 50 linguists, 20 annotators"/></label> : <>
            <label>Availability *<select name="availability" required defaultValue=""><option value="" disabled>Select availability</option><option>Full-time</option><option>Part-time</option><option>Project-based</option><option>Weekends</option></select></label>
            <label>Expected rate<input name="rate" placeholder="e.g. ₹500/hour or negotiable"/></label>
          </>}
          <label className="full">Additional information<textarea name="notes" rows={4} placeholder="Tell us about your experience, capabilities, tools or past projects..."/></label>
          <label className="full upload"><span>{kind === "vendor" ? "Company profile / Capability deck *" : "CV / Resume / Portfolio *"}</span><span className="upload-box"><UploadCloud/><b>{file ? file.name : "Choose a document to upload"}</b><small>PDF, DOC or DOCX · Maximum 10 MB</small><input type="file" accept=".pdf,.doc,.docx" required onChange={e=>setFile(e.target.files?.[0] || null)}/></span></label>
        </div>
        <p className="privacy">By submitting, you confirm that the information provided is accurate and agree that Himmel AI may contact you regarding relevant business or project opportunities.</p>
        {error && <div className="alert error">{error}</div>}{success && <div className="alert success"><CheckCircle2/>{success}</div>}
        <button className="submit" type="submit" disabled={busy}>{busy ? "Submitting..." : "Submit registration"} <ArrowRight size={17}/></button>
      </form>
    </section>
    <footer className="footer"><div className="wrap footer-inner"><div className="brand footer-brand"><span className="brand-mark">H</span><span>HIMMEL <b>AI</b><small>BEYOND TECHNOLOGY. TOWARDS POSSIBILITIES.</small></span></div><span>© {new Date().getFullYear()} Himmel AI. All rights reserved.</span><a href="mailto:contacthimmelai@gmail.com">contacthimmelai@gmail.com</a></div></footer>
  </main>;
}