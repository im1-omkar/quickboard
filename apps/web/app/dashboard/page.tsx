'use client'
import AuthProtection from '@/components/authProtection'
import { handleAddTitle } from '@/lib/api';
import { CanvasElement } from '@repo/types';
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation'
import { useState } from 'react';

interface Board {
  "id": string,
  "title": string,
  "ownerId": string,
  "elements": CanvasElement[],
  "zoom": number,
  "scrollX": number,
  "scrollY": number,
  "backgroundColor": string,
  "createdAt": string,
  "updatedAt": string
}

const queryClient = new QueryClient();

// a few fixed "hand jitter" rotations so cards don't look machine-stamped,
// but stay stable across re-renders (no Math.random in render)
const JITTER = [-1.5, 1, -0.75, 1.5, -1, 0.5, -1.75, 1.25]
const getJitter = (i: number) => JITTER[i % JITTER.length]

const Dashboard = () => {
  const [addingBoard, setAddingBoard] = useState(false)
  const [verified, setVerified] = useState(false);
  const router = useRouter()
  const [title, setTitle] = useState('')
  const queryClient = useQueryClient()


  const boards = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:3000/api/boards`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.status === 403 || response.status === 401) {
        router.push('/')
      }
      setVerified(true);
      return response.data
    }
  });

  const addTitleMutation = useMutation({
    mutationFn: handleAddTitle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })

  return (
    <AuthProtection>
      <div className="excal-canvas min-h-screen w-full">

        {!verified && (
          <div className="flex h-screen w-screen items-center justify-center">
            <div className="excal-loading">scribbling boards onto the canvas...</div>
          </div>
        )}

        {verified && (
          <>
            <div className="px-10 pt-10 pb-4">
              <h1 className="excal-title text-4xl">Boards</h1>
              <div className="excal-underline" />
            </div>

            {addingBoard && (
              <div
                onClick={() => { setAddingBoard(false) }}
                className="fixed inset-0 z-50 flex h-screen w-screen items-center justify-center bg-black/60 backdrop-blur-[2px]"
              >
                <div
                  onClick={(e) => { e.stopPropagation() }}
                  className="excal-modal flex h-80 w-120 flex-col items-center justify-center gap-3 p-6"
                >
                  <div className="excal-title text-2xl">add a board</div>
                  <input
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setTitle(e.target.value) }}
                    className="excal-input w-64"
                    type="text"
                    placeholder="name this board..."
                  />
                  <button
                    onClick={() => {
                      addTitleMutation.mutate(title)
                      setAddingBoard(false)
                    }}
                    className="excal-btn excal-btn-accent mt-4"
                  >
                    + add board
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-8 p-10 sm:grid-cols-3 lg:grid-cols-4">
              {boards.data?.map((board: Board, i: number) => (
                <div
                  onClick={()=>{router.push(`/board/${board.id}`)}}
                  key={board.id}
                  style={{ '--tilt': `${getJitter(i)}deg` } as React.CSSProperties}
                  className="excal-card excal-card-fill flex h-48 w-48 items-center justify-center p-3 text-center"
                >
                  <span className="excal-card-label">{board.title}</span>
                </div>
              ))}

              <div
                onClick={() => { setAddingBoard(true) }}
                style={{ '--tilt': `${getJitter((boards.data?.length ?? 0))}deg` } as React.CSSProperties}
                className="excal-card excal-card-add flex h-48 w-48 items-center justify-center"
              >
                <Plus className="excal-plus h-12 w-12" strokeWidth={2.5} />
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Virgil&family=Caveat:wght@500;700&display=swap');

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

        .excal-title {
          font-family: 'Caveat', cursive;
          font-weight: 700;
          color: var(--excal-text);
          letter-spacing: 0.5px;
          transform: rotate(-0.5deg);
        }

        .excal-underline {
          width: 9rem;
          height: 6px;
          margin-top: 2px;
          border-radius: 3px;
          background: var(--excal-violet);
          opacity: 0.7;
          transform: rotate(-1deg);
        }

        .excal-loading {
          font-family: 'Caveat', cursive;
          font-size: 1.5rem;
          color: var(--excal-muted);
        }

        /* sketchy hand-drawn border, doubled lines like an excalidraw "rough" stroke */
        .excal-card {
          position: relative;
          cursor: pointer;
          border-radius: 9px;
          border: 2px solid var(--excal-border);
          background: var(--excal-panel);
          transform: rotate(var(--tilt, 0deg));
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 2px 3px 0px 0px rgba(0, 0, 0, 0.35);
        }

        .excal-card::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 9px;
          border: 1.5px solid var(--excal-border);
          opacity: 0.35;
          transform: rotate(0.7deg);
          pointer-events: none;
        }

        .excal-card:hover {
          transform: rotate(0deg) scale(1.035);
          box-shadow: 3px 5px 0px 0px rgba(0, 0, 0, 0.45);
        }

        .excal-card-fill {
          border-color: var(--excal-violet);
        }
        .excal-card-fill:hover {
          border-color: var(--excal-pink);
        }
        .excal-card-fill::after {
          border-color: var(--excal-violet);
        }

        .excal-card-label {
          font-family: 'Caveat', cursive;
          font-size: 1.4rem;
          font-weight: 600;
          color: var(--excal-text);
          word-break: break-word;
        }

        .excal-card-add {
          border-style: dashed;
          border-color: var(--excal-muted);
          background: transparent;
        }
        .excal-card-add::after {
          border-style: dashed;
          border-color: var(--excal-muted);
        }
        .excal-card-add:hover {
          border-color: var(--excal-teal);
        }
        .excal-card-add:hover .excal-plus {
          color: var(--excal-teal);
        }

        .excal-plus {
          color: var(--excal-muted);
          transition: color 0.15s ease;
        }

        .excal-modal {
          background: var(--excal-panel);
          border: 2.5px solid var(--excal-violet);
          border-radius: 10px;
          box-shadow: 4px 6px 0px 0px rgba(0, 0, 0, 0.5);
          transform: rotate(-0.4deg);
        }

        .excal-input {
          font-family: 'Caveat', cursive;
          font-size: 1.2rem;
          background: var(--excal-bg);
          border: 2px solid var(--excal-border);
          border-radius: 6px;
          padding: 0.4rem 0.7rem;
          color: var(--excal-text);
          outline: none;
        }
        .excal-input:focus {
          border-color: var(--excal-violet);
        }
        .excal-input::placeholder {
          color: var(--excal-muted);
        }

        .excal-btn {
          font-family: 'Caveat', cursive;
          font-size: 1.2rem;
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
      `}</style>
    </AuthProtection>
  )
}

const Page = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  )
}

export default Page