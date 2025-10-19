
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { v4 as uuid } from "uuid"; // We'll polyfill uuid ourselves since not installed; replace with simple helper.
import { ChefHat, Timer as TimerIcon, Users, MessageSquare, Trophy, Swords, Mic, Video, Vote, Tv, Globe2, Headphones, Shield, Settings, Coins, Gift, Clock } from "lucide-react";
import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, Badge, Tabs, TabsList, TabsTrigger, TabsContent, Switch, Checkbox, Progress, Separator } from "@/components/ui/ui";

// Polyfill a tiny uuid substitute (not RFC—just for demo)
function uid(){ return Math.random().toString(36).slice(2) + Date.now().toString(36); }

type Role = "chef" | "contestant" | "judge" | "spectator";

type User = {
  id: string;
  name: string;
  role: Role | null;
  familyMode: boolean;
  avatar: string;
};

type Challenge = {
  id: string;
  title: string;
  type: "dish" | "buffet" | "banquet" | "hospitality";
  skill: "prep" | "cook" | "plating" | "service" | "management";
  minutes: number;
  points: number;
  description: string;
};

const CHALLENGES: Challenge[] = [
  { id: "c1", title: "Two-Pan Omelet Showdown", type: "dish", skill: "cook", minutes: 8, points: 100, description: "Chef guides steps; contestant executes fluffy omelet with 2 fillings." },
  { id: "c2", title: "Kid-Friendly Fruit Platter Art", type: "buffet", skill: "plating", minutes: 10, points: 120, description: "Compose a rainbow platter. Family Mode preset." },
  { id: "c3", title: "Express Sandwich Bar for 12", type: "hospitality", skill: "service", minutes: 12, points: 160, description: "Set up a mini station with allergen tags and one hot item." },
  { id: "c4", title: "Banquet Timing Orchestrator", type: "banquet", skill: "management", minutes: 18, points: 220, description: "Apps → mains → dessert; hit the cadence." },
];

const randomAvatar = (name: string) => name.slice(0, 2).toUpperCase();

function useInterval(callback: () => void, delay: number | null) {
  const saved = useRef(callback);
  useEffect(()=>{ saved.current = callback; }, [callback]);
  useEffect(()=>{
    if(delay===null) return;
    const id = setInterval(()=> saved.current(), delay);
    return ()=> clearInterval(id);
  }, [delay]);
}

