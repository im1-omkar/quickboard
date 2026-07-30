'use client'
import axios from "axios"
import { useBoardStore } from "./store"
import toast from "react-hot-toast"

const HTTP_URL = process.env.NEXT_PUBLIC_HTTP_URL;

export const handleSignIn = async(email:string,password:string)=>{


    try{

        const response = await axios.post(`${HTTP_URL}/api/auth/signin`,{
            email,  
            password
        })

        if(response.status === 200){
            localStorage.setItem('token', response.data.token)
            toast.success("Sign In Successful! redirecting...")
            return true;
        }

        return false;

    }catch(err){
        if(err instanceof Error){
            console.log("error while signinin in ")
        }
        toast.error("error while Signining In")
        return false;
    }

}

export const handleSignUp = async (email: string, password: string, nickName:string) => {

    try {

        await axios.post(`${HTTP_URL}/api/auth/signup`,{
            email,
            password,
            nickName
        })
        toast.success('Sign Up successful!');


    } catch (err) {
        if (err instanceof Error) {
            console.log("error while signinin up ")
        }
        toast.error("Error while Signing Up")
        return false;
    }

}

export const handleAddTitle = async(title:string)=>{
    try{
        await axios.post(`${HTTP_URL}/api/boards`,{
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
        const response = await axios.post(`${HTTP_URL}/api/boards/${boardId}/sync`,{
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