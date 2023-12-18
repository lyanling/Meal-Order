import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import style from "../../style/LoginSignUp/LoginSignUpForm.module.css";
import { BACKEND_URL } from '../../constant';
import type { LoginInput } from "../../type";

export default function LoginForm({ identity, handleActive }: { identity: "customer" | "vendor", handleActive: (e: React.MouseEvent) => void }) {
    const text = identity === "customer" ? "顧客登入" : "商家登入";
    const defaultemail = "lawrence0999@gmail.com";
    const defaultpassword = identity === "customer" ? "LLL" : "tttt";
    const [userInput, setUserInput] = useState<LoginInput>({
        email: defaultemail,
        password: defaultpassword
    });
    const [error, setError] = useState<Boolean>(false);
    const navigate = useNavigate();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<number | undefined> => {
        e.preventDefault();
        const url = `${BACKEND_URL}/login`;
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...userInput,
                identity: identity
            })
        }).then((res) => { return res.json(); });
        return new Promise((resolve, reject) => {
            if (res !== null) resolve(res.id);
            else reject();
        });
    }
    return (
        <form className={identity === "customer" ?
            `${style.LoginForm} ${style.customer}` :
            `${style.LoginForm} ${style.vendor}`} onSubmit={async (e) => {
                try {
                    const id = await handleSubmit(e);
                    navigate(`${identity}/${id}`);
                } catch (error) {
                    setError(true);
                }
            }}>
            <h1> {text} </h1>
            <label>
                <input defaultValue={defaultemail} type="email" name="account" placeholder="Email" onChange={e => setUserInput({ ...userInput, email: e.currentTarget.value })} />
            </label>
            <label>
                <input defaultValue={defaultpassword} type="password" name="password" placeholder="Password" onChange={e => setUserInput({ ...userInput, password: e.currentTarget.value })} />
            </label>
            {error && <h3 className={style.errormsg}> Email / password 錯誤</h3>}
            <input className={style.submitbtn} type="submit" value="Submit" />
            <button type="button" className={style.changebtn} onClick={handleActive}>{identity === "customer" ? "我是商家" : "我是顧客"}</button>
        </form>
    );
}