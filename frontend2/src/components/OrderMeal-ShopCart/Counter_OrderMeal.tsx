/**
 * About the Counter for the Order Meal Page.
 */

import { CgAdd, CgRemove } from "react-icons/cg";
import style from "../../style/shared/Counter.module.css";

export default function Counter({count, setCount, maxinv}: 
                                {count: number, setCount: (c: number)=>void, maxinv: number}) {
    
    const handleInput = (text: any) => {
        const number = Number(text);
        if (!isNaN(number)){
            setCount(number);
            // console.log("count updated");
        }
    };
    
    return (
        <div className={style.counter_buttons}>
            <span
                onClick={() => { setCount(Math.max(0, count-1));}}
                className={style.counter_plus}
            >
                <CgRemove />
            </span>
            
            <span className={style.counter_number} contentEditable 
                suppressContentEditableWarning={true}
                onInput={(e) => handleInput(e.currentTarget.textContent)} >{count}
            </span>
            
            <span
            onClick={() => { setCount(Math.min(maxinv, count+1));}}
            className={style.counter_minus}
            >
            <CgAdd />
            </span>
        
        </div>
    );
}