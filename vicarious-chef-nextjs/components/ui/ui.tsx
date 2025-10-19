// Lightweight UI primitives (Tailwind-only) to avoid external UI lib setup.
import React from "react";

export function Button({
  className = "",
  variant = "default",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "secondary" | "destructive";
  size?: "sm" | "md" | "icon";
}) {
  const base = "inline-flex items-center justify-center rounded-lg transition border";
  const variants: Record<string, string> = {
    default: "bg-black text-white border-black hover:opacity-90",
    outline: "bg-white text-black border-slate-300 hover:bg-slate-50",
    secondary: "bg-slate-100 text-slate-900 border-slate-200 hover:bg-slate-200",
    destructive: "bg-red-600 text-white border-red-700 hover:bg-red-700"
  };
  const sizes: Record<string,string> = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-2 text-sm",
    icon: "p-2"
  };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />;
}

export function Card({ className = "", children }: React.PropsWithChildren<{className?: string}>) {
  return <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>{children}</div>;
}

export function CardHeader({ className = "", children }: React.PropsWithChildren<{className?: string}>) {
  return <div className={`p-4 border-b border-slate-100 ${className}`}>{children}</div>;
}
export function CardTitle({ className = "", children }: React.PropsWithChildren<{className?: string}>) {
  return <div className={`font-semibold ${className}`}>{children}</div>;
}
export function CardDescription({ className = "", children }: React.PropsWithChildren<{className?: string}>) {
  return <div className={`text-sm text-slate-500 ${className}`}>{children}</div>;
}
export function CardContent({ className = "", children }: React.PropsWithChildren<{className?: string}>) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
export function CardFooter({ className = "", children }: React.PropsWithChildren<{className?: string}>) {
  return <div className={`p-4 border-t border-slate-100 ${className}`}>{children}</div>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300 ${props.className||""}`} />;
}

export function Badge({ children, className = "", variant="default" }:{children:React.ReactNode,className?:string,variant?: "default"|"secondary"|"outline"}){
  const variants: Record<string,string> = {
    default: "bg-black text-white border-black",
    secondary: "bg-slate-100 text-slate-900 border-slate-200",
    outline: "bg-white text-slate-900 border-slate-300"
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${variants[variant]} ${className}`}>{children}</span>;
}

export function Tabs({value, onValueChange, children}:{value:string, onValueChange:(v:string)=>void, children:React.ReactNode}){
  return <div data-tabs-value={value}>{children}</div>;
}
export function TabsList({children, className=""}:{children:React.ReactNode, className?:string}){
  return <div className={`rounded-lg bg-slate-100 p-1 ${className}`}>{children}</div>;
}
export function TabsTrigger({value, children, className="", active}:{value:string, children:React.ReactNode, className?:string, active:boolean}){
  return <button className={`px-3 py-1.5 text-sm rounded-md ${active?"bg-white shadow border":"text-slate-600"}`} onClick={()=>{}}>{children}</button>;
}
export function TabsContent({when, value, children, className=""}:{when:string,value:string,children:React.ReactNode,className?:string}){
  return when===value ? <div className={className}>{children}</div> : null;
}

export function Switch({checked, onCheckedChange}:{checked:boolean,onCheckedChange:(v:boolean)=>void}){
  return <button onClick={()=>onCheckedChange(!checked)} className={`w-10 h-6 rounded-full relative transition ${checked?"bg-black":"bg-slate-300"}`}>
    <span className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${checked?"right-0.5":"left-0.5"}`}/>
  </button>;
}

export function Checkbox({defaultChecked}:{defaultChecked?:boolean}){
  const [c,setC]=React.useState(!!defaultChecked);
  return <label className="inline-flex items-center gap-2"><input type="checkbox" checked={c} onChange={()=>setC(!c)}/></label>
}

export function Progress({value}:{value:number}){
  return <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-black" style={{width:`${value}%`}}/></div>;
}

export function Separator(){return <div className="h-px bg-slate-200"/>}
