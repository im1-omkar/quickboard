"use client";
import { handleSignIn, handleSignUp } from "@/lib/api";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const [email,setEmail] = useState('')
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
    <div className="min-h-screen bg-gray-50">
      {/* Top Right Navigation */}
      <nav className="fixed top-0 right-0 p-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Login / Sign Up
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center min-h-screen text-center space-y-6 p-6">
        <h1 className="text-5xl font-bold text-gray-900">Tha QuickEdit</h1>
        <p className="text-xl text-gray-600 max-w-lg">
          A powerful virtual whiteboard clone of Excalidraw. Sketch your ideas,
          create diagrams, and collaborate in real-time.
        </p>
      </main>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center">
              {isLogin ? "Sign In" : "Create Account"}
            </h2>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {!isLogin && (
                <input
                  onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{setNickName(e.target.value)}}
                  type="text"
                  placeholder="NickName"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
              <input
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEmail(e.target.value) }}
                type="email"
                placeholder="Email"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPassword(e.target.value) }}
                type="password"
                placeholder="Password"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={async () => {
                  if(isLogin){
                    const response:boolean = await handleSignIn(email, password) 
                    if(response){
                      router.replace('/dashboard')
                    }
                  } 
                  else{
                    handleSignUp(email, password, nickName)
                  } 
                }}
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
              >
                {isLogin ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 font-semibold underline"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}