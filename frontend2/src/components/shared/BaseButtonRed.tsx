import style from "../../style/shared/BaseButtonRed.module.css";

export default function BaseButton({text, onClickFunc}: {text: string, onClickFunc: any}) {
   
    return (
          <div className={style.baseButton_button} onClick={onClickFunc}>
            {text}
          </div>
        );
}