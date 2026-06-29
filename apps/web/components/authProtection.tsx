'use client'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { ReactNode, useEffect } from 'react'

const AuthProtection = ({
    children
}:{
    children:ReactNode
}) => {
  const router = useRouter();

  useEffect(()=>{
    const token = localStorage.getItem('token');
    if(!token){
        router.push('/')
    }
  },[])

  return (
    <div>
        {children}
    </div>
  )
}

export default AuthProtection