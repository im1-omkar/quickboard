"use client";
import { handleSignIn, handleSignUp } from "@/lib/api";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickName, setNickName] = useState('')

  const router = useRouter()

  useEffect(() => {
    // Check if the token exists in localStorage 
    // (Update "token" to whatever key you use to store your auth token)
    const token = localStorage.getItem("token");
    console.log(token)
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="excal-canvas min-h-screen w-full overflow-x-hidden">

      {/* Top Right Navigation */}
      <nav className="fixed top-0 right-0 z-40 p-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="excal-btn excal-btn-accent"
        >
          login / sign up
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex min-h-screen flex-col items-center justify-center gap-10 p-6 pt-24 text-center lg:flex-row lg:gap-16 lg:pt-6">

        <div className="flex max-w-xl flex-col items-center gap-5 lg:items-start lg:text-left">
          <div className="excal-eyebrow">a scrappy little whiteboard</div>
          <h1 className="excal-title text-5xl sm:text-6xl">Tha QuickEdit</h1>
          <div className="excal-underline self-center lg:self-start" />
          <p className="excal-body max-w-md text-xl">
            sketch out ideas on an infinite canvas, draw boxes and arrows
            that actually feel hand-drawn, and share the board so your
            team can scribble on it with you — live.
          </p>
          <ul className="excal-list">
            <li>→ unlimited boards, saved to your account</li>
            <li>→ shapes, arrows & freehand strokes</li>
            <li>→ real-time collaboration, no refresh needed</li>
          </ul>
          <button
            onClick={() => setIsModalOpen(true)}
            className="excal-btn excal-btn-primary mt-2"
          >
            start sketching →
          </button>
        </div>

        {/* hand-drawn demo mock of the canvas */}
        <div className="excal-demo-frame">
          <svg viewBox="0 0 360 280" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            {/* rough rectangle */}
            <path
              d="M28 38 Q26 70 27 110 Q90 113 150 109 Q152 70 149 36 Q90 33 28 38 Z"
              fill="none"
              stroke="#b197fc"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* rough ellipse */}
            <ellipse cx="260" cy="75" rx="55" ry="38" fill="none" stroke="#66d9c2" strokeWidth="2.5"
              transform="rotate(-3 260 75)" />
            {/* arrow connecting them, hand-wobbled */}
            <path
              d="M152 78 Q190 60 205 76"
              fill="none"
              stroke="#e9e9e9"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path d="M198 70 L207 77 L196 82" fill="none" stroke="#e9e9e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {/* sticky note */}
            <rect x="55" y="155" width="120" height="85" rx="3" fill="#1e1e1e" stroke="#ffa94d" strokeWidth="2"
              transform="rotate(-2 115 197)" />
            <text x="70" y="190" fontFamily="Caveat, cursive" fontSize="17" fill="#ffa94d" transform="rotate(-2 115 197)">brainstorm</text>
            <text x="70" y="212" fontFamily="Caveat, cursive" fontSize="17" fill="#ffa94d" transform="rotate(-2 115 197)">v2 ideas</text>

            {/* freehand scribble line */}
            <path
              d="M210 175 Q225 160 245 178 Q262 196 282 172 Q298 152 315 175"
              fill="none"
              stroke="#ff8cc8"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* cursor pointer, like a collaborator drawing live */}
            <path d="M300 205 L318 250 L308 244 L300 262 Z" fill="#ff8cc8" />
            <text x="312" y="218" fontFamily="Caveat, cursive" fontSize="15" fill="#ff8cc8">maya</text>
          </svg>
          <div className="excal-demo-caption">your team, sketching together — live</div>
        </div>
      </main>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-[2px]">
          <div className="excal-modal relative w-full max-w-sm p-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="excal-close absolute top-3 right-4"
            >
              ✕
            </button>

            <h2 className="excal-title mb-6 text-center text-2xl">
              {isLogin ? "sign in" : "create account"}
            </h2>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {!isLogin && (
                <input
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setNickName(e.target.value) }}
                  type="text"
                  placeholder="nickname"
                  className="excal-input w-full"
                />
              )}
              <input
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEmail(e.target.value) }}
                type="email"
                placeholder="email"
                className="excal-input w-full"
              />
              <input
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPassword(e.target.value) }}
                type="password"
                placeholder="password"
                className="excal-input w-full"
              />
              <button
                onClick={async () => {
                  if (isLogin) {
                    const response: boolean = await handleSignIn(email, password)
                    if (response) {
                      router.replace('/dashboard')
                    }
                  }
                  else {
                    handleSignUp(email, password, nickName)
                  }
                }}
                type="submit"
                className="excal-btn excal-btn-primary w-full"
              >
                {isLogin ? "sign in" : "sign up"}
              </button>
            </form>

            <p className="excal-body mt-4 text-center text-base">
              {isLogin ? "don't have an account?" : "already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="excal-link"
              >
                {isLogin ? "sign up" : "sign in"}
              </button>
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&display=swap');

        :root {
          --excal-bg: #121212;
          --excal-bg-dot: #2a2a2a;
          --excal-panel: #1e1e1e;
          --excal-border: #4a4a4a;
          --excal-text: #e9e9e9;
          --excal-muted: #9b9b9b;
          --excal-violet: #b197fc;
          --excal-pink: #ff8cc8;
          --excal-teal: #66d9c2;
          --excal-orange: #ffa94d;
        }

        .excal-canvas {
          background-color: var(--excal-bg);
          background-image: radial-gradient(var(--excal-bg-dot) 1px, transparent 1px);
          background-size: 22px 22px;
          color: var(--excal-text);
          font-family: 'Caveat', cursive;
        }

        .excal-eyebrow {
          font-family: 'Caveat', cursive;
          font-size: 1.1rem;
          color: var(--excal-teal);
          border: 1.5px dashed var(--excal-teal);
          border-radius: 999px;
          padding: 0.2rem 0.9rem;
          transform: rotate(-1deg);
        }

        .excal-title {
          font-family: 'Caveat', cursive;
          font-weight: 700;
          color: var(--excal-text);
          letter-spacing: 0.5px;
          transform: rotate(-0.5deg);
          line-height: 1.05;
        }

        .excal-underline {
          width: 9rem;
          height: 6px;
          margin-top: -2px;
          border-radius: 3px;
          background: var(--excal-violet);
          opacity: 0.7;
          transform: rotate(-1deg);
        }

        .excal-body {
          font-family: 'Caveat', cursive;
          color: var(--excal-muted);
          line-height: 1.4;
        }

        .excal-list {
          font-family: 'Caveat', cursive;
          color: var(--excal-text);
          font-size: 1.15rem;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          opacity: 0.9;
        }

        .excal-demo-frame {
          position: relative;
          width: min(360px, 80vw);
          border-radius: 10px;
          border: 2px solid var(--excal-border);
          background: var(--excal-panel);
          box-shadow: 3px 5px 0px 0px rgba(0, 0, 0, 0.4);
          transform: rotate(0.6deg);
          padding: 0.75rem 0.75rem 0;
          overflow: hidden;
        }
        .excal-demo-frame::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 10px;
          border: 1.5px solid var(--excal-border);
          opacity: 0.3;
          transform: rotate(-0.6deg);
          pointer-events: none;
        }

        .excal-demo-caption {
          font-family: 'Caveat', cursive;
          font-size: 1rem;
          color: var(--excal-muted);
          text-align: center;
          padding: 0.4rem 0 0.7rem;
        }

        .excal-btn {
          font-family: 'Caveat', cursive;
          font-size: 1.15rem;
          font-weight: 700;
          padding: 0.5rem 1.4rem;
          border-radius: 6px;
          border: 2px solid var(--excal-border);
          background: transparent;
          color: var(--excal-text);
          cursor: pointer;
          transform: rotate(-0.6deg);
          transition: transform 0.12s ease, background 0.12s ease;
        }
        .excal-btn:hover {
          transform: rotate(0deg) scale(1.04);
        }
        .excal-btn-accent {
          border-color: var(--excal-teal);
          color: var(--excal-teal);
        }
        .excal-btn-accent:hover {
          background: rgba(102, 217, 194, 0.12);
        }
        .excal-btn-primary {
          border-color: var(--excal-violet);
          color: var(--excal-violet);
        }
        .excal-btn-primary:hover {
          background: rgba(177, 151, 252, 0.14);
        }

        .excal-modal {
          background: var(--excal-panel);
          border: 2.5px solid var(--excal-violet);
          border-radius: 10px;
          box-shadow: 4px 6px 0px 0px rgba(0, 0, 0, 0.5);
          transform: rotate(-0.4deg);
        }

        .excal-close {
          font-family: 'Caveat', cursive;
          font-size: 1.2rem;
          color: var(--excal-muted);
          background: none;
          border: none;
          cursor: pointer;
        }
        .excal-close:hover {
          color: var(--excal-pink);
        }

        .excal-input {
          font-family: 'Caveat', cursive;
          font-size: 1.15rem;
          background: var(--excal-bg);
          border: 2px solid var(--excal-border);
          border-radius: 6px;
          padding: 0.6rem 0.8rem;
          color: var(--excal-text);
          outline: none;
        }
        .excal-input:focus {
          border-color: var(--excal-violet);
        }
        .excal-input::placeholder {
          color: var(--excal-muted);
        }

        .excal-link {
          font-family: 'Caveat', cursive;
          font-weight: 700;
          color: var(--excal-teal);
          text-decoration: underline;
          background: none;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}