'use client'
import axios from "axios"
import type { CanvasElement } from "@repo/types"
import { useBoardStore } from "./store"

export const handleSignIn = async(email:string,password:string)=>{


    try{

        const response = await axios.post("http://localhost:3000/api/auth/signin",{
            email,
            password
        })

        if(response.status === 200){
            localStorage.setItem('token', response.data.token)
            return true;
        }

        return false;

    }catch(err){
        if(err instanceof Error){
            console.log("error while signinin in ")
        }
        return false;
    }

}

export const handleSignUp = async (email: string, password: string, nickName:string) => {

    try {

        const response = await axios.post("http://localhost:3000/api/auth/signup",{
            email,
            password,
            nickName
        })


    } catch (err) {
        if (err instanceof Error) {
            console.log("error while signinin in ")
        }
        return false
    }

}

export const handleAddTitle = async(title:string)=>{
    try{
        const response = await axios.post("http://localhost:3000/api/boards",{
            title
        },{
            headers:{
                Authorization:`Bearer ${localStorage.getItem('token')}`
            }
        })
    }
    catch(err){
        if(err instanceof Error){
            console.log(err.message)
        }
    }
}

export const handleSync = async()=>{
    console.log("called")

    const boardId = useBoardStore.getState().id;
    const elements = useBoardStore.getState().elements;
    const zoom = useBoardStore.getState().appState.zoom;
    const scrollX = useBoardStore.getState().appState.scrollX;
    const scrollY = useBoardStore.getState().appState.scrollY;
    const backgroundColor = useBoardStore.getState().appState.backgroundColor;

    try{
        const response = await axios.post(`http://localhost:3000/api/boards/${boardId}/sync`,{
            elements,
            zoom,
            scrollX,
            scrollY,
            backgroundColor
        },{
            headers:{
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.data.message === "Sync successful"){
            return true;
        }
    }
    catch(err){
        if(err instanceof Error){
            console.log(err.message);
        }

        return false;
    }
}