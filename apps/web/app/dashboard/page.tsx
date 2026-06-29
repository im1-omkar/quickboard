'use client'
import AuthProtection from '@/components/authProtection'
import { CanvasElement } from '@repo/types';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import axios from 'axios';
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react';

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

const Dashboard = () => {
  const [verified,setVerified] = useState(false);
  const router = useRouter()

  const boards = useQuery({
    queryKey: ['dashboards'],
    queryFn: async ()=>{
      const response = await axios.get("http://localhost:3000/api/boards",{
        headers:{
          Authorization: `Bearer ${localStorage.getItem('token') }`
        }
      })

      if (response.status === 403 || response.status === 401) {
        router.push('/')
      }

      setVerified(true);
      return response.data
    }
  });

  return (
    
    <AuthProtection>
      {
          !verified &&  <div>Loading...</div>
      }
      {
        verified && <div>
          {
            boards.data.map((board:Board) => {
              return <div key={board.id}>
                {board.title}
              </div>
            })
          }
        </div> 
      }
    </AuthProtection>
    
  )
}

const Page = ()=>{
  return <QueryClientProvider client={queryClient}>
    <Dashboard/>
  </QueryClientProvider>
}

export default Page