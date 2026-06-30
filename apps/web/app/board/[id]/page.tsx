'use client'
import { useEffect } from "react";
import Board from "./Board";
import AuthProtection from "@/components/authProtection";


export default  function Page() {

   
    return <AuthProtection>
        <Board ></Board>
     </AuthProtection>
}
