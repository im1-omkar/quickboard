import Board from "./Board";
import AuthProtection from "@/components/authProtection";


export default async function Page() {
   
    return <AuthProtection>
        <Board ></Board>
     </AuthProtection>
}
