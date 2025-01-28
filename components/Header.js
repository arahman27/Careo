import Link from 'next/link'
import Image from 'next/image'

import { logoutUser } from '@/lib/authenticate';

import { useAtom } from "jotai";
import { userAtom } from "@/store";
import { useRouter } from "next/router";

import TabNavigation from "@/components/TabNavigation";


export default function Header() {
    const [userData, setUserData] = useAtom(userAtom);
    const router = useRouter();

    function handleLogout(e) {
        e.preventDefault();
        logoutUser();
        router.push('/');
        setUserData({});
    }
        
    return (
        <>
            <div style={{height:"40px"}}className="spacer"></div>
            <div id="header">
                <Link href="/"><Image width="32" height="32" src="/assets/templogo.png" alt="Careo Logo"></Image></Link>
                {userData && userData.email ? <span>Welcome, <b>{userData.email.split('@')[0]}</b> <a href='' style={{fontSize: '0.8em'}} onClick={handleLogout}>Logout</a></span> : null}
            </div>
            {userData.age > 0 && userData.email ? <TabNavigation/> : null}
        </>
    )
}