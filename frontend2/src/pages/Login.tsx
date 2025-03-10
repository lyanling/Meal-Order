import { useState } from "react";
import LoginForm from "../components/LoginSignUp/LoginForm";
import style from "../style/LoginSignUp/LoginSignUp.module.css";

export default function Login() {
    const [active, setActive] = useState(false);
    const handleActive = (e: React.MouseEvent) => {
        e.stopPropagation();
        setActive(!active);
    }
    return (
        <div className={style.Login}>
            <div className={active ? `${style.inner} ${style.active}` : `${style.inner}`}>
                <div className={`${style.container} ${style.front}`}>
                    <LoginForm identity={"customer"} handleActive={handleActive} />
                </div>
                <div className={`${style.container} ${style.back}`}>
                    <LoginForm identity={"vendor"} handleActive={handleActive} />
                </div>
            </div>
        </div>
    );
}