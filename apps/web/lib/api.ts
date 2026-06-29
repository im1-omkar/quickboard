'use client'
import axios from "axios"

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

