 "use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LogOut, Download, RefreshCw } from "lucide-react";

type Registration = { id: string; created_at: string; type: string; company_name: string | null; contact_name: string; email: string; phone: string; country: string; services: string[]; languages: string[]; experience: string; document_path: string; status: string };
export default function Admin() {
  const [session, setSession] = useState<any>(null);
  const [rows, setRows] = useState<Registration[]>([]);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function load() {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.from("registrations").select("*").order("created_at", {ascending:false});
    if (error) setError(error.message); else setRows((data || []) as Registration[]);
    setLoading(false);
  }
  useEffect(() => { if (!supabase) return; supabase.auth.getSession().then(({data})=>setSession(data.session)); const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s)); return ()=>subscription.unsubscribe(); }, []);
  useEffect(() => { if (session) load(); }, [session]);
  async function login(e: React.FormEvent) { e.preventDefault(); if (!supabase) return; setError(""); const {data,error}=await supabase.auth.signInWithPassword({email,password}); if(error) setError(error.message); else setSession(data.session); }
  async function doc(path: string) { if(!supabase) return; const {data,error}=await supabase.storage.from("registration-documents").createSignedUrl(path,300); if(error) setError(error.message); else window.open(data.signedUrl,"_blank"); }
  async function status(id:string,value:string) { if(!supabase)return; const {error}=await supabase.from("registrations").update({status:value}).eq("id",id); if(error)setError(error.message); else load(); }
  if (!session) return <main className="admin-wrap"><form className="login-card" onSubmit={login}><div className="brand"><span className="brand-mark">H</span><span>HIMMEL <b>AI</b><small>ADMIN PORTAL</small></span></div><h1>Admin sign in</h1><p>Sign in with your authorized admin account.</p><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{error&&<div className="alert error">{error}</div>}<button className="submit">Sign in</button><a href="/">← Back to registration</a></form></main>;
  return <main className="admin-wrap"><div className="admin-top"><div className="brand"><span className="brand-mark">H</span><span>HIMMEL <b>AI</b><small>REGISTRATION ADMIN</small></span></div><button className="outline" onClick={()=>supabase?.auth.signOut()}><LogOut size={15}/> Sign out</button></div><section className="admin-content"><div className="admin-heading"><div><div className="eyebrow">SUBMISSIONS</div><h1>Registration dashboard</h1><p>Review vendor and freelancer applications.</p></div><button className="outline" onClick={load}><RefreshCw size={15}/> Refresh</button></div>{error&&<div className="alert error">{error}</div>}<div className="stats"><div><small>Total registrations</small><b>{rows.length}</b></div><div><small>Vendors</small><b>{rows.filter(r=>r.type==="vendor").length}</b></div><div><small>Freelancers</small><b>{rows.filter(r=>r.type==="freelancer").length}</b></div></div><div className="table-wrap"><table><thead><tr><th>Date</th><th>Type</th><th>Name / Company</th><th>Email</th><th>Country</th><th>Experience</th><th>Document</th><th>Status</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{new Date(r.created_at).toLocaleDateString()}</td><td>{r.type}</td><td>{r.contact_name}<small>{r.company_name}</small></td><td>{r.email}</td><td>{r.country}</td><td>{r.experience}</td><td><button className="doc-link" onClick={()=>doc(r.document_path)}><Download size={14}/> View</button></td><td><select value={r.status||"New"} onChange={e=>status(r.id,e.target.value)}><option>New</option><option>Reviewing</option><option>Shortlisted</option><option>Approved</option><option>Rejected</option></select></td></tr>)}</tbody></table>{!rows.length&&!loading&&<p className="empty">No registrations received yet.</p>}</div></section></main>;
}