function formatTime(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2,"0")}`;
}

const mockUsers: Record<string, User> = {};

const HeaderBar: React.FC<{ user: User | null; onSignOut: () => void }>= ({ user, onSignOut }) => {
  return (
    <div className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChefHat className="h-6 w-6" />
          <span className="font-bold text-lg">The Vicarious Chef</span>
          <Badge variant="secondary" className="ml-2">v0.1 Prototype</Badge>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">Ages 6+</Badge>
          {user && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-semibold">{user.avatar}</div>
              <span className="text-sm">{user.name}</span>
              <Button variant="secondary" onClick={onSignOut}>Sign out</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SignIn: React.FC<{ onComplete: (u: User) => void }> = ({ onComplete }) => {
  const [name, setName] = useState("");
  const [familyMode, setFamilyMode] = useState(true);
  return (
    <div className="max-w-xl mx-auto pt-10">
      <Card>
        <CardHeader>
          <CardTitle>Join the Kitchen</CardTitle>
          <CardDescription>Create a player to enter the lobby.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Display name</label>
            <Input placeholder="e.g., Chef Luna" value={name} onChange={(e)=>setName(e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium">Family Mode</div>
              <p className="text-xs text-slate-500">Chat filter on, voice off by default, camera blur allowed.</p>
            </div>
            <Switch checked={familyMode} onCheckedChange={setFamilyMode} />
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <div className="text-xs text-slate-500">By continuing you agree to House Rules.</div>
          <Button disabled={!name.trim()} onClick={()=>{
            const u: User = { id: uid(), name: name.trim(), role: null, familyMode, avatar: randomAvatar(name) };
            mockUsers[u.id] = u;
            onComplete(u);
          }}>Enter Lobby</Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const Lobby: React.FC<{ user: User; onJoin: (role: Role, room: string, shamony: boolean) => void }> = ({ user, onJoin }) => {
  const [roomCode, setRoomCode] = useState<string>("KITCHEN-101");
  const [role, setRole] = useState<Role>("chef");
  const [shamony, setShamony] = useState(false);
  const [autoMatch, setAutoMatch] = useState(true);
  return (
    <div className="max-w-6xl mx-auto p-4 grid md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Lobby</CardTitle>
          <CardDescription>Pick a role, choose a room, and jump into the show.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Room Code</label>
              <Input value={roomCode} onChange={(e)=>setRoomCode(e.target.value)} />
              <p className="text-xs text-slate-500">Share this with friends or use auto-match to find a table.</p>
              <div className="flex items-center gap-2 mt-1">
                <Checkbox defaultChecked={autoMatch} />
                <span className="text-xs">Auto-match teammates/opponents</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Checkbox defaultChecked={shamony} />
                <span className="text-xs">Enable <strong>Shamony Mode</strong> (multiplayer teams)</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Choose Role</label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant={role==="chef"?"default":"outline"} onClick={()=>setRole("chef")} className="justify-start"><ChefHat className="mr-2 h-4 w-4"/>Chef</Button>
                <Button variant={role==="contestant"?"default":"outline"} onClick={()=>setRole("contestant")} className="justify-start"><Swords className="mr-2 h-4 w-4"/>Contestant</Button>
                <Button variant={role==="judge"?"default":"outline"} onClick={()=>setRole("judge")} className="justify-start"><Vote className="mr-2 h-4 w-4"/>Judge</Button>
                <Button variant={role==="spectator"?"default":"outline"} onClick={()=>setRole("spectator")} className="justify-start"><Tv className="mr-2 h-4 w-4"/>Spectator</Button>
              </div>
            </div>
          </div>
          <Separator/>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Badge>Chef</Badge>
              <Badge>Contestant</Badge>
              <Badge>Judge</Badge>
              <Badge>Spectator</Badge>
            </div>
            <Button onClick={()=>onJoin(role, roomCode || "KITCHEN-101", shamony)}>
              Join Room
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>House Rules</CardTitle>
          <CardDescription>Safety-first, fun-always.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <div className="flex items-center gap-2"><Shield className="h-4 w-4"/> Be kind; zero harassment.</div>
          <div className="flex items-center gap-2"><Mic className="h-4 w-4"/> Voice is off by default for <strong>under 13</strong>.</div>
          <div className="flex items-center gap-2"><MessageSquare className="h-4 w-4"/> Chat is filtered in Family Mode.</div>
          <div className="flex items-center gap-2"><Globe2 className="h-4 w-4"/> Live content may be simulcast; consent required.</div>
          <div className="flex items-center gap-2"><Headphones className="h-4 w-4"/> Contestants wear headsets for chef guidance.</div>
        </CardContent>
      </Card>

      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Now Trending Challenges</CardTitle>
          <CardDescription>Picked via online requests and event queue.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-4">
          {CHALLENGES.map(c => (
            <div key={c.id} className="p-3 border rounded-xl">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{c.type}</Badge>
                <Badge variant="outline">{c.skill}</Badge>
              </div>
              <div className="mt-2 font-semibold">{c.title}</div>
              <div className="text-xs text-slate-500 mt-1">{c.description}</div>
              <div className="flex items-center justify-between mt-3 text-xs">
                <div className="flex items-center gap-1"><Clock className="h-3 w-3"/> {c.minutes} min</div>
                <div className="flex items-center gap-1"><Trophy className="h-3 w-3"/> {c.points} pts</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

type Team = {
  id: string;
  name: string;
  chefs: User[];
  contestants: User[];
  score: number;
};

type VoteTally = { taste: number; technique: number; timing: number; presentation: number };
const defaultVote: VoteTally = { taste: 0, technique: 0, timing: 0, presentation: 0 };

function FakeStreamPanel({ title, muted }:{title:string; muted?:boolean}){
  return (
    <div className="relative aspect-video w-full rounded-xl border bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-sm text-slate-500">{title} Stream {muted?"(muted)":""}</div>
      <div className="absolute bottom-2 right-2 flex gap-2 opacity-80">
        <Button size="icon" variant="secondary"><Video className="h-4 w-4"/></Button>
        <Button size="icon" variant="secondary"><Mic className="h-4 w-4"/></Button>
      </div>
    </div>
  );
}

function TimerBar({ seconds, total, onComplete }:{seconds:number; total:number; onComplete:()=>void}){
  useEffect(()=>{ if(seconds<=0) onComplete(); }, [seconds, onComplete]);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs"><span>Time Left</span><span>{formatTime(seconds)}</span></div>
      <Progress value={(seconds/total)*100} />
    </div>
  );
}

function ScorePanel({ score, coins, gifts }:{score:number; coins:number; gifts:number}){
  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><Trophy className="h-4 w-4"/> Score</CardTitle><CardDescription>Points, coins, and gifts</CardDescription></CardHeader>
      <CardContent className="grid grid-cols-3 gap-2 text-center">
        <div><div className="text-2xl font-bold">{score}</div><div className="text-xs text-slate-500">points</div></div>
        <div><div className="text-2xl font-bold">{coins}</div><div className="text-xs text-slate-500 flex items-center justify-center gap-1"><Coins className="h-3 w-3"/> coins</div></div>
        <div><div className="text-2xl font-bold">{gifts}</div><div className="text-xs text-slate-500 flex items-center justify-center gap-1"><Gift className="h-3 w-3"/> gifts</div></div>
      </CardContent>
    </Card>
  );
}

function ChallengePicker({ onPick }:{onPick:(c:Challenge)=>void}){
  const [choice, setChoice] = useState<string>(CHALLENGES[0].id);
  const cur = CHALLENGES.find(c=>c.id===choice)!;
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Challenge Queue</CardTitle><CardDescription>Chosen via online requests</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <select className="w-full border rounded-md p-2" value={choice} onChange={(e)=>setChoice(e.target.value)}>
          {CHALLENGES.map(c=>(<option key={c.id} value={c.id}>{c.title} • {c.minutes}m/{c.points}pts</option>))}
        </select>
        <div className="text-xs text-slate-500">{cur.description}</div>
        <Button onClick={()=>onPick(cur)}>Start Challenge</Button>
      </CardContent>
    </Card>
  );
}

function VotingPanel({ onVote }:{ onVote:(v:VoteTally)=>void }){
  const [taste, setTaste] = useState(3);
  const [technique, setTechnique] = useState(3);
  const [timing, setTiming] = useState(3);
  const [presentation, setPresentation] = useState(3);
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Judge Vote</CardTitle><CardDescription>Score each category (0–5)</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        {[["Taste",taste,setTaste],["Technique",technique,setTechnique],["Timing",timing,setTiming],["Presentation",presentation,setPresentation]].map(([label,value,setter]: any)=>(
          <div key={label as string}>
            <div className="flex items-center justify-between text-sm"><span>{label as string}</span><span>{value as number}</span></div>
            <input type="range" min={0} max={5} step={1} value={value as number} onChange={(e)=> (setter as any)(parseInt(e.target.value))} className="w-full" />
          </div>
        ))}
        <Button onClick={()=>onVote({ taste, technique, timing, presentation })}>Submit Vote</Button>
      </CardContent>
    </Card>
  );
}

function TeamRoster({ team }:{team:Team}){
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{team.name}</CardTitle><CardDescription>Roster</CardDescription></CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs font-medium">Chefs</div>
        <div className="flex flex-wrap gap-2">
          {team.chefs.map(u=> <Badge key={u.id} variant="secondary">👨‍🍳 {u.name}</Badge>)}
        </div>
        <div className="text-xs font-medium mt-2">Contestants</div>
        <div className="flex flex-wrap gap-2">
          {team.contestants.map(u=> <Badge key={u.id} variant="outline">⚔️ {u.name}</Badge>)}
        </div>
        <div className="mt-3 text-xs text-slate-500">Score: {team.score}</div>
      </CardContent>
    </Card>
  );
}

function ChatBox({ familyMode, disabled }:{familyMode:boolean; disabled?: boolean;}){
  const [lines, setLines] = useState<string[]>(["Welcome to The Vicarious Chef!"]);
  const [msg, setMsg] = useState("");
  const filter = (s: string) => familyMode ? s.replace(/\b(damn|hell)\b/gi, "***") : s;
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Room Chat</CardTitle><CardDescription>Family filter: {familyMode?"ON":"OFF"}</CardDescription></CardHeader>
      <CardContent className="flex flex-col h-64">
        <div className="flex-1 overflow-auto space-y-1 pr-1">
          {lines.map((l,i)=>(<div key={i} className="text-sm">{l}</div>))}
        </div>
        <div className="pt-2 flex gap-2">
          <Input value={msg} onChange={(e)=>setMsg(e.target.value)} placeholder={disabled?"Chat disabled":"Type a message"} />
          <Button disabled={!msg.trim()||disabled} onClick={()=>{ setLines([...lines, filter(msg.trim())]); setMsg(""); }}>Send</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function GameRoom({ user, room, shamony, leave }:{ user:User; room:string; shamony:boolean; leave:()=>void }){
  const [teamA, setTeamA] = useState<Team>({ id: "A", name: "Team Basil", chefs: [], contestants: [], score: 0 });
  const [teamB, setTeamB] = useState<Team>({ id: "B", name: "Team Thyme", chefs: [], contestants: [], score: 0 });
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [seconds, setSeconds] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [coins, setCoins] = useState(0);
  const [gifts, setGifts] = useState(0);
  const [votes, setVotes] = useState<{A: VoteTally; B: VoteTally}>({ A: { ...defaultVote }, B: { ...defaultVote } });

  useEffect(()=>{
    if (user.role === "chef") setTeamA(t=>({...t, chefs:[...t.chefs, user]}));
    if (user.role === "contestant") setTeamB(t=>({...t, contestants:[...t.contestants, user]}));
  }, [user]);

  useInterval(()=>{ if(seconds>0) setSeconds(s=>s-1); }, seconds>0?1000:null);

  const start = (c: Challenge) => { setChallenge(c); setSeconds(c.minutes*60); setTotal(c.minutes*60); };
  const handleVote = (team: "A"|"B", v: VoteTally) => {
    setVotes(prev=>({ ...prev, [team]: {
      taste: Math.min(50, prev[team].taste + v.taste),
      technique: Math.min(50, prev[team].technique + v.technique),
      timing: Math.min(50, prev[team].timing + v.timing),
      presentation: Math.min(50, prev[team].presentation + v.presentation),
    }}));
  };
  const finalize = () => {
    if (!challenge) return;
    const scoreA = votes.A.taste + votes.A.technique + votes.A.timing + votes.A.presentation;
    const scoreB = votes.B.taste + votes.B.technique + votes.B.timing + votes.B.presentation;
    setTeamA(t=>({...t, score: t.score + scoreA }));
    setTeamB(t=>({...t, score: t.score + scoreB }));
    setCoins(c=>c + Math.round((scoreA+scoreB)/10));
    setGifts(g=>g + (scoreA>scoreB?1:0));
    setChallenge(null); setSeconds(0); setTotal(0);
  };

  const [tab, setTab] = useState("chef");

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline">Room</Badge>
          <div className="font-mono text-sm">{room}</div>
          {shamony && <Badge className="ml-2">Shamony Mode</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={leave}>Leave Room</Button>
          <Button variant="outline"><Settings className="h-4 w-4 mr-1"/> Settings</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <FakeStreamPanel title="Chef Console – Guidance Feed" />
            <FakeStreamPanel title="Contestant POV – Headset Cam" />
          </div>

          <div>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <button onClick={()=>setTab("chef")} className={`px-3 py-2 rounded ${tab==="chef"?"bg-white border shadow":"text-slate-600"}`}>Chef</button>
                <button onClick={()=>setTab("contestant")} className={`px-3 py-2 rounded ${tab==="contestant"?"bg-white border shadow":"text-slate-600"}`}>Contestant</button>
                <button onClick={()=>setTab("judge")} className={`px-3 py-2 rounded ${tab==="judge"?"bg-white border shadow":"text-slate-600"}`}>Judge</button>
                <button onClick={()=>setTab("spectator")} className={`px-3 py-2 rounded ${tab==="spectator"?"bg-white border shadow":"text-slate-600"}`}>Spectator</button>
              </TabsList>
              <div className="mt-3">
                {tab==="chef" && (
                  <Card>
                    <CardHeader><CardTitle className="text-base">Culinary Management Station</CardTitle><CardDescription>Type + talk the play-by-play.</CardDescription></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="p-3 border rounded-xl">
                          <div className="text-sm font-medium mb-2">Guidance Macros</div>
                          <div className="flex flex-wrap gap-2 text-xs">
                            {["Mise en place","Heat pan low","Add oil","Fold gently","Taste & adjust","Sanitize station"].map(m=> (
                              <Button key={m} size="sm" variant="secondary">{m}</Button>
                            ))}
                          </div>
                        </div>
                        <div className="p-3 border rounded-xl">
                          <div className="text-sm font-medium mb-2">Checklists</div>
                          <ul className="text-sm list-disc ml-5 space-y-1">
                            <li>Allergens confirmed</li>
                            <li>Timers set</li>
                            <li>Knife safety brief</li>
                            <li>Handwash before plating</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {tab==="contestant" && (
                  <Card>
                    <CardHeader><CardTitle className="text-base">Action Contestant Console</CardTitle><CardDescription>Follow chef commands and mark steps done.</CardDescription></CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid md:grid-cols-2 gap-2 text-sm">
                        <label className="flex items-center gap-2"><Checkbox defaultChecked/> Apron & gloves on</label>
                        <label className="flex items-center gap-2"><Checkbox/> Ingredients checked</label>
                        <label className="flex items-center gap-2"><Checkbox/> Pan preheated</label>
                        <label className="flex items-center gap-2"><Checkbox/> Station sanitized</label>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {tab==="judge" && (
                  <div className="grid md:grid-cols-2 gap-3">
                    <VotingPanel onVote={(v)=>handleVote("A", v)} />
                    <VotingPanel onVote={(v)=>handleVote("B", v)} />
                  </div>
                )}
                {tab==="spectator" && (
                  <Card>
                    <CardHeader><CardTitle className="text-base">Audience Voting</CardTitle><CardDescription>Real-time or replay voting.</CardDescription></CardHeader>
                    <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
                      <Button variant="outline">Vote ❤ Team Basil</Button>
                      <Button variant="outline">Vote ⭐ Team Thyme</Button>
                      <p className="sm:col-span-2 text-xs text-slate-500">Simulcast enabled rooms appear on the Live page for replay and vote-after broadcasts.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </Tabs>
          </div>
        </div>

        <div className="space-y-4">
          <ScorePanel score={(teamA.score+teamB.score)} coins={coins} gifts={gifts} />
          <Card>
            <CardHeader><CardTitle className="text-base">Match Timer</CardTitle><CardDescription>Based on challenge time → rewards</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {challenge ? (
                <>
                  <div className="text-sm"><span className="font-medium">{challenge.title}</span> • {challenge.minutes} min • {challenge.points} pts</div>
                  <TimerBar seconds={seconds} total={total} onComplete={finalize} />
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={()=>setSeconds(s=>Math.max(0,s-10))}>-10s</Button>
                    <Button variant="outline" onClick={()=>setSeconds(s=>s+10)}>+10s</Button>
                    <Button variant="destructive" onClick={finalize}>End & Score</Button>
                  </div>
                </>
              ) : (
                <div className="text-sm text-slate-500">No active challenge.</div>
              )}
            </CardContent>
          </Card>
          <ChallengePicker onPick={start} />
          <TeamRoster team={teamA} />
          <TeamRoster team={teamB} />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <ChatBox familyMode={user.familyMode} />
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base">Judge Tallies</CardTitle><CardDescription>Aggregated across panel</CardDescription></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[{k:"A",label:"Team Basil"}, {k:"B",label:"Team Thyme"}].map(({k,label})=> (
              <div key={k} className="p-2 border rounded-xl">
                <div className="font-medium">{label}</div>
                <div className="grid grid-cols-4 gap-2 text-xs mt-1">
                  <div>Taste: {(votes as any)[k].taste}</div>
                  <div>Technique: {(votes as any)[k].technique}</div>
                  <div>Timing: {(votes as any)[k].timing}</div>
                  <div>Presentation: {(votes as any)[k].presentation}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function VicariousChefPage(){
  const [user, setUser] = useState<User | null>(null);
  const [room, setRoom] = useState<string | null>(null);
  const [shamony, setShamony] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <HeaderBar user={user} onSignOut={()=>{ setUser(null); setRoom(null); }} />
      {!user ? (
        <SignIn onComplete={(u)=>setUser(u)} />
      ) : !room ? (
        <Lobby user={user} onJoin={(role, r, s)=>{ setUser({...user, role}); setRoom(r); setShamony(s); }} />
      ) : (
        <GameRoom user={user} room={room!} shamony={shamony} leave={()=>setRoom(null)} />
      )}
      <footer className="text-center text-xs text-slate-500 py-6">
        © {new Date().getFullYear()} The Vicarious Chef · Prototype UI · No real data stored · <Link href="/">Home</Link>
      </footer>
    </div>
  );
}
